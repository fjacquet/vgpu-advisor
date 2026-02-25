import { useMemo } from 'react';
import gpuData from '../data/gpus.json';
import { calculateDensity, deriveProfile } from '../engines/densityEngine';
import { useConfigStore } from '../store/configStore';
import type { GpuCard, ProfileSeries } from '../types/gpu';
import type { DensityResult } from '../types/results';

export function useDensityCalc(profileId?: string): DensityResult | null {
  const { selectedGpuId, pcieSlotsPerHost, gpuCountPerHost, hostCount } =
    useConfigStore();

  return useMemo(() => {
    if (!selectedGpuId || !profileId) return null;

    const gpu = (gpuData as GpuCard[]).find((g) => g.id === selectedGpuId);
    if (!gpu) return null;

    const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;

    // Parse profile ID: {gpuId}-{size}{series} e.g. "l40s-4q"
    const match = profileId.match(/^.+-(\d+)([qbac])$/);
    if (!match) return null;

    const [, sizeStr, seriesLower] = match;
    const size = Number.parseInt(sizeStr, 10);
    const series = seriesLower.toUpperCase() as ProfileSeries;

    const profile = deriveProfile(gpu, series, size);

    return calculateDensity({
      profile,
      pcieSlotsPerHost,
      gpuCountPerHost,
      hostCount,
      slotWidth: gpu.slot_width,
      gpuCountPerCard: gpu.gpu_count_per_card,
      vramPerGpu,
    });
  }, [selectedGpuId, profileId, pcieSlotsPerHost, gpuCountPerHost, hostCount]);
}
