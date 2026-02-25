import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { reverseCapacityPlan } from '../../engines/densityEngine';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard } from '../../types/gpu';
import type { ReversePlanResult } from '../../types/results';

function UtilizationBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-9 text-right">{pct}%</span>
    </div>
  );
}

export function CapacityPlanTable() {
  const { t } = useTranslation();
  const { selectedGpuId, selectedSeries, vmTarget, pcieSlotsPerHost } =
    useConfigStore();

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  if (!selectedGpu) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        <p>{t('capacity.noGpu')}</p>
      </div>
    );
  }

  const seriesFilter =
    selectedSeries.length > 0
      ? (selectedSeries as ('Q' | 'B' | 'A' | 'C')[])
      : undefined;

  const results: ReversePlanResult[] = reverseCapacityPlan(
    selectedGpu,
    vmTarget,
    pcieSlotsPerHost,
    seriesFilter
  );

  const minHosts = results.length > 0 ? results[0].hostsNeeded : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('capacity.description')}
      </p>

      <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {t('deployment.vmTarget')}:
        </span>
        <span className="font-semibold text-green-700 dark:text-green-400">
          {vmTarget.toLocaleString()} {t('common.vms')}
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-600 dark:text-gray-400">
          {selectedGpu.model}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left">
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                {t('profiles.series')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                {t('profiles.vram')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                {t('capacity.vmsPerHost')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                {t('capacity.hostsNeeded')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                {t('capacity.gpusNeeded')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                {t('capacity.cardsNeeded')}
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                {t('capacity.utilization')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((r) => {
              const isOptimal = r.hostsNeeded === minHosts;
              return (
                <tr
                  key={r.profile.id}
                  className={
                    isOptimal
                      ? 'bg-green-50 dark:bg-green-900/10'
                      : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {isOptimal && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ★
                        </span>
                      )}
                      <span className="font-mono text-xs text-gray-800 dark:text-gray-200">
                        {r.profile.horizonString}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">
                    {r.profile.vram_gb} {t('common.gb')}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-gray-200">
                    {r.instancesPerHost}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right tabular-nums font-semibold ${
                      isOptimal
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {r.hostsNeeded}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-gray-200">
                    {r.gpusNeeded}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-gray-200">
                    {r.cardsNeeded}
                  </td>
                  <td className="px-3 py-2.5">
                    <UtilizationBar value={r.gpuUtilization} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        ★ {t('capacity.optimal')} · {t('capacity.utilization')}:{' '}
        <span className="text-green-600">≥80%</span> /{' '}
        <span className="text-yellow-600">50–79%</span> /{' '}
        <span className="text-red-500">&lt;50%</span>
      </p>
    </div>
  );
}
