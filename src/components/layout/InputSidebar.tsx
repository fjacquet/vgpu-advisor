import { useConfigStore } from '../../store/configStore';
import { DeploymentPanel } from '../inputs/DeploymentPanel';
import { GpuSelectorPanel } from '../inputs/GpuSelectorPanel';
import { ProfileFilterPanel } from '../inputs/ProfileFilterPanel';

export function InputSidebar() {
  const { activeTab } = useConfigStore();
  const isCapacityTab = activeTab === 'capacity';

  return (
    <aside className="h-full flex flex-col overflow-y-auto bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 space-y-3 flex-1">
        {!isCapacityTab && <GpuSelectorPanel />}
        {!isCapacityTab && <ProfileFilterPanel />}
        <DeploymentPanel />
      </div>
      <div className="px-4 py-2 text-xs text-center text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800">
        vGPU Advisor · Based on NVIDIA vGPU User Guide v19.x
      </div>
    </aside>
  );
}
