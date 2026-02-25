import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { reverseCapacityPlanAllGpus } from '../../engines/densityEngine';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard, ProfileSeries } from '../../types/gpu';
import type { ReverseAllGpusResult } from '../../types/results';

const ALL_GPUS = gpuData as GpuCard[];

const SERIES_KEYS: Record<ProfileSeries, keyof GpuCard> = {
  Q: 'q_profile_sizes_gb',
  B: 'b_profile_sizes_gb',
  A: 'a_profile_sizes_gb',
  C: 'c_profile_sizes_gb',
};

const SERIES_COLORS: Record<ProfileSeries, string> = {
  Q: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  A: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  C: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

function availableVramSizes(series: ProfileSeries): number[] {
  const key = SERIES_KEYS[series];
  const all = new Set<number>();
  for (const gpu of ALL_GPUS) {
    for (const v of gpu[key] as number[]) {
      all.add(v);
    }
  }
  return Array.from(all).sort((a, b) => a - b);
}

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
  const { vmTarget, pcieSlotsPerHost } = useConfigStore();

  const [series, setSeries] = useState<ProfileSeries>('Q');
  const vramOptions = availableVramSizes(series);
  const [vramGb, setVramGb] = useState<number>(vramOptions[0] ?? 4);

  // When series changes, reset vram to first available for that series
  const handleSeriesChange = (s: ProfileSeries) => {
    setSeries(s);
    const opts = availableVramSizes(s);
    setVramGb(opts[0] ?? 4);
  };

  const results: ReverseAllGpusResult[] = reverseCapacityPlanAllGpus(
    ALL_GPUS,
    vmTarget,
    pcieSlotsPerHost,
    series,
    vramGb
  );

  const minHosts = results.length > 0 ? results[0].hostsNeeded : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('capacity.description')}
      </p>

      {/* Inputs */}
      <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* VM target (read-only reference) */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t('deployment.vmTarget')}:
          </span>
          <span className="font-semibold text-green-700 dark:text-green-400">
            {vmTarget.toLocaleString()} {t('common.vms')}
          </span>
        </div>

        <div className="w-px bg-gray-300 dark:bg-gray-600 self-stretch" />

        {/* Series selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t('capacity.selectSeries')}:
          </span>
          <div className="flex gap-1">
            {(['Q', 'B', 'A', 'C'] as ProfileSeries[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSeriesChange(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  series === s
                    ? SERIES_COLORS[s]
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px bg-gray-300 dark:bg-gray-600 self-stretch" />

        {/* VRAM selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t('capacity.selectVram')}:
          </span>
          <div className="flex flex-wrap gap-1">
            {vramOptions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVramGb(v)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  vramGb === v
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-semibold'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {v} GB
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
          {t('capacity.noCompatibleGpu', {
            vram: vramGb,
            series,
            defaultValue: `No GPU supports a ${vramGb}GB ${series} profile`,
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
