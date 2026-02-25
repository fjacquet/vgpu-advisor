import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/configStore';
import type { ProfileSeries } from '../../types/gpu';
import { AccordionItem } from '../common/AccordionItem';
import { SeriesCardGroup } from './SeriesCardGroup';

const ALL_SERIES: ProfileSeries[] = ['Q', 'B', 'A', 'C'];

export function ProfileFilterPanel() {
  const { t } = useTranslation();
  const { selectedSeries, toggleSeries, setSelectedSeries } = useConfigStore();
  const allActive = selectedSeries.length === ALL_SERIES.length;

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
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedSeries(allActive ? [] : [...ALL_SERIES])}
          className={`w-full text-left px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors ${
            allActive
              ? 'border-gray-600 bg-gray-700 dark:bg-gray-600 text-white'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {t('profiles.all')}
        </button>
        <SeriesCardGroup
          activeSeries={selectedSeries}
          onToggle={toggleSeries}
        />
      </div>
    </AccordionItem>
  );
}
