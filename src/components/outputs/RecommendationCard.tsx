import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { getRecommendations } from '../../engines/densityEngine';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard } from '../../types/gpu';
import { SeriesBadge } from '../common/SeriesBadge';

export function RecommendationCard() {
  const { t } = useTranslation();
  const { selectedGpuId, workloadType, pcieSlotsPerHost, hostCount } =
    useConfigStore();

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  if (!selectedGpu) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        <p>{t('recommendations.noGpu')}</p>
      </div>
    );
  }

  const recommendations = getRecommendations(
    selectedGpu,
    workloadType,
    pcieSlotsPerHost,
    hostCount
  );

  const RANK_STYLES = [
    'ring-2 ring-yellow-400 dark:ring-yellow-500',
    'ring-1 ring-gray-300 dark:ring-gray-600',
    'ring-1 ring-gray-200 dark:ring-gray-700',
  ];
  const RANK_LABELS = ['🥇 Best', '🥈 Runner-up', '🥉 Alternative'];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing top {recommendations.length} profiles for{' '}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {t(`deployment.workloads.${workloadType}`)}
        </span>{' '}
        workload on{' '}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {selectedGpu.model}
        </span>
      </div>

      {recommendations.map((rec, index) => (
        <div
          key={rec.profile.id}
          className={`rounded-lg bg-white dark:bg-gray-900 p-4 ${RANK_STYLES[index] ?? ''}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                {RANK_LABELS[index]}
              </div>
              <code className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                {rec.profile.horizonString}
              </code>
              <div className="mt-1">
                <SeriesBadge series={rec.profile.series} size="sm" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {rec.densityResult.instancesPerCluster}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                VMs/cluster
              </div>
            </div>
          </div>

          {/* Density grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {rec.densityResult.instancesPerGpu}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                per GPU
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {rec.densityResult.instancesPerHost}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                per host
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {rec.profile.vram_gb}GB
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                VRAM
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t('recommendations.reasoning')}
            </div>
            <ul className="space-y-1">
              {rec.reasoning.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300"
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
