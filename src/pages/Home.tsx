/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Sparkles, Activity, ShieldCheck, Stethoscope, ArrowRight } from "lucide-react";
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
      setError("Please write a detailed description of how you are feeling (at least 5 characters).");
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
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Top Hero Banner with Realistic Healthcare + Technology Photography */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white flex items-center justify-center shrink-0">
              <img
                src={predictcareLogo}
                alt="PredictCare Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Clinical Triaging & Machine Learning
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Describe How You Are <span className="text-blue-600">Feeling</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              Type your symptoms in natural, everyday language. PredictCare uses validated Bernoulli Naive Bayes machine learning to map physical indicators and deliver tailored health guidance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">11 Conditions</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Activity className="h-5 w-5 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">96.4% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">AI Explanations</span>
            </div>
          </div>
        </div>

        {/* Hero Healthcare + Tech Image */}
        <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[380px] bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
            alt="Doctor reviewing digital health diagnostics on a tablet"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-white/20 lg:to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-lg text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Hospital Grade Data Triaging</p>
              <p className="text-[11px] text-slate-500 font-medium">Trained on clinical datasets of multi-symptom presentations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Symptom Assessment Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sm:p-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Start Your Symptom Assessment
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Enter your physical signs in plain words (e.g., headache, high temperature, body chills, fatigue).
            </p>
          </div>

          {/* Symptoms Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                rows={5}
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="Example: I have a high fever, severe headache, throwing up, and shivering muscle aches for two days."
                className="w-full h-48 sm:h-52 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-base sm:text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none font-sans leading-relaxed"
              />
              <div className="absolute right-5 bottom-5 flex items-center gap-2 text-slate-400 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Search className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">NLP Classifier</span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-700 font-bold text-center bg-red-50 py-3.5 px-4 rounded-2xl border border-red-200">
                {error}
              </div>
            )}

            {/* Prominent Large Button */}
            <button
              type="submit"
              className="w-full py-5 px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg sm:text-xl font-black rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Stethoscope className="h-6 w-6" />
              <span>Analyze & Predict Health Condition</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {!isLoggedIn ? (
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                * You will be prompted to sign in or create an account so your prediction and customized care plan are securely saved to your history.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 pt-2 text-xs sm:text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Signed in. Your results will automatically link to your personal health record.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
