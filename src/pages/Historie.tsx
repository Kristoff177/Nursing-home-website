import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getAllEntries, type DocumentationEntryData } from '../services/database';

interface HistorieProps {
  onEntryClick?: (entry: DocumentationEntryData) => void;
  onNavigateBack?: () => void;
}

export default function Historie({ onEntryClick, onNavigateBack }: HistorieProps) {
  const [entries, setEntries] = useState<DocumentationEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    const data = await getAllEntries();
    setEntries(data);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = (text: string) => {
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Zurück
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">Dokumentations-Historie</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Keine Einträge vorhanden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient/Zimmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vorschau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => onEntryClick?.(entry)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.created_at!)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.patient_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getPreview(entry.optimized_text)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.status === 'draft' ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Final
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
