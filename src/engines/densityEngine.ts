import type {
  GpuCard,
  ProfileSeries,
  VgpuProfile,
  WorkloadType,
} from '../types/gpu';
import { SERIES_INFO } from '../types/gpu';
import type {
  DensityInput,
  DensityResult,
  RecommendationResult,
  ReverseAllGpusResult,
  ReversePlanResult,
} from '../types/results';

/**
 * Derives a vGPU profile object from a GPU card and profile parameters.
 */
export function deriveProfile(
  gpu: GpuCard,
  series: ProfileSeries,
  vramGb: number
): VgpuProfile {
  const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;
  const maxInstances = Math.floor(vramPerGpu / vramGb);
  const info = SERIES_INFO[series];

  // Build Horizon profile string (e.g. nvidia_l40s-4q)
  const gpuSlug = gpu.id;
  const profileKey = `${vramGb}${series.toLowerCase()}`;
  const horizonString = `nvidia_${gpuSlug}-${profileKey}`;

  return {
    id: `${gpu.id}-${vramGb}${series.toLowerCase()}`,
    gpuId: gpu.id,
    series,
    vram_gb: vramGb,
    vram_per_gpu_gb: vramPerGpu,
    horizonString,
    maxInstances,
    maxDisplays: info.maxDisplays,
    maxResolution: info.maxResolution,
    license: info.license,
    useCase: info.useCase,
    fps: info.fps,
    features: info.features,
  };
}

/**
 * Returns all available vGPU profiles for a GPU card, optionally filtered by series.
 */
export function getProfilesForGpu(
  gpu: GpuCard,
  seriesFilter?: ProfileSeries[]
): VgpuProfile[] {
  const profiles: VgpuProfile[] = [];
  const seriesMap: Record<ProfileSeries, number[]> = {
    Q: gpu.q_profile_sizes_gb,
    B: gpu.b_profile_sizes_gb,
    A: gpu.a_profile_sizes_gb,
    C: gpu.c_profile_sizes_gb,
  };

  const seriesToProcess =
    seriesFilter ?? (['Q', 'B', 'A', 'C'] as ProfileSeries[]);

  for (const series of seriesToProcess) {
    const sizes = seriesMap[series];
    for (const size of sizes) {
      profiles.push(deriveProfile(gpu, series, size));
    }
  }

  return profiles;
}

/**
 * Calculates VM density for a given profile and deployment configuration.
 */
export function calculateDensity(input: DensityInput): DensityResult {
  const {
    profile,
    pcieSlotsPerHost,
    gpuCountPerHost,
    hostCount,
    slotWidth,
    gpuCountPerCard,
    vramPerGpu,
  } = input;

  // Physical card fit: SW (slot_width=1) allows more cards per host
  const maxCardsFromSlots = Math.floor(pcieSlotsPerHost / slotWidth);
  const maxCardsPerHost = Math.min(
    maxCardsFromSlots,
    Math.ceil(gpuCountPerHost / gpuCountPerCard)
  );

  const totalGpusPerHost = maxCardsPerHost * gpuCountPerCard;
  const instancesPerGpu = Math.floor(vramPerGpu / profile.vram_gb);
  const instancesPerHost = instancesPerGpu * totalGpusPerHost;
  const instancesPerCluster = instancesPerHost * hostCount;
  const framebufferUtilization =
    (instancesPerGpu * profile.vram_gb) / vramPerGpu;
  const totalVramPerHost = totalGpusPerHost * vramPerGpu;
  const vramUsedPerHost = instancesPerHost * profile.vram_gb;

  return {
    profile,
    maxCardsPerHost,
    totalGpusPerHost,
    instancesPerGpu,
    instancesPerHost,
    instancesPerCluster,
    framebufferUtilization,
    totalVramPerHost,
    vramUsedPerHost,
  };
}

/**
 * Returns top profile recommendations for a given GPU and workload type.
 */
export function getRecommendations(
  gpu: GpuCard,
  workloadType: WorkloadType,
  pcieSlotsPerHost: number,
  hostCount: number
): RecommendationResult[] {
  const seriesMap: Record<WorkloadType, ProfileSeries[]> = {
    workstation: ['Q'],
    knowledge_worker: ['B', 'Q'],
    compute: ['A', 'C'],
  };

  const targetSeries = seriesMap[workloadType];
  const profiles = getProfilesForGpu(gpu, targetSeries);
  const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;

  const results: RecommendationResult[] = profiles.map((profile) => {
    const densityResult = calculateDensity({
      profile,
      pcieSlotsPerHost,
      gpuCountPerHost: gpu.gpu_count_per_card,
      hostCount,
      slotWidth: gpu.slot_width,
      gpuCountPerCard: gpu.gpu_count_per_card,
      vramPerGpu,
    });

    const reasoning: string[] = [];
    let score = 0;

    // Score based on workload type
    if (workloadType === 'workstation') {
      if (profile.vram_gb >= 8) {
        score += 30;
        reasoning.push(
          `${profile.vram_gb}GB VRAM supports demanding 3D/CAD applications`
        );
      }
      if (profile.vram_gb >= 16) {
        score += 20;
        reasoning.push('Supports 4K+ multi-display professional workflows');
      }
      if (profile.series === 'Q') {
        score += 25;
        reasoning.push(
          'Q-series includes RTX features for professional renderers'
        );
      }
    } else if (workloadType === 'knowledge_worker') {
      // Prefer higher density for knowledge worker
      score += densityResult.instancesPerGpu * 5;
      if (profile.vram_gb <= 4) {
        score += 20;
        reasoning.push('Small profile maximizes VM density per GPU');
      }
      if (profile.series === 'B') {
        score += 15;
        reasoning.push(
          'vPC license is cost-effective for office productivity users'
        );
      }
    } else {
      // compute
      if (profile.vram_gb >= 16) {
        score += 35;
        reasoning.push('Large framebuffer enables bigger AI/ML model fits');
      }
      if (profile.series === 'A') {
        score += 20;
        reasoning.push('A-series optimized for compute throughput');
      }
    }

    // Density bonus
    score += Math.min(densityResult.instancesPerGpu * 2, 20);
    reasoning.push(
      `Provides ${densityResult.instancesPerGpu} VMs per GPU (${densityResult.instancesPerCluster} total in cluster)`
    );

    return {
      profile,
      score,
      reasoning,
      workloadType,
      densityResult,
    };
  });

  // Sort by score descending and return top 3
  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Reverse capacity plan: given a target VM count, calculate the minimum hardware
 * required per profile. Returns results sorted by hostsNeeded ascending (most efficient first).
 */
export function reverseCapacityPlan(
  gpu: GpuCard,
  vmTarget: number,
  pcieSlotsPerHost: number,
  seriesFilter?: ProfileSeries[]
): ReversePlanResult[] {
  const profiles = getProfilesForGpu(gpu, seriesFilter);
  const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;
  const maxCardsFromSlots = Math.floor(pcieSlotsPerHost / gpu.slot_width);
  const maxCardsPerHost = Math.min(
    maxCardsFromSlots,
    Math.ceil(gpu.gpu_count_per_card / gpu.gpu_count_per_card)
  );
  const totalGpusPerHost = maxCardsPerHost * gpu.gpu_count_per_card;

  const results: ReversePlanResult[] = profiles.map((profile) => {
    const instancesPerGpu = Math.floor(vramPerGpu / profile.vram_gb);
    const instancesPerHost = instancesPerGpu * totalGpusPerHost;
    const hostsNeeded =
      instancesPerHost > 0
        ? Math.ceil(vmTarget / instancesPerHost)
        : Number.POSITIVE_INFINITY;
    const gpusNeeded = hostsNeeded * totalGpusPerHost;
    const cardsNeeded = hostsNeeded * maxCardsPerHost;
    const gpuUtilization =
      hostsNeeded > 0 && instancesPerHost > 0
        ? vmTarget / (hostsNeeded * instancesPerHost)
        : 0;

    return {
      profile,
      hostsNeeded: Number.isFinite(hostsNeeded) ? hostsNeeded : 0,
      gpusNeeded,
      cardsNeeded,
      instancesPerHost,
      gpuUtilization,
    };
  });

  return results
    .filter((r) => r.instancesPerHost > 0)
    .sort((a, b) => a.hostsNeeded - b.hostsNeeded);
}

/**
 * Cross-GPU reverse capacity plan: given a target VM count and a desired profile spec,
 * returns all GPUs in the catalog that support the profile, with hardware requirements.
 * Sorted by hostsNeeded ASC (fewest hosts = most efficient), then gpusNeeded ASC.
 */
export function reverseCapacityPlanAllGpus(
  allGpus: GpuCard[],
  vmTarget: number,
  pcieSlotsPerHost: number,
  targetSeries: ProfileSeries,
  targetVramGb: number
): ReverseAllGpusResult[] {
  const results: ReverseAllGpusResult[] = [];

  for (const gpu of allGpus) {
    const seriesKey = `${targetSeries.toLowerCase()}_profile_sizes_gb` as
      | 'q_profile_sizes_gb'
      | 'b_profile_sizes_gb'
      | 'a_profile_sizes_gb'
      | 'c_profile_sizes_gb';
    const sizes = gpu[seriesKey] as number[];
    if (!sizes.includes(targetVramGb)) continue;

    const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;
    if (vramPerGpu < targetVramGb) continue;

    const profile = deriveProfile(gpu, targetSeries, targetVramGb);
    const maxCardsPerHost = Math.floor(pcieSlotsPerHost / gpu.slot_width);
    const totalGpusPerHost = maxCardsPerHost * gpu.gpu_count_per_card;
    const instancesPerGpu = Math.floor(vramPerGpu / targetVramGb);
    const instancesPerHost = instancesPerGpu * totalGpusPerHost;

    if (instancesPerHost === 0) continue;

    const hostsNeeded = Math.ceil(vmTarget / instancesPerHost);
    const gpusNeeded = hostsNeeded * totalGpusPerHost;
    const cardsNeeded = hostsNeeded * maxCardsPerHost;
    const gpuUtilization = vmTarget / (hostsNeeded * instancesPerHost);

    results.push({
      gpu,
      profile,
      hostsNeeded,
      gpusNeeded,
      cardsNeeded,
      instancesPerHost,
      gpuUtilization,
    });
  }

  return results.sort(
    (a, b) => a.hostsNeeded - b.hostsNeeded || a.gpusNeeded - b.gpusNeeded
  );
}
