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
