export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_primary: boolean | null
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_primary?: boolean | null
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_primary?: boolean | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_reports: {
        Row: {
          case_id: string
          clinical_summary: string | null
          created_at: string
          diagnosis_details: Json | null
          digital_signature: Json | null
          disclaimer_text: string | null
          email_recipients: string[] | null
          email_sent_at: string | null
          email_status: string | null
          file_size: number | null
          follow_up_instructions: string | null
          generated_at: string | null
          id: string
          pdf_file_path: string | null
          prognosis_assessment: string | null
          report_number: string
          report_status: Database["public"]["Enums"]["report_status"]
          report_type: Database["public"]["Enums"]["report_type"]
          security_settings: Json | null
          sent_at: string | null
          specialist_id: string
          template_used: string | null
          title: string
          treatment_recommendations: string | null
          updated_at: string
          watermark_applied: boolean | null
        }
        Insert: {
          case_id: string
          clinical_summary?: string | null
          created_at?: string
          diagnosis_details?: Json | null
          digital_signature?: Json | null
          disclaimer_text?: string | null
          email_recipients?: string[] | null
          email_sent_at?: string | null
          email_status?: string | null
          file_size?: number | null
          follow_up_instructions?: string | null
          generated_at?: string | null
          id?: string
          pdf_file_path?: string | null
          prognosis_assessment?: string | null
          report_number: string
          report_status?: Database["public"]["Enums"]["report_status"]
          report_type?: Database["public"]["Enums"]["report_type"]
          security_settings?: Json | null
          sent_at?: string | null
          specialist_id: string
          template_used?: string | null
          title: string
          treatment_recommendations?: string | null
          updated_at?: string
          watermark_applied?: boolean | null
        }
        Update: {
          case_id?: string
          clinical_summary?: string | null
          created_at?: string
          diagnosis_details?: Json | null
          digital_signature?: Json | null
          disclaimer_text?: string | null
          email_recipients?: string[] | null
          email_sent_at?: string | null
          email_status?: string | null
          file_size?: number | null
          follow_up_instructions?: string | null
          generated_at?: string | null
          id?: string
          pdf_file_path?: string | null
          prognosis_assessment?: string | null
          report_number?: string
          report_status?: Database["public"]["Enums"]["report_status"]
          report_type?: Database["public"]["Enums"]["report_type"]
          security_settings?: Json | null
          sent_at?: string | null
          specialist_id?: string
          template_used?: string | null
          title?: string
          treatment_recommendations?: string | null
          updated_at?: string
          watermark_applied?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "case_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_reports_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_responses: {
        Row: {
          case_id: string
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          follow_up_needed: boolean | null
          id: string
          is_final_response: boolean | null
          prognosis: string | null
          referral_recommendations: string | null
          response_text: string
          specialist_id: string
          treatment_recommendations: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_final_response?: boolean | null
          prognosis?: string | null
          referral_recommendations?: string | null
          response_text: string
          specialist_id: string
          treatment_recommendations?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_final_response?: boolean | null
          prognosis?: string | null
          referral_recommendations?: string | null
          response_text?: string
          specialist_id?: string
          treatment_recommendations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_responses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_responses_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_timeline: {
        Row: {
          action: string
          actor_id: string
          case_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          case_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          case_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_timeline_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timeline_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          accepted_at: string | null
          age_months: number | null
          age_years: number | null
          anesthesia_history: Json | null
          body_condition_score: number | null
          breed: string | null
          chief_complaint: string
          completed_at: string | null
          complexity_rating: number | null
          created_at: string
          current_medications: string | null
          diagnostic_results: string | null
          differential_diagnoses: string | null
          estimated_hours: number | null
          gender: string | null
          id: string
          medical_history: Json | null
          other_species_type: string | null
          patient_name: string
          physical_examination: string | null
          presenting_complaint: string
          previous_consultations: string | null
          questions_for_specialist: string | null
          referring_vet_id: string
          severity_score: number | null
          spay_neuter_status: Database["public"]["Enums"]["spay_neuter_status"] | null
          specialist_id: string | null
          specialty_requested: Database["public"]["Enums"]["specialty_area"]
          species: Database["public"]["Enums"]["animal_species"]
          status: Database["public"]["Enums"]["case_status"]
          submitted_at: string
          surgery_type: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["case_urgency"]
          vital_signs: Json | null
          weight_kg: number | null
          working_diagnosis: string | null
        }
        Insert: {
          accepted_at?: string | null
          age_months?: number | null
          age_years?: number | null
          anesthesia_history?: Json | null
          body_condition_score?: number | null
          breed?: string | null
          chief_complaint: string
          completed_at?: string | null
          complexity_rating?: number | null
          created_at?: string
          current_medications?: string | null
          diagnostic_results?: string | null
          differential_diagnoses?: string | null
          estimated_hours?: number | null
          gender?: string | null
          id?: string
          medical_history?: Json | null
          other_species_type?: string | null
          patient_name: string
          physical_examination?: string | null
          presenting_complaint: string
          previous_consultations?: string | null
          questions_for_specialist?: string | null
          referring_vet_id: string
          severity_score?: number | null
          spay_neuter_status?: Database["public"]["Enums"]["spay_neuter_status"] | null
          specialist_id?: string | null
          specialty_requested: Database["public"]["Enums"]["specialty_area"]
          species: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string
          surgery_type?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
          vital_signs?: Json | null
          weight_kg?: number | null
          working_diagnosis?: string | null
        }
        Update: {
          accepted_at?: string | null
          age_months?: number | null
          age_years?: number | null
          anesthesia_history?: Json | null
          body_condition_score?: number | null
          breed?: string | null
          chief_complaint?: string
          completed_at?: string | null
          complexity_rating?: number | null
          created_at?: string
          current_medications?: string | null
          diagnostic_results?: string | null
          differential_diagnoses?: string | null
          estimated_hours?: number | null
          gender?: string | null
          id?: string
          medical_history?: Json | null
          other_species_type?: string | null
          patient_name?: string
          physical_examination?: string | null
          presenting_complaint?: string
          previous_consultations?: string | null
          questions_for_specialist?: string | null
          referring_vet_id?: string
          severity_score?: number | null
          spay_neuter_status?: Database["public"]["Enums"]["spay_neuter_status"] | null
          specialist_id?: string | null
          specialty_requested?: Database["public"]["Enums"]["specialty_area"]
          species?: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string
          surgery_type?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
          vital_signs?: Json | null
          weight_kg?: number | null
          working_diagnosis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_referring_vet_id_fkey"
            columns: ["referring_vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          clinic_name: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          phone: string | null
          rating: number | null
          response_time_hours: number | null
          role: Database["public"]["Enums"]["user_role"]
          specialty_area: Database["public"]["Enums"]["specialty_area"] | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          clinic_name?: string | null
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          response_time_hours?: number | null
          role: Database["public"]["Enums"]["user_role"]
          specialty_area?: Database["public"]["Enums"]["specialty_area"] | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          clinic_name?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          response_time_hours?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty_area?: Database["public"]["Enums"]["specialty_area"] | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      specialist_letterheads: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          board_certifications: string[] | null
          city: string | null
          color_scheme: Json | null
          country: string | null
          created_at: string
          credentials: string[] | null
          email: string | null
          fax: string | null
          font_preferences: Json | null
          footer_template: string | null
          header_template: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          license_numbers: string[] | null
          phone: string | null
          postal_code: string | null
          practice_logo_url: string | null
          practice_name: string
          specialist_id: string
          specialties: string[] | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          board_certifications?: string[] | null
          city?: string | null
          color_scheme?: Json | null
          country?: string | null
          created_at?: string
          credentials?: string[] | null
          email?: string | null
          fax?: string | null
          font_preferences?: Json | null
          footer_template?: string | null
          header_template?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          license_numbers?: string[] | null
          phone?: string | null
          postal_code?: string | null
          practice_logo_url?: string | null
          practice_name: string
          specialist_id: string
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          board_certifications?: string[] | null
          city?: string | null
          color_scheme?: Json | null
          country?: string | null
          created_at?: string
          credentials?: string[] | null
          email?: string | null
          fax?: string | null
          font_preferences?: Json | null
          footer_template?: string | null
          header_template?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          license_numbers?: string[] | null
          phone?: string | null
          postal_code?: string | null
          practice_logo_url?: string | null
          practice_name?: string
          specialist_id?: string
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_letterheads_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_report_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      animal_species: "dog" | "cat" | "horse" | "bird" | "rabbit" | "other"
      case_status:
        | "submitted"
        | "reviewing"
        | "in_progress"
        | "completed"
        | "follow_up_needed"
        | "declined"
      case_urgency: "routine" | "urgent" | "emergency"
      report_status: "draft" | "generated" | "sent" | "archived"
      report_type:
        | "consultation"
        | "second_opinion"
        | "emergency_response"
        | "follow_up"
      specialty_area:
        | "anesthesia"
        | "cardiology"
        | "dermatology"
        | "emergency"
        | "internal_medicine"
        | "neurology"
        | "oncology"
        | "ophthalmology"
        | "orthopedics"
        | "surgery"
      spay_neuter_status: "spayed" | "neutered" | "intact"
      user_role: "referring_vet" | "specialist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      animal_species: ["dog", "cat", "horse", "bird", "rabbit", "other"],
      case_status: [
        "submitted",
        "reviewing",
        "in_progress",
        "completed",
        "follow_up_needed",
        "declined",
      ],
      case_urgency: ["routine", "urgent", "emergency"],
      report_status: ["draft", "generated", "sent", "archived"],
      report_type: [
        "consultation",
        "second_opinion",
        "emergency_response",
        "follow_up",
      ],
      specialty_area: [
        "anesthesia",
        "cardiology",
        "dermatology",
        "emergency",
        "internal_medicine",
        "neurology",
        "oncology",
        "ophthalmology",
        "orthopedics",
        "surgery",
      ],
      user_role: ["referring_vet", "specialist"],
    },
  },
} as const
