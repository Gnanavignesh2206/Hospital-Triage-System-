import { Router } from "express";
import { triageService } from "../services/triageService";
import {
  TriageRequest,
  Doctor,
  AvailableSlot,
  HospitalInfo,
  PatientMetadata,
  PatientQuery,
} from "../models/Triage";

const triageRouter = Router();

// Mock data - in production, these come from database
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_001",
    name: "Dr. Sarah Chen",
    specialty: "emergency medicine",
    experience_years: 12,
    telehealth: false,
    languages: ["English", "Mandarin"],
    hospital_id: "hospital_001",
  },
  {
    id: "doc_002",
    name: "Dr. James Wilson",
    specialty: "cardiology",
    experience_years: 15,
    telehealth: true,
    languages: ["English"],
    hospital_id: "hospital_001",
  },
  {
    id: "doc_003",
    name: "Dr. Maria Garcia",
    specialty: "internal medicine",
    experience_years: 10,
    telehealth: true,
    languages: ["English", "Spanish"],
    hospital_id: "hospital_001",
  },
  {
    id: "doc_004",
    name: "Dr. Priya Patel",
    specialty: "psychiatry",
    experience_years: 8,
    telehealth: true,
    languages: ["English", "Hindi", "Gujarati"],
    hospital_id: "hospital_001",
  },
  {
    id: "doc_005",
    name: "Dr. Michael Thompson",
    specialty: "pulmonology",
    experience_years: 18,
    telehealth: false,
    languages: ["English"],
    hospital_id: "hospital_001",
  },
  {
    id: "doc_006",
    name: "Dr. Lisa Wong",
    specialty: "neurology",
    experience_years: 11,
    telehealth: true,
    languages: ["English", "Mandarin"],
    hospital_id: "hospital_001",
  },
];

const MOCK_SLOTS: AvailableSlot[] = [
  {
    slot_id: "slot_001",
    doctor_id: "doc_001",
    datetime: "2026-02-28T14:00:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_002",
    doctor_id: "doc_001",
    datetime: "2026-02-28T14:30:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_003",
    doctor_id: "doc_002",
    datetime: "2026-03-01T10:00:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_004",
    doctor_id: "doc_002",
    datetime: "2026-03-01T10:30:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_005",
    doctor_id: "doc_003",
    datetime: "2026-02-28T15:00:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_006",
    doctor_id: "doc_004",
    datetime: "2026-03-02T09:00:00Z",
    duration_minutes: 45,
    is_available: true,
  },
  {
    slot_id: "slot_007",
    doctor_id: "doc_005",
    datetime: "2026-03-01T13:00:00Z",
    duration_minutes: 30,
    is_available: true,
  },
  {
    slot_id: "slot_008",
    doctor_id: "doc_006",
    datetime: "2026-03-01T14:00:00Z",
    duration_minutes: 30,
    is_available: true,
  },
];

const MOCK_HOSPITAL: HospitalInfo = {
  hospital_id: "hospital_001",
  name: "Central Medical Center",
  er_phone: "+1-800-911-1234",
  ambulance_phone: "+1-800-911-0911",
  working_hours: {
    monday_friday: "8:00 AM - 10:00 PM",
    saturday: "9:00 AM - 8:00 PM",
    sunday: "10:00 AM - 6:00 PM",
  },
  address: "123 Medical Drive, Healthcare City, ST 12345",
  coordinates: {
    latitude: 40.7128,
    longitude: -74.006,
  },
};

/**
 * POST /api/triage/assess
 * Assess patient and return triage recommendation
 */
triageRouter.post("/assess", async (req, res) => {
  try {
    const { patient_query, patient_metadata } = req.body;

    // Validate input
    if (!patient_query || !patient_query.symptom_description) {
      return res.status(400).json({
        success: false,
        error: "Missing required: patient_query.symptom_description",
        assessment: null,
      });
    }

    if (!patient_metadata || !patient_metadata.age) {
      return res.status(400).json({
        success: false,
        error: "Missing required: patient_metadata.age",
        assessment: null,
      });
    }

    // Build request
    const triageRequest: TriageRequest = {
      patient_query,
      patient_metadata,
      hospital_id: "hospital_001",
    };

    // Perform assessment
    const assessment = await triageService.assessPatient(
      triageRequest,
      MOCK_DOCTORS,
      MOCK_SLOTS,
      MOCK_HOSPITAL
    );

    res.json({
      success: true,
      assessment,
      error: null,
    });
  } catch (error: any) {
    console.error("Triage assessment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      assessment: null,
    });
  }
});

/**
 * GET /api/triage/doctors
 * Get list of available doctors
 */
triageRouter.get("/doctors", (req, res) => {
  res.json({
    success: true,
    data: MOCK_DOCTORS,
  });
});

/**
 * GET /api/triage/slots/:doctorId
 * Get available slots for a doctor
 */
triageRouter.get("/slots/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const doctorSlots = MOCK_SLOTS.filter(
    (s) => s.doctor_id === doctorId && s.is_available
  );

  res.json({
    success: true,
    data: doctorSlots,
  });
});

/**
 * GET /api/triage/hospital-info
 * Get hospital information
 */
triageRouter.get("/hospital-info", (req, res) => {
  res.json({
    success: true,
    data: MOCK_HOSPITAL,
  });
});

/**
 * POST /api/triage/book-appointment
 * Book an appointment after triage assessment
 */
triageRouter.post("/book-appointment", async (req, res) => {
  try {
    const { doctor_id, slot_id, patient_name, patient_email, assessment_id } =
      req.body;

    if (!doctor_id || !slot_id || !patient_name || !patient_email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Find the slot
    const slot = MOCK_SLOTS.find((s) => s.slot_id === slot_id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        error: "Slot not found",
      });
    }

    // Mark as unavailable
    slot.is_available = false;

    // In production, save to database and send confirmation email
    res.json({
      success: true,
      appointment: {
        appointment_id: `appt_${Date.now()}`,
        doctor_id,
        slot_id,
        datetime: slot.datetime,
        patient_name,
        patient_email,
        assessment_id,
        confirmation_sent: true,
      },
    });
  } catch (error: any) {
    console.error("Appointment booking error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default triageRouter;
