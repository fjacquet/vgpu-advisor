export type Architecture =
  | 'blackwell'
  | 'ada'
  | 'ampere'
  | 'turing'
  | 'volta'
  | 'maxwell';

export type ProfileSeries = 'Q' | 'B' | 'A' | 'C';

export type WorkloadType = 'workstation' | 'knowledge_worker' | 'compute';

export type FormFactor = 'full-height' | 'low-profile';

export type Cooling = 'active' | 'passive';

export interface GpuCard {
  id: string;
  model: string;
  architecture: Architecture;
  vram_gb: number;
  gpu_count_per_card: number;
  slot_width: 1 | 2;
  cooling: Cooling;
  form_factor: FormFactor;
  mig_capable: boolean;
  tdp_watts: number;
  fp32_tflops: number;
  memory_bandwidth_gbps: number;
  cuda_cores: number;
  nvenc_count: number;
  nvdec_count: number;
  notes: string;
  q_profile_sizes_gb: number[];
  b_profile_sizes_gb: number[];
  a_profile_sizes_gb: number[];
  c_profile_sizes_gb: number[];
}

export interface VgpuProfile {
  id: string;
  gpuId: string;
  series: ProfileSeries;
  vram_gb: number;
  /** VRAM per individual GPU on the card (multi-GPU cards have same value per GPU) */
  vram_per_gpu_gb: number;
  horizonString: string;
  maxInstances: number;
  maxDisplays: number;
  maxResolution: string;
  license: string;
  useCase: string;
  fps: number;
  features: string[];
}

export const ARCHITECTURE_ORDER: Architecture[] = [
  'blackwell',
  'ada',
  'ampere',
  'turing',
  'volta',
  'maxwell',
];

export const SERIES_INFO: Record<
  ProfileSeries,
  {
    label: string;
    license: string;
    maxDisplays: number;
    maxResolution: string;
    fps: number;
    useCase: string;
    features: string[];
    color: string;
  }
> = {
  Q: {
    label: 'vWS (Q)',
    license: 'NVIDIA vWS',
    maxDisplays: 4,
    maxResolution: '7680×4320 (8K)',
    fps: 60,
    useCase: 'Professional workstation, CAD/3D, creative',
    features: ['RTX', 'CUDA', 'OpenGL', 'DirectX', 'Vulkan', '4 displays'],
    color: 'green',
  },
  B: {
    label: 'vPC (B)',
    license: 'NVIDIA vPC',
    maxDisplays: 2,
    maxResolution: '5120×2880',
    fps: 45,
    useCase: 'Knowledge worker, office productivity',
    features: ['CUDA', 'OpenGL', 'DirectX', '2 displays'],
    color: 'blue',
  },
  A: {
    label: 'vCS (A)',
    license: 'NVIDIA vCS',
    maxDisplays: 1,
    maxResolution: '5120×2880',
    fps: 60,
    useCase: 'Compute-optimized, simulation, AI inference',
    features: ['RTX', 'CUDA', 'OpenCL', '1 display'],
    color: 'purple',
  },
  C: {
    label: 'Compute (C)',
    license: 'NVIDIA vCS',
    maxDisplays: 1,
    maxResolution: '3840×2400',
    fps: 60,
    useCase: 'Headless compute, ML training, data science',
    features: ['CUDA', 'OpenCL', 'No RTX', '1 display'],
    color: 'orange',
  },
};
