import React, { useState } from "react";
import { PatientMetadata } from "@/types/triage";

interface PatientIntakeProps {
  onNext: (metadata: PatientMetadata) => void;
  isLoading?: boolean;
}

export const PatientIntake: React.FC<PatientIntakeProps> = ({
  onNext,
  isLoading = false,
}) => {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "Other">("M");
  const [conditions, setConditions] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [language, setLanguage] = useState("English");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!age || isNaN(parseInt(age))) {
      newErrors.push("Valid age required");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const metadata: PatientMetadata = {
      age: parseInt(age),
      sex,
      known_conditions: conditions
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      current_medications: medications
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
      language_preference: language,
    };

    onNext(metadata);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Patient Information</h2>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">Age *</label>
            <input
              type="number"
              min="0"
              max="150"
              placeholder="e.g., 35"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">Sex *</label>
            <select
              value={sex}
              onChange={(e: any) => setSex(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">
            Known Medical Conditions (comma-separated, optional)
          </label>
          <textarea
            placeholder="e.g., Hypertension, Diabetes, Asthma"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">
            Current Medications (comma-separated, optional)
          </label>
          <textarea
            placeholder="e.g., Lisinopril, Metformin, Albuterol"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">Language Preference</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Mandarin">Mandarin</option>
            <option value="Hindi">Hindi</option>
            <option value="Gujarati">Gujarati</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
        >
          {isLoading ? "Processing..." : "Next: Describe Symptoms"}
        </button>
      </form>
    </div>
  );
};
