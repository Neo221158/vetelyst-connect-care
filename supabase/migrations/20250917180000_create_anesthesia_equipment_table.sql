-- Migration: Create anesthesia equipment table
-- Created: 2025-09-17
-- Description: Creates table to store anesthesia equipment and drug availability for each case

CREATE TABLE public.anesthesia_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,

  -- Drug availability (stored as JSONB for flexibility)
  sedation_drugs JSONB DEFAULT '{}',
  injectable_anesthetics JSONB DEFAULT '{}',
  inhalation_anesthetics JSONB DEFAULT '{}',
  analgesics JSONB DEFAULT '{}',
  reversal_agents JSONB DEFAULT '{}',

  -- Equipment availability
  anesthesia_machine_available BOOLEAN DEFAULT false,

  -- Monitoring parameters (stored as JSONB)
  monitoring_parameters JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_anesthesia_equipment_case_id ON public.anesthesia_equipment(case_id);

-- Add comments to document the table
COMMENT ON TABLE public.anesthesia_equipment IS 'Stores anesthesia equipment and drug availability information for each case';
COMMENT ON COLUMN public.anesthesia_equipment.case_id IS 'Reference to the case this equipment data belongs to';
COMMENT ON COLUMN public.anesthesia_equipment.sedation_drugs IS 'JSON object storing sedation/premedication drug availability';
COMMENT ON COLUMN public.anesthesia_equipment.injectable_anesthetics IS 'JSON object storing injectable anesthetic availability';
COMMENT ON COLUMN public.anesthesia_equipment.inhalation_anesthetics IS 'JSON object storing inhalation anesthetic availability';
COMMENT ON COLUMN public.anesthesia_equipment.analgesics IS 'JSON object storing analgesic/pain management drug availability';
COMMENT ON COLUMN public.anesthesia_equipment.reversal_agents IS 'JSON object storing reversal agent availability';
COMMENT ON COLUMN public.anesthesia_equipment.monitoring_parameters IS 'JSON object storing monitoring parameter availability';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_anesthesia_equipment_updated_at
  BEFORE UPDATE ON public.anesthesia_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Disable RLS for now (matching the pattern from other tables)
ALTER TABLE public.anesthesia_equipment DISABLE ROW LEVEL SECURITY;