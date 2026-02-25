import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/configStore';
import type { ProfileSeries } from '../../types/gpu';
import { AccordionItem } from '../common/AccordionItem';

const SERIES: ProfileSeries[] = ['Q', 'B', 'A', 'C'];

const SERIES_STYLES: Record<
  ProfileSeries,
  { active: string; inactive: string }
> = {
  Q: {
    active: 'bg-green-500 text-white border-green-500',
    inactive:
      'text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20',
  },
  B: {
    active: 'bg-blue-500 text-white border-blue-500',
    inactive:
      'text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  A: {
    active: 'bg-purple-500 text-white border-purple-500',
    inactive:
      'text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20',
  },
  C: {
    active: 'bg-orange-500 text-white border-orange-500',
    inactive:
      'text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20',
  },
};

export function ProfileFilterPanel() {
  const { t } = useTranslation();
  const { selectedSeries, toggleSeries, setSelectedSeries } = useConfigStore();

  const allActive = selectedSeries.length === SERIES.length;

  return (
    <AccordionItem
      title={t('profiles.filter')}
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedSeries(allActive ? [] : [...SERIES])}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
              allActive
                ? 'bg-gray-700 text-white border-gray-700'
                : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {t('profiles.all')}
          </button>
          {SERIES.map((series) => (
            <button
              key={series}
              type="button"
              onClick={() => toggleSeries(series)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                selectedSeries.includes(series)
                  ? SERIES_STYLES[series].active
                  : SERIES_STYLES[series].inactive
              }`}
            >
              {series}-series
            </button>
          ))}
        </div>
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {SERIES.map((s) => (
            <div key={s} className="flex items-start gap-2">
              <span className="font-bold mt-0.5">{s}:</span>
              <span>{t(`series.${s}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </AccordionItem>
  );
}
