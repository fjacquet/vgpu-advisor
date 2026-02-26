import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { reverseCapacityPlanAllGpus } from '../../engines/densityEngine';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard } from '../../types/gpu';
import type { ReverseAllGpusResult } from '../../types/results';

const ALL_GPUS = gpuData as GpuCard[];

function UtilizationBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[56px]">
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
  const {
    vmTarget,
    pcieSlotsPerHost,
    capacitySeries,
    capacityVramGb,
    maxVmsPerPod,
    podsPerSuperpod,
  } = useConfigStore();

  const podsNeeded = Math.max(1, Math.ceil(vmTarget / maxVmsPerPod));
  const superpodsNeeded = Math.ceil(podsNeeded / podsPerSuperpod);
  const vmPerPod = Math.ceil(vmTarget / podsNeeded);

  const results: ReverseAllGpusResult[] = reverseCapacityPlanAllGpus(
    ALL_GPUS,
    vmPerPod,
    pcieSlotsPerHost,
    capacitySeries,
    capacityVramGb
  );

  const minHosts = results.length > 0 ? results[0].hostsNeeded : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('capacity.description')}
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
          {vmTarget.toLocaleString()} {t('common.vms')}
        </span>
        <span className="text-gray-400 dark:text-gray-500 self-center">→</span>
        <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium">
          {podsNeeded} {t('capacity.pods')} ({vmPerPod.toLocaleString()}{' '}
          {t('capacity.vmsPerPodShort')})
        </span>
        <span className="text-gray-400 dark:text-gray-500 self-center">→</span>
        <span className="px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-medium">
          {superpodsNeeded} {t('capacity.superpods')}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
          {t('capacity.noCompatibleGpu', {
            vram: capacityVramGb,
            series: capacitySeries,
            defaultValue: `No GPU supports a ${capacityVramGb}GB ${capacitySeries} profile`,
          })}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                    {t('capacity.gpuModel')}
                  </th>
                  <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                    {t('capacity.architecture')}
                  </th>
                  <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                    {t('capacity.vmsPerHost')}
                  </th>
                  <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                    {t('capacity.hostsNeeded')}
                  </th>
                  {podsNeeded > 1 && (
                    <th className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 text-right">
                      {t('capacity.totalHosts', { pods: podsNeeded })}
                    </th>
                  )}
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
                      key={r.gpu.id}
                      className={
                        isOptimal
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {isOptimal && (
                            <span className="text-green-600 dark:text-green-400 font-bold">
                              ★
                            </span>
                          )}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {r.gpu.model}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">
                          {r.profile.horizonString}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded capitalize">
                          {r.gpu.architecture}
                        </span>
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
                      {podsNeeded > 1 && (
                        <td className="px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-gray-200">
                          {r.hostsNeeded * podsNeeded}
                        </td>
                      )}
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
        </>
      )}
    </div>
  );
}
