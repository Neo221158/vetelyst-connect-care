-- Create enum for report types
CREATE TYPE public.report_type AS ENUM ('consultation', 'second_opinion', 'emergency_response', 'follow_up');
CREATE TYPE public.report_status AS ENUM ('draft', 'generated', 'sent', 'archived');

-- Create reports table
CREATE TABLE public.case_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type public.report_type NOT NULL DEFAULT 'consultation',
  report_status public.report_status NOT NULL DEFAULT 'draft',
  
  -- Report metadata
  report_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  template_used TEXT,
  
  -- Report content
  clinical_summary TEXT,
  diagnosis_details JSONB DEFAULT '{}',
  treatment_recommendations TEXT,
  prognosis_assessment TEXT,
  follow_up_instructions TEXT,
  disclaimer_text TEXT,
  
  -- Document management
  pdf_file_path TEXT,
  file_size BIGINT,
  digital_signature JSONB DEFAULT '{}',
  watermark_applied BOOLEAN DEFAULT true,
  security_settings JSONB DEFAULT '{}',
  
  -- Delivery tracking
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_recipients TEXT[],
  email_status TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create specialist letterhead table
CREATE TABLE public.specialist_letterheads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Practice information
  practice_name TEXT NOT NULL,
  practice_logo_url TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Contact information
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  
  -- Professional details
  credentials TEXT[],
  license_numbers TEXT[],
  specialties TEXT[],
  board_certifications TEXT[],
  
  -- Formatting preferences
  header_template TEXT,
  footer_template TEXT,
  color_scheme JSONB DEFAULT '{}',
  font_preferences JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(specialist_id, practice_name)
);

-- Enable RLS
ALTER TABLE public.case_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_letterheads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_reports
CREATE POLICY "Specialists can view their own reports" ON public.case_reports 
FOR SELECT TO authenticated 
USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Specialists can create their own reports" ON public.case_reports 
FOR INSERT TO authenticated 
WITH CHECK (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Specialists can update their own reports" ON public.case_reports 
FOR UPDATE TO authenticated 
USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Case participants can view reports" ON public.case_reports 
FOR SELECT TO authenticated 
USING (case_id IN (
  SELECT c.id FROM public.cases c 
  JOIN public.profiles p ON p.user_id = auth.uid() 
  WHERE c.referring_vet_id = p.id OR c.specialist_id = p.id
));

-- RLS Policies for specialist_letterheads
CREATE POLICY "Specialists can manage their letterheads" ON public.specialist_letterheads 
FOR ALL TO authenticated 
USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to generate unique report numbers
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_suffix TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT 'VET-' || year_suffix || '-' || LPAD((
    COALESCE(
      (SELECT MAX(CAST(SPLIT_PART(SPLIT_PART(report_number, '-', 3), '-', 1) AS INTEGER)) 
       FROM public.case_reports 
       WHERE report_number LIKE 'VET-' || year_suffix || '-%'),
      0
    ) + 1
  )::TEXT, 6, '0') INTO new_number;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate report numbers
CREATE OR REPLACE FUNCTION public.set_report_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
    NEW.report_number := public.generate_report_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_report_number_trigger
  BEFORE INSERT ON public.case_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_report_number();

-- Create triggers for updated_at
CREATE TRIGGER update_case_reports_updated_at 
BEFORE UPDATE ON public.case_reports 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_specialist_letterheads_updated_at 
BEFORE UPDATE ON public.specialist_letterheads 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for report PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('case-reports', 'case-reports', false);

-- Storage policies for case reports
CREATE POLICY "Specialists can upload their own reports" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'case-reports');

CREATE POLICY "Case participants can view reports" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'case-reports' AND (
  SELECT COUNT(*) FROM public.case_reports cr 
  JOIN public.cases c ON cr.case_id = c.id 
  JOIN public.profiles p ON p.user_id = auth.uid() 
  WHERE cr.pdf_file_path = name AND (c.referring_vet_id = p.id OR c.specialist_id = p.id)
) > 0);

CREATE POLICY "Specialists can update their own reports" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'case-reports' AND (
  SELECT COUNT(*) FROM public.case_reports cr 
  JOIN public.profiles p ON cr.specialist_id = p.id 
  WHERE cr.pdf_file_path = name AND p.user_id = auth.uid()
) > 0);

-- Create storage bucket for letterhead logos
INSERT INTO storage.buckets (id, name, public) VALUES ('letterhead-logos', 'letterhead-logos', true);

-- Storage policies for letterhead logos
CREATE POLICY "Anyone can view letterhead logos" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'letterhead-logos');

CREATE POLICY "Specialists can upload their logos" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'letterhead-logos');

CREATE POLICY "Specialists can update their logos" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'letterhead-logos');