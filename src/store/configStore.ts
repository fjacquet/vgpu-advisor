import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ProfileSeries, WorkloadType } from '../types/gpu';
import { loadFromUrl, saveToUrl } from './urlStorage';

interface ConfigState {
  // GPU selection
  selectedGpuId: string | null;
  setSelectedGpuId: (id: string | null) => void;

  // Profile filtering
  selectedSeries: ProfileSeries[];
  setSelectedSeries: (series: ProfileSeries[]) => void;
  toggleSeries: (series: ProfileSeries) => void;

  // Deployment config
  pcieSlotsPerHost: number;
  setPcieSlotsPerHost: (count: number) => void;

  gpuCountPerHost: number;
  setGpuCountPerHost: (count: number) => void;

  hostCount: number;
  setHostCount: (count: number) => void;

  vmTarget: number;
  setVmTarget: (count: number) => void;

  workloadType: WorkloadType;
  setWorkloadType: (type: WorkloadType) => void;

  clusterType: 'vdi' | 'vsphere8' | 'vsphere9' | 'ocp';
  setClusterType: (type: 'vdi' | 'vsphere8' | 'vsphere9' | 'ocp') => void;

  // Capacity Plan profile selection (no-GPU mode)
  capacitySeries: ProfileSeries;
  setCapacitySeries: (series: ProfileSeries) => void;
  capacityVramGb: number;
  setCapacityVramGb: (gb: number) => void;
  maxVmsPerPod: number;
  setMaxVmsPerPod: (count: number) => void;
  podsPerSuperpod: number;
  setPodsPerSuperpod: (count: number) => void;

  // UI state
  activeTab: 'profiles' | 'density' | 'recommendations' | 'config';
  setActiveTab: (
    tab: 'profiles' | 'density' | 'recommendations' | 'config'
  ) => void;
}

function getInitialState() {
  const fromUrl = loadFromUrl();
  return {
    selectedGpuId: fromUrl?.selectedGpuId ?? null,
    selectedSeries:
      (fromUrl?.selectedSeries as ProfileSeries[]) ??
      (['Q', 'B', 'A', 'C'] as ProfileSeries[]),
    pcieSlotsPerHost: fromUrl?.pcieSlotsPerHost ?? 8,
    gpuCountPerHost: fromUrl?.gpuCountPerHost ?? 4,
    hostCount: fromUrl?.hostCount ?? 10,
    vmTarget: fromUrl?.vmTarget ?? 100,
    workloadType: (fromUrl?.workloadType as WorkloadType) ?? 'workstation',
    capacitySeries: (fromUrl?.capacitySeries as ProfileSeries) ?? 'Q',
    capacityVramGb: fromUrl?.capacityVramGb ?? 4,
    maxVmsPerPod: fromUrl?.maxVmsPerPod ?? 2000,
    podsPerSuperpod: fromUrl?.podsPerSuperpod ?? 4,
    clusterType:
      (fromUrl?.clusterType as 'vdi' | 'vsphere8' | 'vsphere9' | 'ocp') ??
      'vdi',
  };
}

export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set) => ({
    ...getInitialState(),
    activeTab: 'profiles',

    setSelectedGpuId: (id) => set({ selectedGpuId: id }),
    setSelectedSeries: (series) => set({ selectedSeries: series }),
    toggleSeries: (series) =>
      set((state) => ({
        selectedSeries: state.selectedSeries.includes(series)
          ? state.selectedSeries.filter((s) => s !== series)
          : [...state.selectedSeries, series],
      })),

    setPcieSlotsPerHost: (count) => set({ pcieSlotsPerHost: count }),
    setGpuCountPerHost: (count) => set({ gpuCountPerHost: count }),
    setHostCount: (count) => set({ hostCount: count }),
    setVmTarget: (count) => set({ vmTarget: count }),
    setWorkloadType: (type) => set({ workloadType: type }),

    setCapacitySeries: (series) => set({ capacitySeries: series }),
    setCapacityVramGb: (gb) => set({ capacityVramGb: gb }),
    setMaxVmsPerPod: (count) => set({ maxVmsPerPod: count }),
    setPodsPerSuperpod: (count) => set({ podsPerSuperpod: count }),

    setClusterType: (type) => set({ clusterType: type }),

    setActiveTab: (tab) => set({ activeTab: tab }),
  }))
);

// Subscribe to state changes and persist to URL
useConfigStore.subscribe(
  (state) => ({
    selectedGpuId: state.selectedGpuId,
    selectedSeries: state.selectedSeries,
    pcieSlotsPerHost: state.pcieSlotsPerHost,
    gpuCountPerHost: state.gpuCountPerHost,
    hostCount: state.hostCount,
    vmTarget: state.vmTarget,
    workloadType: state.workloadType,
    capacitySeries: state.capacitySeries,
    capacityVramGb: state.capacityVramGb,
    maxVmsPerPod: state.maxVmsPerPod,
    podsPerSuperpod: state.podsPerSuperpod,
    clusterType: state.clusterType,
  }),
  (state) => {
    saveToUrl(state);
  }
);
