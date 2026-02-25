import './i18n';
import { Cockpit } from './components/layout/Cockpit';
import { Header } from './components/layout/Header';
import { PrintView } from './components/layout/PrintView';

function App() {
  return (
    <>
      <div className="no-print h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <main className="flex-1 min-h-0">
          <Cockpit />
        </main>
      </div>
      <PrintView />
    </>
  );
}

export default App;
