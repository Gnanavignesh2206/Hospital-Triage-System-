import React, { useState } from "react";
import { PatientQuery } from "@/types/triage";

interface TriageFormProps {
  onSubmit: (query: PatientQuery) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const TriageForm: React.FC<TriageFormProps> = ({
  onSubmit,
  onBack,
  isLoading = false,
}) => {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState<string>("5");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!symptoms.trim()) {
      newErrors.push("Please describe your symptoms");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const query: PatientQuery = {
      symptom_description: symptoms.trim(),
      duration: duration.trim() || undefined,
      severity_self_reported: severity ? parseInt(severity) : undefined,
    };

    onSubmit(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Describe Your Symptoms</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.length > 0 && (
          <div className="p-3 bg-red-900 text-red-200 rounded border border-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">Symptom Description *</label>
          <textarea
            placeholder="Please describe what you are experiencing. Include any relevant details about your symptoms."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm placeholder-slate-500"
          />
          <p className="text-xs text-slate-400 mt-2">
            Be as specific as possible about location, type, and intensity of symptoms.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">When did symptoms start? (optional)</label>
          <input
            type="text"
            placeholder="e.g., 2 hours ago, since yesterday, 3 days"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">
            Symptom Severity (1=minimal, 10=worst possible) *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="flex-1 cursor-pointer accent-blue-600"
            />
            <span className="text-lg font-semibold w-12 text-center text-white">{severity}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            {isLoading ? "Assessing..." : "Get Triage Assessment"}
          </button>
        </div>
      </form>
    </div>
  );
};
