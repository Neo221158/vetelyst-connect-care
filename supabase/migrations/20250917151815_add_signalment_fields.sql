-- Migration: Add missing signalment fields to cases table
-- Created: 2025-09-17
-- Description: Adds fields needed for the document upload form signalment section

-- Add other_species_type field for when species = 'other'
ALTER TABLE cases
ADD COLUMN other_species_type TEXT;

-- Add spay_neuter_status field for reproductive status
-- Create enum type for spay/neuter status
DO $$ BEGIN
    CREATE TYPE spay_neuter_status AS ENUM ('spayed', 'neutered', 'intact');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the spay_neuter_status column
ALTER TABLE cases
ADD COLUMN spay_neuter_status spay_neuter_status;

-- Add anesthesia_history field to store anesthesia questions and problems
-- Using JSONB for better performance and indexing
ALTER TABLE cases
ADD COLUMN anesthesia_history JSONB;

-- Add comments to document the new fields
COMMENT ON COLUMN cases.other_species_type IS 'Species type when species is set to ''other'' (e.g., rabbit, guinea pig, bird)';
COMMENT ON COLUMN cases.spay_neuter_status IS 'Reproductive status of the animal (spayed, neutered, or intact)';
COMMENT ON COLUMN cases.anesthesia_history IS 'JSON object storing anesthesia history: {had_anesthesia: boolean, had_problems: boolean, problems_notes: string}';

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_spay_neuter_status ON cases(spay_neuter_status);
CREATE INDEX IF NOT EXISTS idx_cases_anesthesia_history ON cases USING gin(anesthesia_history);
CREATE INDEX IF NOT EXISTS idx_cases_other_species_type ON cases(other_species_type) WHERE other_species_type IS NOT NULL;