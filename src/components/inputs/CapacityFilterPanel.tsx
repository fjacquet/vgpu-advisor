import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard, ProfileSeries } from '../../types/gpu';
import { AccordionItem } from '../common/AccordionItem';
import { InfoTooltip } from '../common/InfoTooltip';
import { SeriesCardGroup } from './SeriesCardGroup';

const ALL_GPUS = gpuData as GpuCard[];

const SERIES_KEY_MAP: Record<ProfileSeries, keyof GpuCard> = {
  Q: 'q_profile_sizes_gb',
  B: 'b_profile_sizes_gb',
  A: 'a_profile_sizes_gb',
  C: 'c_profile_sizes_gb',
};

function availableVramSizes(series: ProfileSeries): number[] {
  const key = SERIES_KEY_MAP[series];
  const all = new Set<number>();
  for (const gpu of ALL_GPUS) {
    for (const v of gpu[key] as number[]) all.add(v);
  }
  return Array.from(all).sort((a, b) => a - b);
}

export function CapacityFilterPanel() {
  const { t } = useTranslation();
  const {
    capacitySeries,
    setCapacitySeries,
    capacityVramGb,
    setCapacityVramGb,
  } = useConfigStore();

  const vramOptions = availableVramSizes(capacitySeries);

  const handleSeriesChange = (s: ProfileSeries) => {
    setCapacitySeries(s);
    const opts = availableVramSizes(s);
    if (!opts.includes(capacityVramGb)) setCapacityVramGb(opts[0] ?? 4);
  };

  return (
    <AccordionItem
      title={t('capacity.filter')}
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('capacity.selectSeries')}
          </p>
          <SeriesCardGroup
            activeSeries={[capacitySeries]}
            onToggle={handleSeriesChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('capacity.selectVram')}
            </p>
            <InfoTooltip content={t('capacity.vramTooltip')} />
          </div>
          <div className="flex flex-wrap gap-1">
            {vramOptions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCapacityVramGb(v)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors font-medium ${
                  capacityVramGb === v
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {v} GB
              </button>
            ))}
          </div>
        </div>
      </div>
    </AccordionItem>
  );
}
