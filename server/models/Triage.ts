// Triage data models

export interface TriageUrgencyLevel {
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  er_redirect: boolean;
  response_time_hours: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience_years: number;
  telehealth: boolean;
  languages: string[];
  hospital_id: string;
}

export interface AvailableSlot {
  slot_id: string;
  doctor_id: string;
  datetime: string;
  duration_minutes: number;
  is_available: boolean;
}

export interface HospitalInfo {
  hospital_id: string;
  name: string;
  er_phone: string;
  ambulance_phone: string;
  working_hours: {
    monday_friday: string;
    saturday: string;
    sunday: string;
  };
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UrgencyRouting {
  critical: {
    definition: string;
    symptoms: string[];
    action: "ER_REDIRECT" | "AMBULANCE";
  };
  high: {
    definition: string;
    symptoms: string[];
    action: "ER_REDIRECT";
  };
  medium: {
    definition: string;
    symptoms: string[];
    action: "SCHEDULE_SAME_DAY";
  };
  low: {
    definition: string;
    symptoms: string[];
    action: "SCHEDULE_ROUTINE";
  };
}

export interface PatientMetadata {
  age: number;
  sex: "M" | "F" | "Other";
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

export interface TriageAssessment {
  assessment_id: string;
  patient_query: PatientQuery;
  patient_metadata: PatientMetadata;
  timestamp: string;
  
  triage: {
    urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    confidence: number;
    urgency_reason: string;
    red_flags: string[];
    er_redirect: boolean;
    call_ambulance: boolean;
  };
  
  clinical: {
    symptom_summary: string;
    body_systems_involved: string[];
    duration_detected: string | null;
    severity_score: number;
    icd10_hints: string[];
  };
  
  recommendation: {
    recommended_specialty: string;
    secondary_specialty: string | null;
    recommended_doctor_id: string;
    recommended_doctor_name: string;
    recommended_slot: string;
    recommendation_reason: string;
    telehealth_suitable: boolean;
    alternative_doctor_id: string | null;
  };
  
  patient_facing: {
    message: string;
    follow_up_question: string | null;
    self_care: string | null;
    estimated_wait_tier: "immediate" | "within-2hrs" | "today" | "this-week";
  };
  
  flags: {
    mental_health_concern: boolean;
    pediatric_concern: boolean;
    chronic_condition_flare: boolean;
    medication_interaction_possible: boolean;
    needs_follow_up_question: boolean;
  };
  
  hospital_actions: {
    notify_er: boolean;
    display_er_number: string | null;
    display_ambulance_number: string | null;
  };
}

export interface TriageRequest {
  patient_query: PatientQuery;
  patient_metadata: PatientMetadata;
  hospital_id: string;
}

export interface TriageResponse {
  success: boolean;
  assessment: TriageAssessment | null;
  error?: string;
}
