import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/configStore';
import { CapacityPlanTable } from '../outputs/CapacityPlanTable';
import { DensityBar } from '../outputs/DensityBar';
import { HorizonConfigSnippet } from '../outputs/HorizonConfigSnippet';
import { ProfileGrid } from '../outputs/ProfileGrid';
import { RecommendationCard } from '../outputs/RecommendationCard';

type TabId = 'profiles' | 'density' | 'recommendations' | 'config' | 'capacity';

interface TabConfig {
  id: TabId;
  labelKey: string;
  icon: React.ReactNode;
}

export function OutputDashboard() {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useConfigStore();

  const tabs: TabConfig[] = [
    {
      id: 'profiles',
      labelKey: 'nav.profiles',
      icon: (
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
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      id: 'density',
      labelKey: 'nav.density',
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: 'recommendations',
      labelKey: 'nav.recommendations',
      icon: (
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
    {
      id: 'config',
      labelKey: 'nav.config',
      icon: (
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
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      id: 'capacity',
      labelKey: 'nav.capacity',
      icon: (
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {tab.icon}
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'profiles' && <ProfileGrid />}
        {activeTab === 'density' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('density.title')}
            </h2>
            <DensityBar />
          </div>
        )}
        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('recommendations.title')}
            </h2>
            <RecommendationCard />
          </div>
        )}
        {activeTab === 'config' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('config.title')}
            </h2>
            <HorizonConfigSnippet />
          </div>
        )}
        {activeTab === 'capacity' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('capacity.title')}
            </h2>
            <CapacityPlanTable />
          </div>
        )}
      </div>
    </div>
  );
}
