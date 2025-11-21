import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import NeueDokumentation from './pages/NeueDokumentation';
import Historie from './pages/Historie';
import type { DocumentationEntryData } from './services/database';

type Page = 'dashboard' | 'new' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleNavigateToDashboard = () => setCurrentPage('dashboard');
  const handleNavigateToNew = () => setCurrentPage('new');
  const handleNavigateToHistory = () => setCurrentPage('history');

  const handleHistoryEntryClick = (entry: DocumentationEntryData) => {
    console.log('Entry clicked:', entry);
  };

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard
          onNavigateToNew={handleNavigateToNew}
          onNavigateToHistory={handleNavigateToHistory}
        />
      )}
      {currentPage === 'new' && <NeueDokumentation onNavigateBack={handleNavigateToDashboard} />}
      {currentPage === 'history' && (
        <Historie onEntryClick={handleHistoryEntryClick} onNavigateBack={handleNavigateToDashboard} />
      )}
    </>
  );
}

export default App;
