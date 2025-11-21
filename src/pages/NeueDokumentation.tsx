import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { optimizeDocumentation, ApiTimeoutError, ApiError } from '../services/api';
import { validateDocumentationText, validatePatientName } from '../utils/validation';
import OptimizationResultComponent from '../components/OptimizationResult';
import { createEntry, updateEntry } from '../services/database';
import type { DocumentationEntry, OptimizationResult } from '../types/documentation';

const MAX_TEXT_LENGTH = parseInt(
  import.meta.env.VITE_MAX_TEXT_LENGTH || '5000',
  10
);

interface NeueDokumentationProps {
  onNavigateBack?: () => void;
}

export default function NeueDokumentation({ onNavigateBack }: NeueDokumentationProps) {
  const [patientName, setPatientName] = useState('');
  const [mode, setMode] = useState<'manual' | 'dictation'>('manual');
  const [text, setText] = useState('');
  const [optimizationLevel, setOptimizationLevel] = useState<'standard' | 'extended' | 'maximum'>('standard');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handlePatientNameChange = (value: string) => {
    setPatientName(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleOptimize = async () => {
    setError(null);
    setValidationError(null);

    const patientValidation = validatePatientName(patientName);
    if (!patientValidation.isValid) {
      setValidationError(patientValidation.errorMessage!);
      return;
    }

    const textValidation = validateDocumentationText(text);
    if (!textValidation.isValid) {
      setValidationError(textValidation.errorMessage!);
      return;
    }

    const entry: DocumentationEntry = {
      patientName: patientName.trim(),
      mode,
      originalText: text.trim(),
      optimizationLevel,
    };

    setIsLoading(true);

    try {
      const optimizationResult = await optimizeDocumentation(entry);
      setResult(optimizationResult);

      const savedEntry = await createEntry(
        patientName.trim(),
        mode,
        text.trim(),
        optimizationLevel,
        optimizationResult
      );

      if (savedEntry) {
        setEntryId(savedEntry.id!);
      }
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setError(err.message);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async (editedText: string) => {
    if (result && entryId) {
      setResult({
        ...result,
        optimizedText: editedText,
      });

      await updateEntry(entryId, {
        optimized_text: editedText,
      });
    }
  };

  const handleFinalizeExport = (finalText: string) => {
    if (entryId) {
      console.log('Finalisieren mit ID:', entryId);
    }
  };

  const handleBackToInput = () => {
    setResult(null);
  };

  const textLength = text.length;
  const isTextTooLong = textLength > MAX_TEXT_LENGTH;

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
          <h1 className="text-xl font-semibold text-gray-900">Neue Dokumentation</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Eingabe</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
                  Bewohner/Patient
                </label>
                <input
                  id="patient"
                  type="text"
                  value={patientName}
                  onChange={(e) => handlePatientNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name des Bewohners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eingabemodus
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                      mode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manuelle Eingabe
                  </button>
                  <button
                    onClick={() => setMode('dictation')}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                      mode === 'dictation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Diktat
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Dokumentationstext
                </label>
                <textarea
                  id="text"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Beschreibe, was du für den Bewohner gemacht hast..."
                />
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-sm ${
                      isTextTooLong ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {textLength} / {MAX_TEXT_LENGTH} Zeichen
                  </span>
                </div>
              </div>

              {validationError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{validationError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimierungslevel
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="level"
                      value="standard"
                      checked={optimizationLevel === 'standard'}
                      onChange={(e) => setOptimizationLevel(e.target.value as 'standard')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Standard</div>
                      <div className="text-sm text-gray-600">Grundlegende Optimierung</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="level"
                      value="extended"
                      checked={optimizationLevel === 'extended'}
                      onChange={(e) => setOptimizationLevel(e.target.value as 'extended')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Erweitert</div>
                      <div className="text-sm text-gray-600">Detaillierte Anpassung</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="level"
                      value="maximum"
                      checked={optimizationLevel === 'maximum'}
                      onChange={(e) => setOptimizationLevel(e.target.value as 'maximum')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Maximum</div>
                      <div className="text-sm text-gray-600">Vollständige Optimierung</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  'Analysieren & Optimieren'
                )}
              </button>

              {isLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 text-center">
                    Analyse läuft… Das kann 5–20 Sekunden dauern.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Optimierungsergebnis</h2>

            {!result && !isLoading && (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Starte die Optimierung, um hier das Ergebnis zu sehen</p>
              </div>
            )}

            {result && (
              <OptimizationResultComponent
                result={result}
                entryId={entryId}
                onSave={handleSaveResult}
                onFinalizeExport={handleFinalizeExport}
                onBackToInput={handleBackToInput}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
