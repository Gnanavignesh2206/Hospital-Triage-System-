import { PatientMetadata, PatientQuery, TriageAssessment } from "@/types/triage";

export interface TriageAssessmentData {
  success: boolean;
  assessment: TriageAssessment | null;
  error?: string;
}

export interface BookAppointmentData {
  success: boolean;
  appointment?: {
    appointment_id: string;
    doctor_id: string;
    slot_id: string;
    datetime: string;
    patient_name: string;
    patient_email: string;
    assessment_id: string;
    confirmation_sent: boolean;
  };
  error?: string;
}

class TriageAPI {
  private baseURL = "/api/triage";

  async assessPatient(
    patientQuery: PatientQuery,
    patientMetadata: PatientMetadata
  ): Promise<TriageAssessmentData> {
    try {
      const response = await fetch(`${this.baseURL}/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_query: patientQuery,
          patient_metadata: patientMetadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assess patient");
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        assessment: null,
        error: error.message || "Network error during assessment",
      };
    }
  }

  async getDoctors() {
    try {
      const response = await fetch(`${this.baseURL}/doctors`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch doctors");
    }
  }

  async getDoctorSlots(doctorId: string) {
    try {
      const response = await fetch(`${this.baseURL}/slots/${doctorId}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch slots");
    }
  }

  async getHospitalInfo() {
    try {
      const response = await fetch(`${this.baseURL}/hospital-info`);
      if (!response.ok) throw new Error("Failed to fetch hospital info");
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch hospital info");
    }
  }

  async bookAppointment(
    doctorId: string,
    slotId: string,
    patientName: string,
    patientEmail: string,
    assessmentId: string
  ): Promise<BookAppointmentData> {
    try {
      const response = await fetch(`${this.baseURL}/book-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          slot_id: slotId,
          patient_name: patientName,
          patient_email: patientEmail,
          assessment_id: assessmentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book appointment");
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error during booking",
      };
    }
  }
}

export const triageAPI = new TriageAPI();
