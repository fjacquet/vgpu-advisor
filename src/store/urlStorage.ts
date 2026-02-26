import LZString from 'lz-string';

const HASH_PREFIX = 'vgpu-advisor=';

export interface PersistedState {
  selectedGpuId: string | null;
  selectedSeries: string[];
  pcieSlotsPerHost: number;
  gpuCountPerHost: number;
  hostCount: number;
  workloadType: string;
  vmTarget: number;
  capacitySeries: string;
  capacityVramGb: number;
  clusterType: string;
}

export function saveToUrl(state: PersistedState): void {
  try {
    const json = JSON.stringify(state);
    const compressed = LZString.compressToEncodedURIComponent(json);
    window.location.hash = `${HASH_PREFIX}${compressed}`;
  } catch {
    // Silently fail — URL update is best-effort
  }
}

export function loadFromUrl(): Partial<PersistedState> | null {
  try {
    const hash = window.location.hash.slice(1); // Remove leading #
    if (!hash.startsWith(HASH_PREFIX)) return null;

    const compressed = hash.slice(HASH_PREFIX.length);
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    return JSON.parse(json) as Partial<PersistedState>;
  } catch {
    return null;
  }
}
