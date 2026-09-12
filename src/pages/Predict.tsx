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
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Stethoscope className="h-7 w-7 text-blue-600" />
          <span>Symptom Diagnostic Console</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Describe what you are physically experiencing in everyday language. Do not worry about professional medical names.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 sm:p-14 text-center shadow-xl shadow-slate-200/50 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-20" />
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Analyzing Your Symptoms...</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-3 leading-relaxed">
            Analyzing your described symptoms to identify key physical indicators and evaluate potential condition matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Patient Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                    className="w-full p-4 text-base text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Gender
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-4 text-base text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all font-sans"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  How are you feeling?
                </label>
                <textarea
                  rows={5}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Example: I've had a strong headache and muscle pains for two days, and I am also running a hot fever."
                  className="w-full p-5 text-base text-slate-700 placeholder:text-slate-400 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stethoscope className="h-5 w-5" />
                <span>Perform Diagnosis</span>
              </button>
            </form>
          </div>

          {/* Quick Samples / Guidelines column */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5 text-blue-500" />
                <span>Example Phrases:</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Click any of these natural descriptions to quickly pre-populate the Diagnostic Console:
              </p>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSampleText("My temperature is extremely high and I've been shivering and sweating heavily with intense muscle aches and throwing up for two days.")}
                  className="w-full text-left p-3.5 border-2 border-slate-100 rounded-2xl text-xs hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600 font-semibold cursor-pointer"
                >
                  "My temperature is extremely high, I'm shivering, sweating, and vomiting..."
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I have been peeing very often, feeling extremely thirsty all the time, and losing weight for no reason. I also feel tired and have blurry vision.")}
                  className="w-full text-left p-3.5 border-2 border-slate-100 rounded-2xl text-xs hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600 font-semibold cursor-pointer"
                >
                  "I am peeing very often, extremely thirsty, losing weight, and have blurry vision..."
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I keep coughing and sneezing. My nose is very runny and I have an itchy, painful sore throat.")}
                  className="w-full text-left p-3.5 border-2 border-slate-100 rounded-2xl text-xs hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-600 font-semibold cursor-pointer"
                >
                  "I keep coughing and sneezing. My nose is very runny with an itchy sore throat..."
                </button>
                <button
                  type="button"
                  onClick={() => setSampleText("I have chest pain and severe shortness of breath whenever I walk. My chest feels tight.")}
                  className="w-full text-left p-3.5 border-2 border-amber-100/60 rounded-2xl text-xs hover:bg-amber-50/10 hover:border-amber-200 transition-all text-amber-800 bg-amber-50/10 font-semibold cursor-pointer"
                >
                  "I have chest pain and shortness of breath..." (Emergency Warning Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
