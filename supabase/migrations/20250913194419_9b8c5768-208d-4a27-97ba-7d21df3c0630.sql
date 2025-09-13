-- Create enum types for the veterinary platform
CREATE TYPE public.user_role AS ENUM ('referring_vet', 'specialist');
CREATE TYPE public.animal_species AS ENUM ('dog', 'cat', 'horse', 'bird', 'rabbit', 'other');
CREATE TYPE public.case_urgency AS ENUM ('routine', 'urgent', 'emergency');
CREATE TYPE public.case_status AS ENUM ('submitted', 'reviewing', 'in_progress', 'completed', 'follow_up_needed', 'declined');
CREATE TYPE public.specialty_area AS ENUM ('anesthesia', 'cardiology', 'dermatology', 'emergency', 'internal_medicine', 'neurology', 'oncology', 'ophthalmology', 'orthopedics', 'surgery');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  clinic_name TEXT,
  license_number TEXT,
  phone TEXT,
  specialty_area public.specialty_area,
  bio TEXT,
  years_experience INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referring_vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Patient Information
  patient_name TEXT NOT NULL,
  species public.animal_species NOT NULL,
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT,
  weight_kg DECIMAL(5,2),
  
  -- Case Details
  chief_complaint TEXT NOT NULL,
  surgery_type TEXT,
  medical_history JSONB DEFAULT '{}',
  current_medications TEXT,
  previous_consultations TEXT,
  
  -- Clinical Assessment
  presenting_complaint TEXT NOT NULL,
  severity_score INTEGER CHECK (severity_score BETWEEN 1 AND 10),
  physical_examination TEXT,
  vital_signs JSONB DEFAULT '{}',
  body_condition_score INTEGER CHECK (body_condition_score BETWEEN 1 AND 9),
  diagnostic_results TEXT,
  working_diagnosis TEXT,
  differential_diagnoses TEXT,
  questions_for_specialist TEXT,
  
  -- Case Management
  specialty_requested public.specialty_area NOT NULL,
  urgency public.case_urgency NOT NULL DEFAULT 'routine',
  status public.case_status NOT NULL DEFAULT 'submitted',
  complexity_rating INTEGER CHECK (complexity_rating BETWEEN 1 AND 5),
  estimated_hours DECIMAL(4,2),
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case documents table
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case responses table
CREATE TABLE public.case_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  diagnosis TEXT,
  treatment_recommendations TEXT,
  prognosis TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  referral_recommendations TEXT,
  is_final_response BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case timeline table for tracking case progress
CREATE TABLE public.case_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cases
CREATE POLICY "Referring vets can view their submitted cases" ON public.cases FOR SELECT TO authenticated 
  USING (referring_vet_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Specialists can view cases in their specialty" ON public.cases FOR SELECT TO authenticated 
  USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
         (specialist_id IS NULL AND specialty_requested IN (SELECT specialty_area FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Referring vets can insert cases" ON public.cases FOR INSERT TO authenticated 
  WITH CHECK (referring_vet_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Specialists can update assigned cases" ON public.cases FOR UPDATE TO authenticated 
  USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for case documents
CREATE POLICY "Case participants can view documents" ON public.case_documents FOR SELECT TO authenticated 
  USING (case_id IN (
    SELECT c.id FROM public.cases c 
    JOIN public.profiles p ON p.user_id = auth.uid() 
    WHERE c.referring_vet_id = p.id OR c.specialist_id = p.id
  ));

CREATE POLICY "Case participants can upload documents" ON public.case_documents FOR INSERT TO authenticated 
  WITH CHECK (case_id IN (
    SELECT c.id FROM public.cases c 
    JOIN public.profiles p ON p.user_id = auth.uid() 
    WHERE c.referring_vet_id = p.id OR c.specialist_id = p.id
  ));

-- RLS Policies for case responses
CREATE POLICY "Case participants can view responses" ON public.case_responses FOR SELECT TO authenticated 
  USING (case_id IN (
    SELECT c.id FROM public.cases c 
    JOIN public.profiles p ON p.user_id = auth.uid() 
    WHERE c.referring_vet_id = p.id OR c.specialist_id = p.id
  ));

CREATE POLICY "Specialists can create responses" ON public.case_responses FOR INSERT TO authenticated 
  WITH CHECK (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Specialists can update their responses" ON public.case_responses FOR UPDATE TO authenticated 
  USING (specialist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for case timeline
CREATE POLICY "Case participants can view timeline" ON public.case_timeline FOR SELECT TO authenticated 
  USING (case_id IN (
    SELECT c.id FROM public.cases c 
    JOIN public.profiles p ON p.user_id = auth.uid() 
    WHERE c.referring_vet_id = p.id OR c.specialist_id = p.id
  ));

CREATE POLICY "Authenticated users can insert timeline entries" ON public.case_timeline FOR INSERT TO authenticated 
  WITH CHECK (actor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_case_responses_updated_at BEFORE UPDATE ON public.case_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create timeline entries
CREATE OR REPLACE FUNCTION public.create_case_timeline_entry()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  actor_profile_id UUID;
BEGIN
  -- Get the profile ID for the current user
  SELECT id INTO actor_profile_id FROM public.profiles WHERE user_id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    action_text := 'Case submitted';
    INSERT INTO public.case_timeline (case_id, actor_id, action, description)
    VALUES (NEW.id, NEW.referring_vet_id, action_text, 'New case submitted for review');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      action_text := 'Status changed to ' || NEW.status;
      INSERT INTO public.case_timeline (case_id, actor_id, action, description)
      VALUES (NEW.id, actor_profile_id, action_text, 'Case status updated');
    END IF;
    
    IF OLD.specialist_id IS NULL AND NEW.specialist_id IS NOT NULL THEN
      action_text := 'Case accepted by specialist';
      INSERT INTO public.case_timeline (case_id, actor_id, action, description)
      VALUES (NEW.id, NEW.specialist_id, action_text, 'Specialist accepted the case');
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for case timeline
CREATE TRIGGER case_timeline_trigger 
  AFTER INSERT OR UPDATE ON public.cases 
  FOR EACH ROW EXECUTE FUNCTION public.create_case_timeline_entry();

-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public) VALUES ('case-documents', 'case-documents', false);

-- Storage policies for case documents
CREATE POLICY "Case participants can view documents" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'case-documents' AND (
  SELECT COUNT(*) FROM public.case_documents cd 
  JOIN public.cases c ON cd.case_id = c.id 
  JOIN public.profiles p ON p.user_id = auth.uid() 
  WHERE cd.file_path = name AND (c.referring_vet_id = p.id OR c.specialist_id = p.id)
) > 0);

CREATE POLICY "Authenticated users can upload case documents" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'case-documents');

CREATE POLICY "Document owners can update their uploads" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'case-documents' AND (
  SELECT COUNT(*) FROM public.case_documents cd 
  JOIN public.profiles p ON cd.uploaded_by = p.id 
  WHERE cd.file_path = name AND p.user_id = auth.uid()
) > 0);

CREATE POLICY "Document owners can delete their uploads" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'case-documents' AND (
  SELECT COUNT(*) FROM public.case_documents cd 
  JOIN public.profiles p ON cd.uploaded_by = p.id 
  WHERE cd.file_path = name AND p.user_id = auth.uid()
) > 0);