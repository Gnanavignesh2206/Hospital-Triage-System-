import React, { useState } from "react";
import { PatientIntake } from "@/components/triage/PatientIntake";
import { TriageForm } from "@/components/triage/TriageForm";
import { TriageResult } from "@/components/triage/TriageResult";
import { triageAPI } from "@/lib/services/triageAPI";
import { PatientMetadata, PatientQuery, TriageAssessment } from "@/types/triage";

type Step = "intake" | "symptoms" | "result";

export const TriagePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>("intake");
  const [patientMetadata, setPatientMetadata] = useState<PatientMetadata | null>(null);
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState<{ name: string; email: string }>({ name: "", email: "" });

  const handleIntakeSubmit = (metadata: PatientMetadata) => {
    setPatientMetadata(metadata);
    setCurrentStep("symptoms");
    setError(null);
  };

  const handleSymptomSubmit = async (query: PatientQuery) => {
    if (!patientMetadata) return;

    setIsLoading(true);
    setError(null);

    const result = await triageAPI.assessPatient(query, patientMetadata);

    if (result.success && result.assessment) {
      setAssessment(result.assessment);
      setCurrentStep("result");
    } else {
      setError(result.error || "Failed to complete assessment. Please try again.");
      console.error("Triage error:", result.error);
    }

    setIsLoading(false);
  };

  const handleBookAppointment = async (doctorId: string, slotId: string) => {
    if (!assessment) return;

    // Validate email and name
    if (!bookingData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!bookingData.email.trim() || !bookingData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      const result = await triageAPI.bookAppointment(
        doctorId,
        slotId,
        bookingData.name,
        bookingData.email,
        assessment.assessment_id
      );

      if (result.success) {
        alert(
          `Appointment booked successfully! ✓\nConfirmation has been sent to ${bookingData.email}\n\nDoctor: ${assessment.recommendation.recommended_doctor_name}\nTime: ${new Date(assessment.recommendation.recommended_slot).toLocaleString()}`
        );
        setBookingData({ name: "", email: "" });
        handleStartOver();
      } else {
        setError(result.error || "Failed to book appointment");
      }
    } catch (err: any) {
      setError(err.message || "Error booking appointment");
    }

    setIsBooking(false);
  };

  const handleStartOver = () => {
    setCurrentStep("intake");
    setPatientMetadata(null);
    setAssessment(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Clinical Triage System
          </h1>
          <p className="text-slate-400 text-lg">
            Professional patient assessment and doctor routing
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-4 mb-8">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              currentStep === "intake" || currentStep === "symptoms" || currentStep === "result"
                ? "bg-indigo-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            1
          </div>
          <div className="w-12 h-1 bg-gray-300 self-center"></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              currentStep === "symptoms" || currentStep === "result"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            2
          </div>
          <div className="w-12 h-1 bg-slate-700 self-center"></div>
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${
              currentStep === "result" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
            }`}
          >
            3
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex justify-center">
          {currentStep === "intake" && (
            <PatientIntake onNext={handleIntakeSubmit} isLoading={isLoading} />
          )}

          {currentStep === "symptoms" && patientMetadata && (
            <TriageForm
              onSubmit={handleSymptomSubmit}
              onBack={() => setCurrentStep("intake")}
              isLoading={isLoading}
            />
          )}

          {currentStep === "result" && assessment && (
            <TriageResult
              assessment={assessment}
              onBookAppointment={handleBookAppointment}
              onStartOver={handleStartOver}
              isBooking={isBooking}
              bookingData={bookingData}
              onBookingDataChange={setBookingData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>For life-threatening emergencies, call 911 immediately.</p>
          <p className="mt-1">This system is for triage assessment only, not medical diagnosis.</p>
        </div>
      </div>
    </div>
  );
};
