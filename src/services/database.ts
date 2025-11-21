import { supabase } from '../lib/supabase';
import type { OptimizationResult } from '../types/documentation';

export interface DocumentationEntryData {
  id?: string;
  patient_name: string;
  mode: 'manual' | 'dictation';
  original_text: string;
  optimized_text: string;
  optimization_level: 'standard' | 'extended' | 'maximum';
  value_before: number;
  value_after: number;
  mappings: Array<{ key: string; value: string }>;
  status: 'draft' | 'final';
  created_at?: string;
  updated_at?: string;
  finalized_at?: string | null;
}

export async function createEntry(
  patientName: string,
  mode: 'manual' | 'dictation',
  originalText: string,
  optimizationLevel: 'standard' | 'extended' | 'maximum',
  result: OptimizationResult
): Promise<DocumentationEntryData | null> {
  const { data, error } = await supabase
    .from('documentation_entries')
    .insert({
      patient_name: patientName,
      mode,
      original_text: originalText,
      optimized_text: result.optimizedText,
      optimization_level: optimizationLevel,
      value_before: result.valueEstimate.value_before,
      value_after: result.valueEstimate.value_after,
      mappings: result.mappings,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    return null;
  }

  return data;
}

export async function updateEntry(
  id: string,
  updates: Partial<DocumentationEntryData>
): Promise<DocumentationEntryData | null> {
  const { data, error } = await supabase
    .from('documentation_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating entry:', error);
    return null;
  }

  return data;
}

export async function finalizeEntry(
  id: string,
  finalText: string
): Promise<DocumentationEntryData | null> {
  const { data, error } = await supabase
    .from('documentation_entries')
    .update({
      optimized_text: finalText,
      status: 'final',
      finalized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error finalizing entry:', error);
    return null;
  }

  return data;
}

export async function getAllEntries(): Promise<DocumentationEntryData[]> {
  const { data, error } = await supabase
    .from('documentation_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }

  return data || [];
}

export async function getEntryById(
  id: string
): Promise<DocumentationEntryData | null> {
  const { data, error } = await supabase
    .from('documentation_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching entry:', error);
    return null;
  }

  return data;
}
