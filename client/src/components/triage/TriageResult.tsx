import React from "react";
import { TriageAssessment } from "@/types/triage";

interface TriageResultProps {
  assessment: TriageAssessment;
  onBookAppointment: (doctorId: string, slotId: string) => void;
  onStartOver: () => void;
  isBooking?: boolean;
  bookingData?: { name: string; email: string };
  onBookingDataChange?: (data: { name: string; email: string }) => void;
}

export const TriageResult: React.FC<TriageResultProps> = ({
  assessment,
  onBookAppointment,
  onStartOver,
  isBooking = false,
  bookingData = { name: "", email: "" },
  onBookingDataChange = () => {},
}) => {
  const urgency = assessment.triage.urgency;
  const urgencyColors: Record<string, string> = {
    CRITICAL: "bg-red-700 text-red-100",
    HIGH: "bg-orange-700 text-orange-100",
    MEDIUM: "bg-yellow-700 text-yellow-100",
    LOW: "bg-green-700 text-green-100",
  };

  const isCriticalOrHigh = urgency === "CRITICAL" || urgency === "HIGH";

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Emergency Alert */}
      {isCriticalOrHigh && (
        <div className="border-2 border-red-600 bg-red-900 p-6 rounded-lg shadow-lg">
          <p className="text-red-100 font-semibold text-lg">
            {urgency === "CRITICAL"
              ? "🚨 CRITICAL - Immediate emergency care needed. Call 911 or go to the nearest ER immediately."
              : "⚠️ HIGH URGENCY - Seek emergency evaluation within hours."}
          </p>
        </div>
      )}

      {/* Emergency Contact Info */}
      {assessment.hospital_actions.display_er_number && (
        <div className="border-2 border-red-600 bg-red-950 rounded-lg p-6 shadow-lg">
          <h3 className="text-red-300 font-bold text-lg mb-4">Emergency Contacts</h3>
          <div className="space-y-3">
            {assessment.hospital_actions.display_ambulance_number && (
              <div>
                <p className="font-semibold text-red-200">Ambulance</p>
                <p className="text-3xl font-bold text-red-400">
                  {assessment.hospital_actions.display_ambulance_number}
                </p>
              </div>
            )}
            <div>
              <p className="font-semibold text-orange-200">Emergency Room</p>
              <p className="text-3xl font-bold text-orange-400">
                {assessment.hospital_actions.display_er_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Urgency and Confidence */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Triage Assessment</h3>
          <span className={`px-4 py-2 rounded-lg font-bold text-lg ${urgencyColors[urgency]}`}>
            {urgency}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-semibold text-slate-300">Urgency Reason</p>
            <p className="text-lg text-slate-400">{assessment.triage.urgency_reason}</p>
          </div>

          {assessment.triage.red_flags.length > 0 && (
            <div>
              <p className="font-semibold text-slate-300 mb-2">Red Flags Identified</p>
              <div className="flex flex-wrap gap-2">
                {assessment.triage.red_flags.map((flag, i) => (
                  <span key={i} className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-sm">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-sm text-slate-400">Assessment Confidence</p>
              <p className="text-xl font-bold text-blue-400">
                {(assessment.triage.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Severity Score</p>
              <p className="text-xl font-bold text-orange-400">{assessment.clinical.severity_score}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Clinical Summary</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-slate-300 mb-2">Symptom Summary</p>
            <p className="text-slate-400">{assessment.clinical.symptom_summary}</p>
          </div>

          {assessment.clinical.body_systems_involved.length > 0 && (
            <div>
              <p className="font-semibold text-slate-300 mb-2">Body Systems Involved</p>
              <div className="flex flex-wrap gap-2">
                {assessment.clinical.body_systems_involved.map((system, i) => (
                  <span key={i} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm capitalize">
                    {system}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assessment.clinical.duration_detected && (
            <div>
              <p className="font-semibold text-slate-300">Duration</p>
              <p className="text-slate-400">{assessment.clinical.duration_detected}</p>
            </div>
          )}

          {assessment.clinical.icd10_hints.length > 0 && (
            <div>
              <p className="font-semibold text-slate-300 mb-2">ICD-10 Categories (hints only)</p>
              <div className="flex flex-wrap gap-2">
                {assessment.clinical.icd10_hints.map((code, i) => (
                  <span key={i} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Recommendation */}
      {!isCriticalOrHigh && (
        <div className="border-2 border-green-700 bg-green-950 rounded-lg p-6 shadow-lg">
          <h3 className="text-green-400 font-bold text-lg mb-4">Recommended Appointment</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Doctor</p>
              <p className="text-lg font-bold text-white">{assessment.recommendation.recommended_doctor_name}</p>
              <p className="text-green-400">{assessment.recommendation.recommended_specialty}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Appointment Time</p>
              <p className="text-lg font-semibold text-white">
                {new Date(assessment.recommendation.recommended_slot).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Why This Doctor?</p>
              <p className="text-slate-400">{assessment.recommendation.recommendation_reason}</p>
            </div>

            {assessment.recommendation.telehealth_suitable && (
              <div className="p-3 bg-blue-900 rounded border border-blue-700">
                <p className="text-sm text-blue-300">✓ Telehealth option available</p>
              </div>
            )}

            {/* Booking Form */}
            {!assessment.hospital_actions.display_er_number && (
              <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="font-semibold text-slate-300 mb-3">Complete Booking</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={bookingData.name}
                      onChange={(e) => onBookingDataChange({ ...bookingData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={bookingData.email}
                      onChange={(e) => onBookingDataChange({ ...bookingData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() =>
                onBookAppointment(
                  assessment.recommendation.recommended_doctor_id,
                  assessment.recommendation.recommended_slot
                )
              }
              disabled={isBooking}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              {isBooking ? "Booking..." : "✓ Book This Appointment"}
            </button>
          </div>
        </div>
      )}

      {/* Patient Facing Message */}
      {assessment.patient_facing.message && (
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Important Information</h3>
          <div className="space-y-4">
            <div
              className={`p-4 rounded ${
                isCriticalOrHigh
                  ? "bg-red-900 text-red-100 border border-red-700"
                  : "bg-blue-900 text-blue-100 border border-blue-700"
              }`}
            >
              <p className="font-semibold">{assessment.patient_facing.message}</p>
            </div>

            {assessment.patient_facing.self_care && (
              <div className="p-4 bg-amber-900 rounded border border-amber-700">
                <p className="font-semibold text-amber-200 mb-2">Self-Care Tips</p>
                <p className="text-amber-300">{assessment.patient_facing.self_care}</p>
              </div>
            )}

            {assessment.patient_facing.follow_up_question && (
              <div className="p-4 bg-slate-700 rounded border border-slate-600">
                <p className="text-sm font-semibold text-slate-300 mb-2">Follow-up Question</p>
                <p className="text-slate-400">{assessment.patient_facing.follow_up_question}</p>
              </div>
            )}

            <p className="text-sm text-slate-400">
              Estimated Wait: <span className="font-semibold text-blue-400">{assessment.patient_facing.estimated_wait_tier}</span>
            </p>
          </div>
        </div>
      )}

      {/* Flags */}
      {(assessment.flags.mental_health_concern ||
        assessment.flags.pediatric_concern ||
        assessment.flags.chronic_condition_flare) && (
        <div className="bg-slate-800 border-2 border-yellow-600 rounded-lg p-6 shadow-lg">
          <h3 className="text-yellow-500 font-bold text-lg mb-4">Clinical Notes</h3>
          <ul className="space-y-2">
            {assessment.flags.mental_health_concern && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                <span className="text-slate-300">Mental health concern detected - psychiatry specialists available</span>
              </li>
            )}
            {assessment.flags.pediatric_concern && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                <span className="text-slate-300">Pediatric case - pediatric specialists may be needed</span>
              </li>
            )}
            {assessment.flags.chronic_condition_flare && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                <span className="text-slate-300">Chronic condition flare detected - specialized management recommended</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Start Over Button */}
      <button
        onClick={onStartOver}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
      >
        New Assessment
      </button>
    </div>
  );
};
