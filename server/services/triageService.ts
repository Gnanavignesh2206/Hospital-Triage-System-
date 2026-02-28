import {
  TriageAssessment,
  TriageRequest,
  PatientMetadata,
  PatientQuery,
  Doctor,
  AvailableSlot,
  HospitalInfo,
} from "../models/Triage";

export class TriageService {
  /**
   * Main entry point: assess patient and route to appropriate doctor
   */
  async assessPatient(
    request: TriageRequest,
    doctors: Doctor[],
    slots: AvailableSlot[],
    hospitalInfo: HospitalInfo
  ): Promise<TriageAssessment> {
    const { patient_query, patient_metadata } = request;

    // 1. Determine urgency level
    const urgencyResult = this.determineUrgency(patient_query, patient_metadata);

    // 2. Extract clinical information from query
    const clinical = this.extractClinicalInfo(patient_query, urgencyResult.urgency);

    // 3. Find best matching doctor
    const doctorMatch = this.findBestDoctor(
      urgencyResult.urgency,
      clinical.body_systems_involved,
      patient_metadata,
      doctors,
      slots
    );

    // 4. Determine confidence and follow-up needs
    const confidence = this.calculateConfidence(
      patient_query,
      urgencyResult.has_red_flags
    );

    // 5. Generate patient-facing message
    const patientFacing = this.generatePatientFacingMessage(
      urgencyResult.urgency,
      confidence,
      doctorMatch
    );

    // 6. Detect flags
    const flags = this.detectFlags(patient_query, patient_metadata);

    // 7. Determine hospital actions
    const hospitalActions = this.determineHospitalActions(
      urgencyResult.urgency,
      hospitalInfo
    );

    return {
      assessment_id: `triage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patient_query,
      patient_metadata,
      timestamp: new Date().toISOString(),
      triage: {
        urgency: urgencyResult.urgency,
        confidence,
        urgency_reason: urgencyResult.reason,
        red_flags: urgencyResult.red_flags,
        er_redirect: urgencyResult.urgency === "CRITICAL" || urgencyResult.urgency === "HIGH",
        call_ambulance: urgencyResult.urgency === "CRITICAL" && urgencyResult.has_severe_red_flag,
      },
      clinical,
      recommendation: {
        recommended_specialty: doctorMatch.specialty,
        secondary_specialty: doctorMatch.secondary_specialty,
        recommended_doctor_id: doctorMatch.doctor_id,
        recommended_doctor_name: doctorMatch.doctor_name,
        recommended_slot: doctorMatch.slot,
        recommendation_reason: doctorMatch.reason,
        telehealth_suitable:
          urgencyResult.urgency === "LOW" ||
          (urgencyResult.urgency === "MEDIUM" && doctorMatch.telehealth),
        alternative_doctor_id: doctorMatch.alternative_doctor_id,
      },
      patient_facing: patientFacing,
      flags,
      hospital_actions: hospitalActions,
    };
  }

  /**
   * Determine urgency level based on symptoms and metadata
   */
  private determineUrgency(
    query: PatientQuery,
    metadata: PatientMetadata
  ): {
    urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    reason: string;
    red_flags: string[];
    has_red_flags: boolean;
    has_severe_red_flag: boolean;
  } {
    const symptoms = (query.symptom_description || "").toLowerCase();
    const conditions = metadata.known_conditions || [];
    const medications = metadata.current_medications || [];
    const age = metadata.age;

    let urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    const red_flags: string[] = [];
    let has_severe_red_flag = false;

    // CRITICAL conditions
    const criticalKeywords = [
      "chest pain",
      "chest tightness",
      "difficulty breathing",
      "shortness of breath",
      "unable to breathe",
      "unconscious",
      "unresponsive",
      "seizure",
      "stroke",
      "severe bleeding",
      "uncontrolled bleeding",
      "severe allergic",
      "anaphylaxis",
      "acute severe headache",
      "sudden severe headache",
      "suicidal",
      "self harm",
      "overdose",
      "poisoning",
      "loss of consciousness",
      "severe trauma",
    ];

    for (const keyword of criticalKeywords) {
      if (symptoms.includes(keyword)) {
        urgency = "CRITICAL";
        red_flags.push(keyword);
        has_severe_red_flag = true;
      }
    }

    // Metadata modifiers for CRITICAL
    if (urgency !== "CRITICAL") {
      // High-risk comorbidity + chest/respiratory symptoms
      const hasHighRiskCondition = conditions.some((c) =>
        /heart|cardiac|coronary|arrhythmia|hypertension|diabetes|copd|asthma|cancer/i.test(c)
      );
      const hasChestRespiratorySymptom =
        /chest|heart|breathing|respiratory|lung|oxygen|asthma|cough|wheezing/i.test(symptoms);

      if (hasHighRiskCondition && hasChestRespiratorySymptom) {
        urgency = "CRITICAL";
        red_flags.push("High-risk condition with chest/respiratory symptoms");
        has_severe_red_flag = true;
      }

      // Anticoagulants + bleeding
      const onAnticoagulants = medications.some((m) =>
        /warfarin|coumadin|apixaban|rivaroxaban|dabigatran|edoxaban|heparin|aspirin/i.test(m)
      );
      const hasBleedingSymptom =
        /bleeding|bleed|hemorrhage|blood|bruise|hemorrhaging/i.test(symptoms);

      if (onAnticoagulants && hasBleedingSymptom) {
        urgency = "CRITICAL";
        red_flags.push("Anticoagulant use with bleeding symptoms");
        has_severe_red_flag = true;
      }

      // Hypertension + sudden severe headache
      const hasHypertension = conditions.some((c) => /hypertension|high blood pressure/i.test(c));
      const hasSuddenHeadache =
        /sudden.*headache|severe headache|worst headache|thunderclap/i.test(symptoms);

      if (hasHypertension && hasSuddenHeadache) {
        urgency = "CRITICAL";
        red_flags.push("Hypertension with sudden severe headache");
        has_severe_red_flag = true;
      }
    }

    // HIGH conditions (if not already CRITICAL)
    if (urgency === "LOW" || urgency === "MEDIUM") {
      const highKeywords = [
        "severe pain",
        "vomiting",
        "severe nausea",
        "fever over 103",
        "persistent vomiting",
        "confusion",
        "disorientation",
        "severe dizziness",
        "vision changes",
        "weakness",
        "paralysis",
        "severe injury",
        "fracture",
        "sprain",
        "deep cut",
        "burn",
      ];

      for (const keyword of highKeywords) {
        if (symptoms.includes(keyword)) {
          if (urgency === "LOW") urgency = "HIGH";
          red_flags.push(keyword);
        }
      }
    }

    // MEDIUM conditions (if not already higher)
    if (urgency === "LOW") {
      const mediumKeywords = [
        "moderate pain",
        "mild fever",
        "sore throat",
        "cough",
        "runny nose",
        "mild headache",
        "stomach pain",
        "diarrhea",
        "rash",
        "itching",
        "minor cut",
        "wound",
        "sprained ankle",
      ];

      for (const keyword of mediumKeywords) {
        if (symptoms.includes(keyword)) {
          urgency = "MEDIUM";
          break;
        }
      }
    }

    // Age modifiers (escalate ambiguous by one level)
    if ((age < 5 || age > 75) && (urgency === "MEDIUM" || urgency === "LOW")) {
      if (urgency === "MEDIUM") urgency = "HIGH";
      else if (urgency === "LOW") urgency = "MEDIUM";
      red_flags.push(`Age ${age} - escalated for caution`);
    }

    const reasonMap = {
      CRITICAL: "Immediate life-threatening condition requiring emergency evaluation",
      HIGH: "Serious symptoms requiring emergency evaluation within hours",
      MEDIUM: "Symptoms requiring same-day or next-day medical attention",
      LOW: "Mild or non-urgent symptoms suitable for routine appointment",
    };

    return {
      urgency,
      reason: reasonMap[urgency],
      red_flags,
      has_red_flags: red_flags.length > 0,
      has_severe_red_flag,
    };
  }

  /**
   * Extract clinical information from symptom description
   */
  private extractClinicalInfo(
    query: PatientQuery,
    urgency: string
  ): {
    symptom_summary: string;
    body_systems_involved: string[];
    duration_detected: string | null;
    severity_score: number;
    icd10_hints: string[];
  } {
    const symptom = (query.symptom_description || "").toLowerCase();
    const duration = this.extractDuration(query.symptom_description || "");

    // Body systems mapping
    const systemsMap: { [key: string]: string[] } = {
      cardiovascular: [
        "chest",
        "heart",
        "cardiac",
        "palpitation",
        "arrhythmia",
        "blood pressure",
      ],
      respiratory: [
        "breathing",
        "respiratory",
        "lung",
        "oxygen",
        "asthma",
        "cough",
        "wheezing",
        "shortness",
      ],
      neurological: [
        "headache",
        "dizziness",
        "seizure",
        "stroke",
        "confusion",
        "numbness",
        "tingling",
      ],
      gastrointestinal: [
        "stomach",
        "nausea",
        "vomiting",
        "diarrhea",
        "abdominal",
        "constipation",
      ],
      musculoskeletal: [
        "pain",
        "fracture",
        "sprain",
        "joint",
        "muscle",
        "back",
        "neck",
      ],
      dermatological: ["rash", "itching", "skin", "burn", "wound"],
      infectious: ["fever", "chills", "infection", "flu", "cold"],
      psychiatric: ["anxiety", "depression", "panic", "stress", "suicidal"],
    };

    const body_systems_involved: string[] = [];
    for (const [system, keywords] of Object.entries(systemsMap)) {
      for (const keyword of keywords) {
        if (symptom.includes(keyword)) {
          body_systems_involved.push(system);
          break;
        }
      }
    }

    // Severity score (1-10)
    let severity = 3; // baseline
    if (/severe|critical|extreme/i.test(symptom)) severity = 8;
    else if (/moderate|significant/i.test(symptom)) severity = 6;
    else if (/mild|slight|minor/i.test(symptom)) severity = 3;

    if (urgency === "CRITICAL") severity = 9;
    else if (urgency === "HIGH") severity = Math.max(severity, 7);

    // ICD-10 hints based on symptoms
    const icd10_hints: string[] = [];
    if (symptom.includes("chest")) icd10_hints.push("I10-I25"); // Hypertension, coronary disease
    if (symptom.includes("breathing"))
      icd10_hints.push("J00-J99"); // Respiratory system
    if (symptom.includes("headache")) icd10_hints.push("G89-G90"); // Pain, headache
    if (symptom.includes("fever")) icd10_hints.push("R50"); // Fever
    if (symptom.includes("fever") || symptom.includes("cough"))
      icd10_hints.push("J09-J18"); // Influenza, pneumonia
    if (body_systems_involved.includes("psychiatric"))
      icd10_hints.push("F20-F99"); // Mental health

    const summaryPrefix = query.symptom_description || "Patient presenting with unspecified symptoms";
    const symptom_summary =
      `${summaryPrefix}. Clinical assessment indicates ${body_systems_involved.length > 0 ? `involvement of ${body_systems_involved.join(", ")} systems` : "non-specific presentation"}. ` +
      (duration ? `Symptoms have persisted for ${duration}.` : "Onset timing unclear.");

    return {
      symptom_summary: symptom_summary.substring(0, 300), // Cap at reasonable length
      body_systems_involved,
      duration_detected: duration,
      severity_score: Math.min(10, Math.max(1, severity)),
      icd10_hints: icd10_hints.slice(0, 3),
    };
  }

  /**
   * Extract duration from natural language
   */
  private extractDuration(text: string): string | null {
    const durationPatterns = [
      /(\d+)\s*hours?/i,
      /(\d+)\s*days?/i,
      /(\d+)\s*weeks?/i,
      /(\d+)\s*months?/i,
      /(few|several)\s*(hours?|days?|weeks?)/i,
      /since (yesterday|today|this morning)/i,
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Find best matching doctor from roster
   */
  private findBestDoctor(
    urgency: string,
    body_systems: string[],
    metadata: PatientMetadata,
    doctors: Doctor[],
    slots: AvailableSlot[]
  ): {
    doctor_id: string;
    doctor_name: string;
    specialty: string;
    secondary_specialty: string | null;
    slot: string;
    reason: string;
    telehealth: boolean;
    alternative_doctor_id: string | null;
  } {
    // Specialty mapping from body systems
    const specialtyMap: { [key: string]: string[] } = {
      cardiovascular: ["cardiology", "emergency medicine", "internal medicine"],
      respiratory: ["pulmonology", "emergency medicine", "internal medicine"],
      neurological: ["neurology", "emergency medicine", "internal medicine"],
      gastrointestinal: ["gastroenterology", "internal medicine"],
      musculoskeletal: ["orthopedics", "physical medicine"],
      dermatological: ["dermatology"],
      infectious: ["infectious disease", "internal medicine"],
      psychiatric: ["psychiatry", "psychology", "mental health"],
    };

    // For CRITICAL or HIGH, prioritize Emergency Medicine
    let preferredSpecialties: string[] = [];
    if (urgency === "CRITICAL" || urgency === "HIGH") {
      preferredSpecialties.push("emergency medicine");
    }

    // Add specialties based on body systems
    for (const system of body_systems) {
      const specs = specialtyMap[system] || [];
      preferredSpecialties.push(...specs);
    }

    // Fallback specialties
    if (preferredSpecialties.length === 0) {
      preferredSpecialties = ["internal medicine", "general practice", "urgent care"];
    }

    // Rank doctors by specialty match and availability
    const ranked = doctors
      .map((doc) => {
        let score = 0;

        // Specialty match
        const specialtyMatch = preferredSpecialties.findIndex(
          (spec) => spec.toLowerCase() === doc.specialty.toLowerCase()
        );
        score += specialtyMatch >= 0 ? 100 - specialtyMatch * 10 : 0;

        // Language match (if specified)
        if (metadata.language_preference) {
          if (
            doc.languages.some(
              (lang) => lang.toLowerCase() === metadata.language_preference?.toLowerCase()
            )
          ) {
            score += 20;
          }
        }

        // Telehealth preference for LOW urgency
        if (urgency === "LOW" && doc.telehealth) {
          score += 10;
        }

        // Experience (slight bonus)
        score += doc.experience_years * 0.5;

        // Check if doctor has available slots
        const hasSlot = slots.some(
          (s) => s.doctor_id === doc.id && s.is_available
        );
        if (!hasSlot) score -= 50;

        return { ...doc, score };
      })
      .sort((a, b) => b.score - a.score);

    // Get primary doctor and slot
    const primaryDoctor = ranked[0];
    if (!primaryDoctor) {
      throw new Error("No doctors available");
    }

    const primarySlot = slots.find(
      (s) => s.doctor_id === primaryDoctor.id && s.is_available
    );
    if (!primarySlot) {
      throw new Error(`No available slots for doctor ${primaryDoctor.id}`);
    }

    // Get secondary specialty
    const secondaryDoc = ranked.find(
      (doc) => doc.id !== primaryDoctor.id && 
      doc.specialty.toLowerCase() !== primaryDoctor.specialty.toLowerCase()
    );

    // Get alternative doctor ID
    const alternativeDoc = ranked.find((doc) => doc.id !== primaryDoctor.id);

    return {
      doctor_id: primaryDoctor.id,
      doctor_name: primaryDoctor.name,
      specialty: primaryDoctor.specialty,
      secondary_specialty: secondaryDoc?.specialty || null,
      slot: primarySlot.datetime,
      reason: `${primaryDoctor.name} (${primaryDoctor.specialty}) is well-suited for your symptoms with available appointment at ${primarySlot.datetime}.`,
      telehealth: primaryDoctor.telehealth,
      alternative_doctor_id: alternativeDoc?.id || null,
    };
  }

  /**
   * Calculate confidence based on symptom specificity
   */
  private calculateConfidence(query: PatientQuery, hasRedFlags: boolean): number {
    const symptomLength = (query.symptom_description || "").length;
    const hasDuration = !!query.duration_detected;
    const hasSeverity = typeof query.severity_self_reported === "number";

    let confidence = 0.6; // baseline

    if (symptomLength > 50) confidence += 0.15;
    if (symptomLength > 100) confidence += 0.1;
    if (hasDuration) confidence += 0.1;
    if (hasSeverity) confidence += 0.05;
    if (hasRedFlags) confidence += 0.1;

    return Math.min(1.0, Math.max(0.3, confidence));
  }

  /**
   * Generate patient-facing message
   */
  private generatePatientFacingMessage(
    urgency: string,
    confidence: number,
    doctorMatch: any
  ): {
    message: string;
    follow_up_question: string | null;
    self_care: string | null;
    estimated_wait_tier: "immediate" | "within-2hrs" | "today" | "this-week";
  } {
    const messages: { [key: string]: string } = {
      CRITICAL: "Your symptoms require immediate emergency evaluation. Please go to the nearest emergency room or call 911 immediately.",
      HIGH: `Your symptoms need urgent medical attention. We're connecting you with ${doctorMatch.doctor_name} for evaluation.`,
      MEDIUM: `Your symptoms warrant same-day evaluation. We've scheduled you with ${doctorMatch.doctor_name} (${doctorMatch.specialty}).`,
      LOW: `Your symptoms are non-urgent. We've scheduled you with ${doctorMatch.doctor_name} for routine evaluation.`,
    };

    const waitTiers: { [key: string]: "immediate" | "within-2hrs" | "today" | "this-week" } = {
      CRITICAL: "immediate",
      HIGH: "within-2hrs",
      MEDIUM: "today",
      LOW: "this-week",
    };

    const followUpQuestion =
      confidence < 0.75
        ? "Could you provide more details about when these symptoms started or any recent triggers?"
        : null;

    const selfCare: { [key: string]: string | null } = {
      CRITICAL: null,
      HIGH: null,
      MEDIUM:
        "Rest, stay hydrated, and monitor your symptoms. Seek immediate care if symptoms worsen.",
      LOW: "Over-the-counter pain relievers and rest may help. Follow up with your doctor as scheduled.",
    };

    return {
      message: messages[urgency],
      follow_up_question: followUpQuestion,
      self_care: selfCare[urgency],
      estimated_wait_tier: waitTiers[urgency],
    };
  }

  /**
   * Detect clinical flags
   */
  private detectFlags(
    query: PatientQuery,
    metadata: PatientMetadata
  ): {
    mental_health_concern: boolean;
    pediatric_concern: boolean;
    chronic_condition_flare: boolean;
    medication_interaction_possible: boolean;
    needs_follow_up_question: boolean;
  } {
    const symptom = (query.symptom_description || "").toLowerCase();

    return {
      mental_health_concern: /suicidal|self harm|depression|anxiety|panic|psychosis/i.test(
        symptom
      ),
      pediatric_concern: metadata.age < 18,
      chronic_condition_flare:
        metadata.known_conditions.length > 0 &&
        /flare|exacerbation|worsening|recurrence/i.test(symptom),
      medication_interaction_possible: metadata.current_medications.length > 2,
      needs_follow_up_question: /unclear|vague|unsure|not sure/i.test(symptom),
    };
  }

  /**
   * Determine hospital actions
   */
  private determineHospitalActions(
    urgency: string,
    hospitalInfo: HospitalInfo
  ): {
    notify_er: boolean;
    display_er_number: string | null;
    display_ambulance_number: string | null;
  } {
    const notifyER = urgency === "CRITICAL";
    const displayER = urgency === "CRITICAL" || urgency === "HIGH";
    const displayAmbulance = urgency === "CRITICAL";

    return {
      notify_er: notifyER,
      display_er_number: displayER ? hospitalInfo.er_phone : null,
      display_ambulance_number: displayAmbulance ? hospitalInfo.ambulance_phone : null,
    };
  }
}

export const triageService = new TriageService();
