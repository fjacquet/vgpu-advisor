import { useMemo } from 'react';
import gpuData from '../data/gpus.json';
import { getProfilesForGpu } from '../engines/densityEngine';
import { useConfigStore } from '../store/configStore';
import type { GpuCard, VgpuProfile } from '../types/gpu';

export function useFilteredProfiles(): VgpuProfile[] {
  const { selectedGpuId, selectedSeries } = useConfigStore();

  return useMemo(() => {
    if (!selectedGpuId) return [];

    const gpu = (gpuData as GpuCard[]).find((g) => g.id === selectedGpuId);
    if (!gpu) return [];

    const filter = selectedSeries.length > 0 ? selectedSeries : undefined;
    return getProfilesForGpu(gpu, filter);
  }, [selectedGpuId, selectedSeries]);
}
