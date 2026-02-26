import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { useConfigStore } from '../../store/configStore';
import type { Architecture, GpuCard } from '../../types/gpu';
import { ARCHITECTURE_ORDER } from '../../types/gpu';
import { AccordionItem } from '../common/AccordionItem';
import { InfoTooltip } from '../common/InfoTooltip';

const ARCH_LABELS: Record<Architecture, string> = {
  blackwell: 'Blackwell (2024+)',
  ada: 'Ada Lovelace (2022)',
  ampere: 'Ampere (2020)',
  turing: 'Turing (2018)',
  volta: 'Volta (2017)',
  maxwell: 'Maxwell (2014)',
};

function SlotWidthBadge({ width }: { width: 1 | 2 }) {
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-mono ${
        width === 1
          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      }`}
    >
      {width === 1 ? 'SW' : 'DW'}
    </span>
  );
}

export function GpuSelectorPanel() {
  const { t } = useTranslation();
  const { selectedGpuId, setSelectedGpuId } = useConfigStore();

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  // Group GPUs by architecture in the defined order
  const grouped = ARCHITECTURE_ORDER.reduce<Record<string, GpuCard[]>>(
    (acc, arch) => {
      const archGpus = gpus.filter((g) => g.architecture === arch);
      if (archGpus.length > 0) acc[arch] = archGpus;
      return acc;
    },
    {}
  );

  return (
    <AccordionItem
      title={t('gpu.selector')}
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
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
          />
        </svg>
      }
    >
      <div className="space-y-3">
        <select
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          value={selectedGpuId ?? ''}
          onChange={(e) => setSelectedGpuId(e.target.value || null)}
        >
          <option value="">{t('gpu.selectPlaceholder')}</option>
          {Object.entries(grouped).map(([arch, archGpus]) => (
            <optgroup key={arch} label={ARCH_LABELS[arch as Architecture]}>
              {archGpus.map((gpu) => (
                <option key={gpu.id} value={gpu.id}>
                  {gpu.model} — {gpu.vram_gb}GB
                  {gpu.gpu_count_per_card > 1
                    ? ` (${gpu.gpu_count_per_card}×${gpu.vram_gb / gpu.gpu_count_per_card}GB)`
                    : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {selectedGpu && (
          <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {t('gpu.architecture')}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {selectedGpu.architecture}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {t('gpu.vram')}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedGpu.vram_gb}GB
                {selectedGpu.gpu_count_per_card > 1 && (
                  <span className="text-gray-400 ml-1">
                    ({selectedGpu.gpu_count_per_card}×
                    {selectedGpu.vram_gb / selectedGpu.gpu_count_per_card}GB)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span>{t('gpu.slotWidth')}</span>
                <InfoTooltip content={t('gpu.tooltips.slotWidth')} />
              </div>
              <SlotWidthBadge width={selectedGpu.slot_width} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span>{t('gpu.cooling')}</span>
                <InfoTooltip content={t('gpu.tooltips.cooling')} />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {selectedGpu.cooling === 'active'
                  ? t('gpu.active')
                  : t('gpu.passive')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span>{t('gpu.tdp')}</span>
                <InfoTooltip content={t('gpu.tooltips.tdp')} />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedGpu.tdp_watts}W
              </span>
            </div>
            {selectedGpu.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {selectedGpu.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </AccordionItem>
  );
}
