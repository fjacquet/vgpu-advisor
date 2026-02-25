import type { ProfileSeries } from '../../types/gpu';

interface SeriesBadgeProps {
  series: ProfileSeries;
  size?: 'sm' | 'md';
}

const SERIES_STYLES: Record<ProfileSeries, string> = {
  Q: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-500/30',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-500/30',
  A: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 ring-1 ring-purple-500/30',
  C: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 ring-1 ring-orange-500/30',
};

const SERIES_LABELS: Record<ProfileSeries, string> = {
  Q: 'vWS',
  B: 'vPC',
  A: 'vCS',
  C: 'Compute',
};

export function SeriesBadge({ series, size = 'md' }: SeriesBadgeProps) {
  const sizeClass =
    size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs font-medium';
  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClass} ${SERIES_STYLES[series]}`}
    >
      {series}-series · {SERIES_LABELS[series]}
    </span>
  );
}
