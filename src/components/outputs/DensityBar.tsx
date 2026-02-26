import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import gpuData from '../../data/gpus.json';
import {
  calculateDensity,
  getProfilesForGpu,
} from '../../engines/densityEngine';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard } from '../../types/gpu';
import { InfoTooltip } from '../common/InfoTooltip';

export function DensityBar() {
  const { t } = useTranslation();
  const {
    selectedGpuId,
    selectedSeries,
    pcieSlotsPerHost,
    gpuCountPerHost,
    hostCount,
  } = useConfigStore();

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  if (!selectedGpu) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        {t('density.noProfile')}
      </div>
    );
  }

  const vramPerGpu = selectedGpu.vram_gb / selectedGpu.gpu_count_per_card;
  const filter = selectedSeries.length > 0 ? selectedSeries : undefined;
  const profiles = getProfilesForGpu(selectedGpu, filter);

  // Build chart data: one bar per profile, showing instances per cluster
  const chartData = profiles.map((profile) => {
    const density = calculateDensity({
      profile,
      pcieSlotsPerHost,
      gpuCountPerHost,
      hostCount,
      slotWidth: selectedGpu.slot_width,
      gpuCountPerCard: selectedGpu.gpu_count_per_card,
      vramPerGpu,
    });
    return {
      name: `${profile.vram_gb}${profile.series}`,
      perGpu: density.instancesPerGpu,
      perHost: density.instancesPerHost,
      perCluster: density.instancesPerCluster,
      series: profile.series,
    };
  });

  const SERIES_COLORS: Record<string, string> = {
    Q: '#22c55e',
    B: '#3b82f6',
    A: '#a855f7',
    C: '#f97316',
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: t('density.perGpu'),
              key: 'perGpu',
              color: 'text-blue-600 dark:text-blue-400',
              tooltip: t('density.tooltips.perGpu'),
            },
            {
              label: t('density.perHost'),
              key: 'perHost',
              color: 'text-purple-600 dark:text-purple-400',
              tooltip: t('density.tooltips.perHost'),
            },
            {
              label: t('density.perCluster'),
              key: 'perCluster',
              color: 'text-green-600 dark:text-green-400',
              tooltip: t('density.tooltips.perCluster'),
            },
          ].map(({ label, key, color, tooltip }) => {
            const maxVal = Math.max(
              ...chartData.map((d) => d[key as keyof typeof d] as number)
            );
            return (
              <div
                key={key}
                className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className={`text-2xl font-bold ${color}`}>{maxVal}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>{label}</span>
                  <InfoTooltip content={tooltip} />
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ({t('density.max')})
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VM density bar chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('density.chartTitle')}
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Bar dataKey="perCluster" name="VMs/cluster" radius={[3, 3, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SERIES_COLORS[entry.series] ?? '#6b7280'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GPU/host info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {t('density.cardsPerHost')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {Math.floor(pcieSlotsPerHost / selectedGpu.slot_width)}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {t('density.gpusPerHost')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {Math.floor(pcieSlotsPerHost / selectedGpu.slot_width) *
              selectedGpu.gpu_count_per_card}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {t('density.totalVram')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {Math.floor(pcieSlotsPerHost / selectedGpu.slot_width) *
              selectedGpu.gpu_count_per_card *
              vramPerGpu}
            GB
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {t('density.hostsInCluster')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {hostCount}
          </div>
        </div>
      </div>
    </div>
  );
}
