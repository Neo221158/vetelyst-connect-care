import { supabase } from '@/integrations/supabase/client';
import { FileUploadResult } from './fileUpload';

// Types for form submission
export interface SignalmentData {
  species: 'dog' | 'cat' | 'other';
  otherSpeciesType?: string;
  breed?: string;
  ageYears: number;
  ageMonths?: number;
  weight: number;
  spayNeuterStatus: 'spayed' | 'neutered' | 'intact';
  patientName: string;
}

export interface AnesthesiaHistory {
  hadAnesthesia: boolean | null;
  hadProblems: boolean;
  problemsNotes?: string;
}

export interface MedicalSystemExam {
  hasIssues: boolean;
  notes: string;
}

export interface MedicalExaminationData {
  tpr: {
    temperature: string;
    pulse: string;
    respiratory: string;
  };
  cardiovascular: MedicalSystemExam;
  auscultation?: string;
  respiratory: MedicalSystemExam;
  gastrointestinal: MedicalSystemExam;
  urogenital: MedicalSystemExam;
  renal: MedicalSystemExam;
  hepatic: MedicalSystemExam;
  musculoskeletal: MedicalSystemExam;
  neurological: MedicalSystemExam;
  dermatological: MedicalSystemExam;
  ophthalmic: MedicalSystemExam;
  oralDental: MedicalSystemExam;
  lymphatic: MedicalSystemExam;
  endocrine: MedicalSystemExam;
  otherSystem: {
    checked: boolean;
    notes: string;
  };
}

export interface MedicationData {
  drugName: string;
  dose: string;
  unit: 'mg/kg' | 'microgram/kg' | 'gram/kg' | 'total_dose';
}

export interface CaseSubmissionData {
  signalment: SignalmentData;
  chiefComplaint: string;
  anesthesiaHistory: AnesthesiaHistory;
  medicalExamination: MedicalExaminationData;
  medications: MedicationData[];
  bloodTestFiles: FileUploadResult[];
  medicalRecordFiles: FileUploadResult[];
}

export interface CaseSubmissionResult {
  success: boolean;
  caseId?: string;
  error?: string;
}

/**
 * Validates the case submission data
 */
export function validateCaseSubmission(data: CaseSubmissionData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate signalment
  if (!data.signalment.species) {
    errors.push('Species is required');
  }

  if (data.signalment.species === 'other' && !data.signalment.otherSpeciesType?.trim()) {
    errors.push('Please specify the species type when "Other" is selected');
  }

  if (data.signalment.ageYears === null || data.signalment.ageYears === undefined) {
    errors.push('Age is required');
  }

  if (data.signalment.ageYears === 0 && !data.signalment.ageMonths) {
    errors.push('Age in months is required when age is 0 years');
  }

  if (!data.signalment.weight || data.signalment.weight <= 0) {
    errors.push('Weight is required and must be greater than 0');
  }

  if (!data.signalment.spayNeuterStatus) {
    errors.push('Reproductive status is required');
  }

  if (!data.signalment.patientName?.trim()) {
    errors.push('Patient name is required');
  }

  // Validate chief complaint
  if (!data.chiefComplaint?.trim()) {
    errors.push('Chief complaint / Surgery type is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Prepares medical examination data for JSON storage
 */
function prepareMedicalExaminationJSON(data: MedicalExaminationData): any {
  return {
    tpr: data.tpr,
    systems: {
      cardiovascular: {
        ...data.cardiovascular,
        auscultation: data.auscultation || null
      },
      respiratory: data.respiratory,
      gastrointestinal: data.gastrointestinal,
      urogenital: data.urogenital,
      renal: data.renal,
      hepatic: data.hepatic,
      musculoskeletal: data.musculoskeletal,
      neurological: data.neurological,
      dermatological: data.dermatological,
      ophthalmic: data.ophthalmic,
      oralDental: data.oralDental,
      lymphatic: data.lymphatic,
      endocrine: data.endocrine,
      other: data.otherSystem.checked ? data.otherSystem.notes : null
    }
  };
}

/**
 * Prepares vital signs data for JSON storage
 */
function prepareVitalSignsJSON(tpr: MedicalExaminationData['tpr']): any {
  return {
    temperature: tpr.temperature ? parseFloat(tpr.temperature) : null,
    pulse: tpr.pulse ? parseInt(tpr.pulse) : null,
    respiratory: tpr.respiratory ? parseInt(tpr.respiratory) : null
  };
}

/**
 * Prepares medications data for JSON storage
 */
function prepareMedicationsJSON(medications: MedicationData[]): any {
  return medications
    .filter(med => med.drugName.trim() && med.dose.trim())
    .map(med => ({
      drugName: med.drugName,
      dose: parseFloat(med.dose) || 0,
      unit: med.unit
    }));
}

/**
 * Links uploaded files to a case
 */
async function linkFilesToCase(
  caseId: string,
  userId: string,
  bloodTestFiles: FileUploadResult[],
  medicalRecordFiles: FileUploadResult[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const documentsToInsert = [];

    // Add blood test files
    for (const file of bloodTestFiles) {
      if (file.success && file.fileUrl && file.fileName) {
        documentsToInsert.push({
          case_id: caseId,
          file_name: file.fileName,
          file_path: file.fileUrl,
          file_type: 'blood_test_image',
          file_size: file.fileSize || 0,
          description: 'Blood test image',
          uploaded_by: userId,
          is_primary: false
        });
      }
    }

    // Add medical record files
    for (const file of medicalRecordFiles) {
      if (file.success && file.fileUrl && file.fileName) {
        documentsToInsert.push({
          case_id: caseId,
          file_name: file.fileName,
          file_path: file.fileUrl,
          file_type: 'medical_record',
          file_size: file.fileSize || 0,
          description: 'Medical record document',
          uploaded_by: userId,
          is_primary: false
        });
      }
    }

    if (documentsToInsert.length > 0) {
      const { error } = await supabase
        .from('case_documents')
        .insert(documentsToInsert);

      if (error) {
        console.error('Error linking files to case:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error linking files to case:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error linking files'
    };
  }
}

/**
 * Submits a new case to the database
 */
export async function submitCase(data: CaseSubmissionData): Promise<CaseSubmissionResult> {
  try {
    // Get current user and session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Auth Debug:', {
      session: session ? 'Present' : 'Missing',
      user: user ? user.id : 'Missing',
      sessionError,
      authError
    });

    if (authError || !user || !session) {
      return { success: false, error: `Authentication required. User: ${user ? 'Present' : 'Missing'}, Session: ${session ? 'Present' : 'Missing'}` };
    }

    // Validate data
    const validation = validateCaseSubmission(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Prepare case data for insertion
    const caseData = {
      // Basic info
      patient_name: data.signalment.patientName,
      species: data.signalment.species,
      other_species_type: data.signalment.otherSpeciesType || null,
      breed: data.signalment.breed || null,
      age_years: data.signalment.ageYears,
      age_months: data.signalment.ageMonths || null,
      weight_kg: data.signalment.weight,
      spay_neuter_status: data.signalment.spayNeuterStatus,

      // Case details
      chief_complaint: data.chiefComplaint,
      presenting_complaint: data.chiefComplaint, // Same as chief complaint for now

      // Medical data (as JSON)
      anesthesia_history: data.anesthesiaHistory,
      physical_examination: JSON.stringify(prepareMedicalExaminationJSON(data.medicalExamination)),
      vital_signs: prepareVitalSignsJSON(data.medicalExamination.tpr),
      current_medications: JSON.stringify(prepareMedicationsJSON(data.medications)),

      // Case management
      referring_vet_id: user.id,
      status: 'submitted' as const,
      urgency: 'routine' as const, // Default urgency
      specialty_requested: 'internal_medicine' as const, // Default specialty
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert case into database
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert(caseData)
      .select('id')
      .single();

    if (caseError || !newCase) {
      console.error('Error creating case:', caseError);
      return { success: false, error: `Failed to create case: ${caseError?.message || 'Unknown error'}` };
    }

    // Link uploaded files to the case
    const linkResult = await linkFilesToCase(
      newCase.id,
      user.id,
      data.bloodTestFiles,
      data.medicalRecordFiles
    );

    if (!linkResult.success) {
      // Case was created but file linking failed
      console.error('Case created but file linking failed:', linkResult.error);
      // We could delete the case here, but it's probably better to keep it and show a warning
    }

    return {
      success: true,
      caseId: newCase.id
    };

  } catch (error) {
    console.error('Error submitting case:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Creates a case timeline entry
 */
export async function createTimelineEntry(
  caseId: string,
  action: string,
  description?: string,
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('case_timeline')
      .insert({
        case_id: caseId,
        actor_id: user.id,
        action,
        description,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating timeline entry:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating timeline entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}