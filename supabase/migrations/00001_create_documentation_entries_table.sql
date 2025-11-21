/*
  # Create documentation entries table

  1. New Tables
    - `documentation_entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `patient_name` (text) - Name of the patient/resident
      - `mode` (text) - Input mode: 'manual' or 'dictation'
      - `original_text` (text) - Original documentation text
      - `optimized_text` (text) - AI-optimized documentation text
      - `optimization_level` (text) - Level: 'standard', 'extended', or 'maximum'
      - `value_before` (numeric) - Estimated value before optimization (CHF)
      - `value_after` (numeric) - Estimated value after optimization (CHF)
      - `mappings` (jsonb) - Extracted category mappings
      - `status` (text) - Entry status: 'draft' or 'final'
      - `created_at` (timestamptz) - Timestamp when entry was created
      - `updated_at` (timestamptz) - Timestamp when entry was last updated
      - `finalized_at` (timestamptz) - Timestamp when entry was finalized

  2. Security
    - Enable RLS on `documentation_entries` table
    - Add policies for authenticated users to manage their own entries
*/

CREATE TABLE IF NOT EXISTS documentation_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  mode text NOT NULL DEFAULT 'manual',
  original_text text NOT NULL,
  optimized_text text NOT NULL,
  optimization_level text NOT NULL DEFAULT 'standard',
  value_before numeric(10,2) NOT NULL DEFAULT 0,
  value_after numeric(10,2) NOT NULL DEFAULT 0,
  mappings jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  finalized_at timestamptz,
  CONSTRAINT valid_mode CHECK (mode IN ('manual', 'dictation')),
  CONSTRAINT valid_level CHECK (optimization_level IN ('standard', 'extended', 'maximum')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'final'))
);

ALTER TABLE documentation_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documentation entries"
  ON documentation_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert documentation entries"
  ON documentation_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update documentation entries"
  ON documentation_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documentation entries"
  ON documentation_entries FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_documentation_entries_status ON documentation_entries(status);
CREATE INDEX IF NOT EXISTS idx_documentation_entries_created_at ON documentation_entries(created_at DESC);
