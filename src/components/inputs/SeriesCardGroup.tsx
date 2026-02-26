import type { ProfileSeries } from '../../types/gpu';
import { SERIES_INFO } from '../../types/gpu';

const SERIES: ProfileSeries[] = ['Q', 'B', 'A', 'C'];

const SERIES_ACTIVE: Record<ProfileSeries, string> = {
  Q: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200',
  B: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
  A: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
  C: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
};

const SERIES_DOT: Record<ProfileSeries, string> = {
  Q: 'bg-green-500',
  B: 'bg-blue-500',
  A: 'bg-purple-500',
  C: 'bg-orange-500',
};

interface SeriesCardGroupProps {
  activeSeries: ProfileSeries[];
  onToggle: (s: ProfileSeries) => void;
}

export function SeriesCardGroup({
  activeSeries,
  onToggle,
}: SeriesCardGroupProps) {
  return (
    <>
      {SERIES.map((s) => {
        const info = SERIES_INFO[s];
        const isActive = activeSeries.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(s)}
            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
              isActive
                ? SERIES_ACTIVE[s]
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex-shrink-0 ${SERIES_DOT[s]}`}
              />
              <span className="font-semibold text-sm">{s}-series</span>
              <span className="text-xs opacity-70">{info.license}</span>
            </div>
            <p className="text-xs mt-0.5 ml-6 opacity-60 leading-tight">
              {info.useCase}
            </p>
          </button>
        );
      })}
    </>
  );
}
