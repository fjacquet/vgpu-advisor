import type { GpuCard, VgpuProfile, WorkloadType } from './gpu';

export interface DensityInput {
  profile: VgpuProfile;
  pcieSlotsPerHost: number;
  gpuCountPerHost: number;
  hostCount: number;
  slotWidth: 1 | 2;
  gpuCountPerCard: number;
  vramPerGpu: number;
}

export interface DensityResult {
  profile: VgpuProfile;
  maxCardsPerHost: number;
  totalGpusPerHost: number;
  instancesPerGpu: number;
  instancesPerHost: number;
  instancesPerCluster: number;
  framebufferUtilization: number;
  totalVramPerHost: number;
  vramUsedPerHost: number;
}

export interface RecommendationResult {
  profile: VgpuProfile;
  score: number;
  reasoning: string[];
  workloadType: WorkloadType;
  densityResult: DensityResult;
}

export interface ReversePlanResult {
  profile: VgpuProfile;
  hostsNeeded: number;
  gpusNeeded: number;
  cardsNeeded: number;
  instancesPerHost: number;
  gpuUtilization: number; // fraction 0..1: vmTarget / (hostsNeeded × instancesPerHost)
}

export interface ReverseAllGpusResult {
  gpu: GpuCard;
  profile: VgpuProfile;
  hostsNeeded: number;
  gpusNeeded: number;
  cardsNeeded: number;
  instancesPerHost: number;
  gpuUtilization: number; // fraction 0..1
}
