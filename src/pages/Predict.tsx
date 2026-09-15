/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Stethoscope, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  ShieldAlert 
} from "lucide-react";

interface PredictProps {
  onAnalyzeSymptoms: (text: string, age?: number, gender?: string) => Promise<void>;
  loading: boolean;
}

export default function Predict({ onAnalyzeSymptoms, loading }: PredictProps) {
  const [text, setText] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-populate if there are symptoms typed in home screen before logging in
    const tempSymptoms = sessionStorage.getItem("temp_symptoms");
    if (tempSymptoms) {
      setText(tempSymptoms);
      sessionStorage.removeItem("temp_symptoms"); // Consume it
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      setError("Please provide a valid age between 1 and 120.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    if (text.trim().length < 5) {
      setError("Please write a detailed description of how you are feeling (at least 5 characters).");
      return;
    }

    onAnalyzeSymptoms(text, Number(age), gender);
  };

  const setSampleText = (sample: string) => {
    setText(sample);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 py-2">
      {/* Header with clinical banner */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider w-fit">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            <span>Clinical Symptom Evaluator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Symptom Diagnostic Console
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
            Describe what you are physically experiencing in everyday, natural language. Our system identifies physical indicators and maps them to classified disease profiles.
          </p>
        </div>
        <div className="lg:col-span-4 relative hidden lg:block bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80"
            alt="Doctor consulting with patient in modern consultation room"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-black uppercase tracking-wider text-blue-300">Evidence-Based</p>
            <p className="text-sm font-bold text-slate-100">41 Disease Profiles & 132 Clinical Symptoms</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-16 text-center shadow-xl shadow-slate-200/50 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-blue-400 opacity-20" />
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Analyzing Your Symptoms...</h3>
          <p className="text-base sm:text-lg text-slate-500 max-w-lg mt-3 leading-relaxed font-medium">
            Extracting clinical keywords, computing prior probability distributions, and ranking diagnostic matches using our Naive Bayes classifier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Input Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4.5 rounded-2xl">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              )}

              {/* Patient Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full p-4.5 text-base sm:text-lg text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                    Gender
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-4.5 text-base sm:text-lg text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  Describe How You Are Feeling
                </label>
                <textarea
                  rows={6}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Example: I've had a strong headache and muscle pains for two days, accompanied by high fever, vomiting, and chills..."
                  className="w-full p-5 sm:p-6 text-base sm:text-lg text-slate-800 placeholder:text-slate-400 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-y font-sans leading-relaxed min-h-[170px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4.5 sm:py-5 px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Stethoscope className="h-6 w-6" />
                <span>Run Analysis</span>
              </button>
            </form>
          </div>

          {/* Quick Samples / Guidelines column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Example Symptom Scenarios:
                </h4>
              </div>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed font-medium">
                Select any realistic scenario below to immediately test the classifier with sample symptom text:
              </p>
              
              <div className="space-y-3.5">
                <button
                  type="button"
                  onClick={() => setSampleText("My temperature is extremely high and I've been shivering and sweating heavily with intense muscle aches and throwing up for two days.")}
                  className="w-full text-left p-4.5 border-2 border-slate-200 hover:border-blue-400 rounded-2xl text-sm sm:text-base hover:bg-blue-50/40 transition-all text-slate-700 font-bold cursor-pointer group"
                >
                  <p className="text-xs font-black uppercase text-blue-600 mb-1">Malaria / Dengue Profile</p>
                  <p className="leading-snug">"My temperature is high, I'm shivering, sweating heavily, and vomiting..."</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I have been peeing very often, feeling extremely thirsty all the time, and losing weight for no reason. I also feel tired and have blurry vision.")}
                  className="w-full text-left p-4.5 border-2 border-slate-200 hover:border-blue-400 rounded-2xl text-sm sm:text-base hover:bg-blue-50/40 transition-all text-slate-700 font-bold cursor-pointer group"
                >
                  <p className="text-xs font-black uppercase text-blue-600 mb-1">Diabetes Profile</p>
                  <p className="leading-snug">"Peeing often, excessive thirst, sudden weight loss, and blurry vision..."</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I keep coughing and sneezing. My nose is very runny and I have an itchy, painful sore throat.")}
                  className="w-full text-left p-4.5 border-2 border-slate-200 hover:border-blue-400 rounded-2xl text-sm sm:text-base hover:bg-blue-50/40 transition-all text-slate-700 font-bold cursor-pointer group"
                >
                  <p className="text-xs font-black uppercase text-blue-600 mb-1">Common Cold Profile</p>
                  <p className="leading-snug">"Persistent coughing and sneezing, runny nose with sore throat..."</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I have severe chest pain and breathlessness whenever I take stairs. My chest feels squeezed.")}
                  className="w-full text-left p-4.5 border-2 border-amber-200 hover:border-amber-400 rounded-2xl text-sm sm:text-base hover:bg-amber-50/50 transition-all text-amber-900 bg-amber-50/30 font-bold cursor-pointer group"
                >
                  <p className="text-xs font-black uppercase text-amber-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Cardiac Warning Indicator</span>
                  </p>
                  <p className="leading-snug">"Severe chest pain and breathlessness whenever I take stairs..."</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
