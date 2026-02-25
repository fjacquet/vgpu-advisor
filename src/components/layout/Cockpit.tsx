import { InputSidebar } from './InputSidebar';
import { OutputDashboard } from './OutputDashboard';

export function Cockpit() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: inputs */}
      <div className="w-72 lg:w-80 xl:w-96 flex-shrink-0 flex flex-col">
        <InputSidebar />
      </div>
      {/* Right panel: outputs */}
      <div className="flex-1 min-w-0 flex flex-col">
        <OutputDashboard />
      </div>
    </div>
  );
}
