import { describe, expect, it } from 'vitest';
import gpuData from '../data/gpus.json';
import type { GpuCard } from '../types/gpu';
import {
  calculateDensity,
  deriveProfile,
  getProfilesForGpu,
  getRecommendations,
} from './densityEngine';

function findGpu(id: string): GpuCard {
  const gpu = (gpuData as GpuCard[]).find((g) => g.id === id);
  if (!gpu) throw new Error(`GPU ${id} not found in test data`);
  return gpu;
}

const l40s = findGpu('l40s');
const t4 = findGpu('t4');
const a16 = findGpu('a16');

describe('deriveProfile', () => {
  it('derives correct Q profile for L40S', () => {
    const profile = deriveProfile(l40s, 'Q', 4);
    expect(profile.horizonString).toBe('nvidia_l40s-4q');
    expect(profile.maxInstances).toBe(12); // 48GB / 4GB
    expect(profile.series).toBe('Q');
    expect(profile.vram_gb).toBe(4);
  });

  it('derives Q-48 profile for L40S (full GPU)', () => {
    const profile = deriveProfile(l40s, 'Q', 48);
    expect(profile.maxInstances).toBe(1);
    expect(profile.horizonString).toBe('nvidia_l40s-48q');
  });

  it('derives B profile correctly', () => {
    const profile = deriveProfile(l40s, 'B', 1);
    expect(profile.series).toBe('B');
    expect(profile.license).toBe('NVIDIA vPC');
    expect(profile.maxDisplays).toBe(2);
  });
});

describe('getProfilesForGpu', () => {
  it('returns all profiles when no filter', () => {
    const profiles = getProfilesForGpu(l40s);
    // Q: 10, B: 2, A: 10, C: 7 = 29
    expect(profiles.length).toBeGreaterThan(20);
  });

  it('filters by series', () => {
    const qProfiles = getProfilesForGpu(l40s, ['Q']);
    expect(qProfiles.every((p) => p.series === 'Q')).toBe(true);
    expect(qProfiles.length).toBe(10); // 10 Q sizes for L40S
  });

  it('returns no C profiles for T4 (none defined)', () => {
    const cProfiles = getProfilesForGpu(t4, ['C']);
    expect(cProfiles.length).toBe(0);
  });
});

describe('calculateDensity', () => {
  it('SW GPU (T4): 8 slots → 8 cards × 4 VMs = 32 VMs/host with 4q', () => {
    const profile = deriveProfile(t4, 'Q', 4);
    const result = calculateDensity({
      profile,
      pcieSlotsPerHost: 8,
      gpuCountPerHost: 8,
      hostCount: 10,
      slotWidth: 1,
      gpuCountPerCard: 1,
      vramPerGpu: 16,
    });
    expect(result.maxCardsPerHost).toBe(8); // 8 slots / 1 slot-width
    expect(result.totalGpusPerHost).toBe(8);
    expect(result.instancesPerGpu).toBe(4); // 16GB / 4GB
    expect(result.instancesPerHost).toBe(32);
    expect(result.instancesPerCluster).toBe(320);
  });

  it('DW GPU (L40S): 8 slots → 4 cards × 12 VMs = 48 VMs/host with 4q', () => {
    const profile = deriveProfile(l40s, 'Q', 4);
    const result = calculateDensity({
      profile,
      pcieSlotsPerHost: 8,
      gpuCountPerHost: 4,
      hostCount: 10,
      slotWidth: 2,
      gpuCountPerCard: 1,
      vramPerGpu: 48,
    });
    expect(result.maxCardsPerHost).toBe(4); // 8 slots / 2 slot-width
    expect(result.totalGpusPerHost).toBe(4);
    expect(result.instancesPerGpu).toBe(12); // 48GB / 4GB
    expect(result.instancesPerHost).toBe(48);
    expect(result.instancesPerCluster).toBe(480);
  });

  it('Multi-GPU card (A16, 4 GPUs/card): 8 slots → 4 cards × 16 GPUs × 4 VMs = 64 VMs/host with 4q', () => {
    const vramPerGpu = a16.vram_gb / a16.gpu_count_per_card; // 64/4 = 16GB
    const profile = deriveProfile(a16, 'Q', 4);
    const result = calculateDensity({
      profile,
      pcieSlotsPerHost: 8,
      gpuCountPerHost: 16,
      hostCount: 10,
      slotWidth: 2,
      gpuCountPerCard: 4,
      vramPerGpu,
    });
    expect(result.maxCardsPerHost).toBe(4); // 8 slots / 2
    expect(result.totalGpusPerHost).toBe(16); // 4 cards × 4 GPUs
    expect(result.instancesPerGpu).toBe(4); // 16GB / 4GB
    expect(result.instancesPerHost).toBe(64);
    expect(result.instancesPerCluster).toBe(640);
  });

  it('Framebuffer utilization is 100% for single-instance profiles', () => {
    const profile = deriveProfile(l40s, 'Q', 48);
    const result = calculateDensity({
      profile,
      pcieSlotsPerHost: 4,
      gpuCountPerHost: 4,
      hostCount: 5,
      slotWidth: 2,
      gpuCountPerCard: 1,
      vramPerGpu: 48,
    });
    expect(result.framebufferUtilization).toBe(1.0);
  });
});

describe('getRecommendations', () => {
  it('returns at most 3 recommendations', () => {
    const recs = getRecommendations(l40s, 'workstation', 8, 10);
    expect(recs.length).toBeLessThanOrEqual(3);
  });

  it('recommends Q-series for workstation workload', () => {
    const recs = getRecommendations(l40s, 'workstation', 8, 10);
    expect(recs.every((r) => r.profile.series === 'Q')).toBe(true);
  });

  it('recommends A or C series for compute workload', () => {
    const recs = getRecommendations(l40s, 'compute', 8, 10);
    expect(
      recs.every((r) => r.profile.series === 'A' || r.profile.series === 'C')
    ).toBe(true);
  });

  it('returns scores in descending order', () => {
    const recs = getRecommendations(l40s, 'knowledge_worker', 8, 10);
    for (let i = 1; i < recs.length; i++) {
      const prev = recs[i - 1];
      const curr = recs[i];
      if (prev && curr) {
        expect(prev.score).toBeGreaterThanOrEqual(curr.score);
      }
    }
  });
});
