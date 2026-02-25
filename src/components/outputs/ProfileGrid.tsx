import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import gpuData from '../../data/gpus.json';
import { calculateDensity } from '../../engines/densityEngine';
import { useFilteredProfiles } from '../../hooks/useFilteredProfiles';
import { useConfigStore } from '../../store/configStore';
import type { GpuCard, VgpuProfile } from '../../types/gpu';
import { SeriesBadge } from '../common/SeriesBadge';

interface ProfileCardProps {
  profile: VgpuProfile;
  gpu: GpuCard;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <svg
            className="w-3 h-3 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {t('profiles.copied')}
        </>
      ) : (
        <>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {t('profiles.copy')}
        </>
      )}
    </button>
  );
}

function ProfileCard({ profile, gpu }: ProfileCardProps) {
  const { t } = useTranslation();
  const { pcieSlotsPerHost, gpuCountPerHost, hostCount } = useConfigStore();

  const vramPerGpu = gpu.vram_gb / gpu.gpu_count_per_card;
  const density = calculateDensity({
    profile,
    pcieSlotsPerHost,
    gpuCountPerHost,
    hostCount,
    slotWidth: gpu.slot_width,
    gpuCountPerCard: gpu.gpu_count_per_card,
    vramPerGpu,
  });

  const utilizationPct = Math.round(density.framebufferUtilization * 100);

  return (
    <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <code className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
            {profile.horizonString}
          </code>
          <div className="mt-1">
            <SeriesBadge series={profile.series} size="sm" />
          </div>
        </div>
        <CopyButton text={profile.horizonString} label="profile string" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <div className="text-gray-500 dark:text-gray-400">
            {t('profiles.vram')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.vram_gb}GB / {vramPerGpu}GB
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <div className="text-gray-500 dark:text-gray-400">
            {t('profiles.instances')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.maxInstances}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <div className="text-gray-500 dark:text-gray-400">
            {t('profiles.displays')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.maxDisplays}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <div className="text-gray-500 dark:text-gray-400">
            {t('profiles.fps')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.fps}
          </div>
        </div>
      </div>

      {/* Framebuffer utilization bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            VRAM utilization ({density.instancesPerGpu}×{profile.vram_gb}GB)
          </span>
          <span>{utilizationPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              utilizationPct === 100
                ? 'bg-green-500'
                : utilizationPct >= 80
                  ? 'bg-yellow-500'
                  : 'bg-blue-400'
            }`}
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
      </div>

      {/* License */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {t('profiles.license')}:{' '}
        <span className="font-medium">{profile.license}</span>
      </div>
    </div>
  );
}

export function ProfileGrid() {
  const { t } = useTranslation();
  const { selectedGpuId } = useConfigStore();
  const profiles = useFilteredProfiles();

  const gpus = gpuData as GpuCard[];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId);

  if (!selectedGpuId || !selectedGpu) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
        <svg
          className="w-12 h-12 mb-3 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
          />
        </svg>
        <p className="text-sm">{t('profiles.noSelection')}</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
        <p className="text-sm">{t('profiles.noProfiles')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        {profiles.length} profiles available for {selectedGpu.model}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} gpu={selectedGpu} />
        ))}
      </div>
    </div>
  );
}
