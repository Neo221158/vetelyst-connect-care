-- Migration: Update anesthesia equipment table structure
-- Created: 2025-09-17
-- Description: Updates table to support new equipment and drug structure with improved organization

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.anesthesia_equipment;

CREATE TABLE public.anesthesia_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,

  -- Drugs section (stored as JSONB for flexibility)
  drugs JSONB DEFAULT '{
    "opioids": {},
    "nsaids": {},
    "sedation": {},
    "induction": {},
    "anestheticGases": {},
    "localAnesthetics": {},
    "supplementDrugs": {}
  }',

  -- Equipment section (stored as JSONB for flexibility)
  equipment JSONB DEFAULT '{
    "anesthesiaMachine": {"model": "", "image": null},
    "breathingSystem": {"description": "", "image": null},
    "infusionMachine": {"description": "", "image": null},
    "heatingSystem": {},
    "ventilator": {"available": false, "comments": "", "image": null},
    "monitoring": {}
  }',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_anesthesia_equipment_case_id ON public.anesthesia_equipment(case_id);

-- Add comments to document the table
COMMENT ON TABLE public.anesthesia_equipment IS 'Stores clinic equipment and drug inventory information for each case';
COMMENT ON COLUMN public.anesthesia_equipment.case_id IS 'Reference to the case this equipment data belongs to';
COMMENT ON COLUMN public.anesthesia_equipment.drugs IS 'JSON object storing all drug categories and availability';
COMMENT ON COLUMN public.anesthesia_equipment.equipment IS 'JSON object storing all equipment information including machines and monitoring devices';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_anesthesia_equipment_updated_at
  BEFORE UPDATE ON public.anesthesia_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Disable RLS for now (matching the pattern from other tables)
ALTER TABLE public.anesthesia_equipment DISABLE ROW LEVEL SECURITY;