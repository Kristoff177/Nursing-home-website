import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { finalizeEntry } from '../services/database';
import type { OptimizationResult } from '../types/documentation';

interface OptimizationResultProps {
  result: OptimizationResult;
  entryId: string | null;
  onSave: (editedText: string) => void;
  onFinalizeExport: (finalText: string) => void;
  onBackToInput: () => void;
}

export default function OptimizationResultComponent({
  result,
  entryId,
  onSave,
  onFinalizeExport,
  onBackToInput,
}: OptimizationResultProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [editedText, setEditedText] = useState(result.optimizedText);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);

  const handleSave = () => {
    onSave(editedText);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const handleFinalize = async () => {
    if (!entryId) {
      setFinalizeError('Kein Eintrag vorhanden.');
      return;
    }

    setIsFinalizing(true);
    setFinalizeError(null);

    const finalized = await finalizeEntry(entryId, editedText);

    if (finalized) {
      setFinalizeSuccess(true);
      onFinalizeExport(editedText);
    } else {
      setFinalizeError('Fehler beim Finalisieren des Eintrags.');
    }

    setIsFinalizing(false);
  };

  const valueIncrease = result.valueEstimate.value_after - result.valueEstimate.value_before;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center gap-2 w-full p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        >
          {showOriginal ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
          <span className="font-medium text-gray-700">Originaltext anzeigen</span>
        </button>

        {showOriginal && (
          <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{result.originalText}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optimierte Version
        </label>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Vorher</p>
          <p className="text-2xl font-bold text-gray-700">
            {result.valueEstimate.value_before.toFixed(2)} CHF
          </p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-xs uppercase tracking-wide text-green-700 mb-1">Nachher</p>
          <p className="text-2xl font-bold text-green-700">
            {result.valueEstimate.value_after.toFixed(2)} CHF
          </p>
          <p className="text-sm text-green-600 mt-1">
            +{valueIncrease.toFixed(2)} CHF
          </p>
        </div>
      </div>

      {result.mappings.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Zugeordnete Kategorien
          </label>
          <div className="flex flex-wrap gap-2">
            {result.mappings.map((mapping, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
              >
                {mapping.key}: {mapping.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {showSavedMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded animate-pulse">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Eintrag gespeichert (Entwurf).</p>
        </div>
      )}

      {finalizeSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Eintrag finalisiert. Datei bereit zum Download.</p>
        </div>
      )}

      {finalizeError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{finalizeError}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isFinalizing || finalizeSuccess}
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Änderungen speichern
        </button>
        <button
          onClick={handleFinalize}
          disabled={isFinalizing || finalizeSuccess}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isFinalizing ? 'Finalisiere...' : 'Finalisieren & Exportieren'}
        </button>
      </div>

      <button
        onClick={onBackToInput}
        className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors"
      >
        Zurück zur Eingabe
      </button>
    </div>
  );
}
