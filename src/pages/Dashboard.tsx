import { FileText, Clock } from 'lucide-react';

interface DashboardProps {
  onNavigateToNew?: () => void;
  onNavigateToHistory?: () => void;
}

export default function Dashboard({ onNavigateToNew, onNavigateToHistory }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onNavigateToNew}
            className="bg-white rounded border border-gray-200 p-8 hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Neue Dokumentation</h2>
                <p className="text-sm text-gray-600">
                  Erstelle eine neue Pflegedokumentation mit KI-Optimierung
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onNavigateToHistory}
            className="bg-white rounded border border-gray-200 p-8 hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Historie</h2>
                <p className="text-sm text-gray-600">
                  Zeige alle bisherigen Dokumentationseinträge an
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
