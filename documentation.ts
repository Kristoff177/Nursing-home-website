export interface DocumentationEntry {
  patientName: string;
  mode: 'manual' | 'dictation';
  originalText: string;
  optimizationLevel: 'standard' | 'extended' | 'maximum';
}

export interface ValueEstimate {
  value_before: number;
  value_after: number;
}

export interface Mapping {
  key: string;
  value: string;
}

export interface OptimizationResult {
  originalText: string;
  optimizedText: string;
  valueEstimate: ValueEstimate;
  mappings: Mapping[];
}

export interface ApiError {
  message: string;
  code?: string;
}
