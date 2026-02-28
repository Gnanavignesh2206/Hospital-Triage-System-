export type UrgencyLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type WaitTier = "immediate" | "within-2hrs" | "today" | "this-week";
export type Sex = "M" | "F" | "Other";

export interface PatientMetadata {
  age: number;
  sex: Sex;
  known_conditions: string[];
  current_medications: string[];
  allergies?: string[];
  language_preference?: string;
}

export interface PatientQuery {
  symptom_description: string;
  duration?: string;
  severity_self_reported?: number;
  recent_events?: string[];
}

export interface Triage {
  urgency: UrgencyLevel;
  confidence: number;
  urgency_reason: string;
  red_flags: string[];
  er_redirect: boolean;
  call_ambulance: boolean;
}

export interface Clinical {
  symptom_summary: string;
  body_systems_involved: string[];
  duration_detected: string | null;
  severity_score: number;
  icd10_hints: string[];
}

export interface Recommendation {
  recommended_specialty: string;
  secondary_specialty: string | null;
  recommended_doctor_id: string;
  recommended_doctor_name: string;
  recommended_slot: string;
  recommendation_reason: string;
  telehealth_suitable: boolean;
  alternative_doctor_id: string | null;
}

export interface PatientFacing {
  message: string;
  follow_up_question: string | null;
  self_care: string | null;
  estimated_wait_tier: WaitTier;
}

export interface Flags {
  mental_health_concern: boolean;
  pediatric_concern: boolean;
  chronic_condition_flare: boolean;
  medication_interaction_possible: boolean;
  needs_follow_up_question: boolean;
}

export interface HospitalActions {
  notify_er: boolean;
  display_er_number: string | null;
  display_ambulance_number: string | null;
}

export interface TriageAssessment {
  assessment_id: string;
  patient_query: PatientQuery;
  patient_metadata: PatientMetadata;
  timestamp: string;
  triage: Triage;
  clinical: Clinical;
  recommendation: Recommendation;
  patient_facing: PatientFacing;
  flags: Flags;
  hospital_actions: HospitalActions;
}
