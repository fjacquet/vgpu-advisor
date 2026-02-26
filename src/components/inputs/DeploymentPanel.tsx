import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard, WorkloadType } from '../../types/gpu';
import { AccordionItem } from '../common/AccordionItem';
import { InfoTooltip } from '../common/InfoTooltip';

const CLUSTER_HOST_MAX: Record<string, number> = {
  vdi: 32,
  vsphere8: 64,
  vsphere9: 128,
};

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  tooltip?: string;
  unit?: string;
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  tooltip,
  unit,
}: SliderFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span>{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function DeploymentPanel() {
  const { t } = useTranslation();
  const {
    selectedGpuId,
    pcieSlotsPerHost,
    setPcieSlotsPerHost,
    gpuCountPerHost,
    setGpuCountPerHost,
    hostCount,
    setHostCount,
    vmTarget,
    setVmTarget,
    workloadType,
    setWorkloadType,
    clusterType,
    setClusterType,
  } = useConfigStore();

  const hasGpu = !!selectedGpuId;

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  // PCIe slots: DW cards take 2 slots (max 4 cards = 8 slots); SW take 1 slot (max 6 cards = 6 slots)
  const maxPcieSlots = selectedGpu?.slot_width === 1 ? 6 : 8;

  const maxCardsFromSlots = selectedGpu
    ? Math.floor(pcieSlotsPerHost / selectedGpu.slot_width)
    : Math.floor(pcieSlotsPerHost / 1);

  const maxHosts = CLUSTER_HOST_MAX[clusterType] ?? 32;

  const WORKLOAD_TYPES: WorkloadType[] = [
    'workstation',
    'knowledge_worker',
    'compute',
  ];

  const CLUSTER_TYPES = ['vdi', 'vsphere8', 'vsphere9'] as const;

  const handleClusterTypeChange = (ct: (typeof CLUSTER_TYPES)[number]) => {
    setClusterType(ct);
    const newMax = CLUSTER_HOST_MAX[ct];
    if (hostCount > newMax) setHostCount(newMax);
  };

  return (
    <AccordionItem
      title={t('deployment.title')}
      defaultOpen={true}
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      }
    >
      <div className="space-y-4">
        {/* Workload Type — GPU mode only */}
        {hasGpu && (
          <div className="space-y-1.5">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('deployment.workloadType')}
            </p>
            <div className="flex flex-col gap-1.5">
              {WORKLOAD_TYPES.map((wt) => (
                <label
                  key={wt}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="workloadType"
                    value={wt}
                    checked={workloadType === wt}
                    onChange={() => setWorkloadType(wt)}
                    className="accent-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`deployment.workloads.${wt}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-4">
          {/* PCIe slots */}
          <SliderField
            label={t('deployment.pcieSlotsPerHost')}
            value={Math.min(pcieSlotsPerHost, maxPcieSlots)}
            min={1}
            max={maxPcieSlots}
            onChange={setPcieSlotsPerHost}
            tooltip={
              selectedGpu?.slot_width === 1
                ? 'Single-width cards: max 6 cards × 1 slot = 6 PCIe slots'
                : 'Double-width cards: max 4 cards × 2 slots = 8 PCIe slots'
            }
          />

          {/* GPU count + cluster config — GPU mode only */}
          {hasGpu && (
            <>
              <SliderField
                label={t('deployment.gpuCountPerHost')}
                value={gpuCountPerHost}
                min={1}
                max={maxCardsFromSlots * (selectedGpu?.gpu_count_per_card ?? 1)}
                onChange={setGpuCountPerHost}
                tooltip={
                  selectedGpu
                    ? `${selectedGpu.slot_width === 2 ? 'Double-width' : 'Single-width'} card fits ${maxCardsFromSlots} cards (${maxCardsFromSlots * selectedGpu.gpu_count_per_card} GPUs) in ${pcieSlotsPerHost} slots`
                    : 'Number of physical GPUs per host server'
                }
              />

              {/* Cluster type selector */}
              <div className="space-y-1.5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('deployment.clusterType')}
                </p>
                <div className="flex flex-col gap-1.5">
                  {CLUSTER_TYPES.map((ct) => (
                    <label
                      key={ct}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="clusterType"
                        value={ct}
                        checked={clusterType === ct}
                        onChange={() => handleClusterTypeChange(ct)}
                        className="accent-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`deployment.clusterTypes.${ct}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <SliderField
                label={t('deployment.hostCount')}
                value={Math.min(hostCount, maxHosts)}
                min={1}
                max={maxHosts}
                onChange={setHostCount}
                tooltip="Number of ESXi host servers in the cluster"
              />
            </>
          )}

          {/* VM Target — capacity plan mode only */}
          {!hasGpu && (
            <SliderField
              label={t('deployment.vmTarget')}
              value={vmTarget}
              min={10}
              max={20000}
              step={10}
              onChange={setVmTarget}
              tooltip="Target number of VMs for the Horizon pod (max 20,000 per pod)"
            />
          )}
        </div>
      </div>
    </AccordionItem>
  );
}
