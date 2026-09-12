/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search } from "lucide-react";
import predictcareLogo from "../assets/images/predictcare_logo_1783257806029.jpg";

interface HomeProps {
  onAnalyzeSymptoms: (text: string) => void;
  isLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

export default function Home({ onAnalyzeSymptoms, isLoggedIn, onNavigate }: HomeProps) {
  const [symptomInput, setSymptomInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (symptomInput.trim().length < 5) {
      setError("Please write a detailed description of how you are feeling.");
      return;
    }

    if (!isLoggedIn) {
      // Store temporary symptom input in sessionStorage so it persists after registration/login!
      sessionStorage.setItem("temp_symptoms", symptomInput);
      onNavigate("login");
    } else {
      onAnalyzeSymptoms(symptomInput);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-6">
      {/* Main card wrapper with shadow-xl and slate-200/50 */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          {/* Subtle logo badge */}
          <div className="inline-flex w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-4 bg-white">
            <img
              src={predictcareLogo}
              alt="PredictCare Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Describe how you are feeling
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            Enter your symptoms in plain, everyday language.
          </p>
        </div>

        {/* Symptoms Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              rows={4}
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="I have fever, headache and body weakness."
              className="w-full h-44 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base sm:text-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none font-sans"
            />
            <div className="absolute right-4 bottom-4 flex items-center gap-1.5 text-slate-400">
              <Search className="h-4.5 w-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Search Assistant</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-semibold text-center bg-red-50 py-2.5 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          {/* Large Primary Button */}
          <button
            type="submit"
            className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Check My Symptoms</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        {!isLoggedIn && (
          <p className="text-[11px] text-slate-400 text-center font-medium mt-4">
            *You will be prompted to log in or register before receiving your prediction results.
          </p>
        )}
      </div>
    </div>
  );
}
