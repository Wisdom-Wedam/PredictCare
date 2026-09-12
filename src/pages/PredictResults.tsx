/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  ArrowLeft, 
  FileText, 
  ShieldAlert, 
  User, 
  HelpCircle 
} from "lucide-react";
import { PredictionDetail } from "../types.js";

interface PredictResultsProps {
  detail: PredictionDetail | null;
  onNavigate: (page: string) => void;
}

export default function PredictResults({ detail, onNavigate }: PredictResultsProps) {
  if (!detail) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">No prediction details found.</p>
        <button
          onClick={() => onNavigate("predict")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    detectedSymptoms,
    predictions,
    primaryDisease,
    aiExplanation,
    hasSeriousSymptoms,
    date
  } = detail;

  // Select color themes based on the highest confidence score
  const highestScore = predictions[0]?.score || 0;
  const isHighConfidence = highestScore >= 70;

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 py-2">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => onNavigate("predict")}
          className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm sm:text-base font-extrabold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Test Another Symptom</span>
        </button>
        <div className="flex flex-wrap items-center gap-3">
          {(detail.age || detail.gender) && (
            <span className="text-sm text-blue-800 font-extrabold bg-blue-50 border border-blue-200 px-4 py-2 rounded-full flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="capitalize">
                {detail.age ? `${detail.age} Y/O` : ""}
                {detail.age && detail.gender ? " • " : ""}
                {detail.gender || ""}
              </span>
            </span>
          )}
          <span className="text-xs sm:text-sm text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            Assessment: {new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
      </div>

      {/* Critical Serious Symptoms Warning Display */}
      {hasSeriousSymptoms && (
        <div className="bg-red-50 border-2 border-red-300 p-6 sm:p-8 rounded-3xl flex items-start gap-4 shadow-md">
          <AlertTriangle className="h-8 w-8 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-red-900 tracking-tight">
              Please Seek Immediate Medical Attention
            </h3>
            <p className="text-base text-red-800 leading-relaxed font-semibold">
              Your description matches critical or serious respiratory/cardiac symptoms (such as acute chest pain, severe difficulty breathing, or tight pressure). Please proceed directly to the nearest emergency medical facility or call local emergency services immediately.
            </p>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Mapped Symptoms & Confidence comparison */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Mapped Symptoms Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50">
            <h3 className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Extracted Physical Indicators</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {detectedSymptoms.map((symptom, idx) => (
                <span 
                  key={idx} 
                  className="bg-blue-50 border border-blue-200 text-blue-800 font-extrabold text-sm sm:text-base px-4 py-2 rounded-2xl flex items-center space-x-1.5"
                >
                  <span className="bg-blue-600 h-2 w-2 rounded-full inline-block mr-1" />
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Machine Learning Prediction Output */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                Primary Machine Learning Match
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">
                {primaryDisease.name}
              </h3>
              <p className="text-base sm:text-lg text-slate-600 mt-2.5 leading-relaxed font-medium">
                {primaryDisease.description}
              </p>
            </div>

            {/* AI Explanation of Naive Bayes output */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-blue-600" />
                <span>Clinical Pattern Interpretation</span>
              </h4>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed italic font-medium">
                "{aiExplanation}"
              </p>
            </div>
          </div>

          {/* Health & Clinical Recommendations Checklist */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Tailored Health Recommendations</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mt-1 font-semibold">
                General clinical guidance based on {primaryDisease.name} characteristics:
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {primaryDisease.recommendations.map((recText, idx) => (
                <div key={idx} className="py-4 flex items-start gap-4 text-base sm:text-lg text-slate-800 font-medium">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-black rounded-full h-7 w-7 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{recText}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-5 bg-slate-50/60 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 p-7 sm:p-9 rounded-b-3xl text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              <span className="font-black text-amber-800 block mb-1">Standard Patient Advisory:</span> 
              Drink at least 8 glasses of water daily, monitor temperature every 4 hours, maintain physical rest, and consult a certified medical practitioner if symptoms intensify or fail to improve within 48 hours.
            </div>
          </div>

        </div>

        {/* Right Column: Comparative Bayes Classifier Scores */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Likelihood Rankings</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-semibold">
                Differential diagnostic scores across conditions:
              </p>
            </div>

            <div className="space-y-5">
              {predictions.map((pred, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base font-bold">
                      <span className={isPrimary ? "text-slate-900 font-black" : "text-slate-600 font-medium"}>
                        {pred.name}
                      </span>
                      <span className={isPrimary ? "text-blue-600 font-black" : "text-slate-500 font-mono"}>
                        {pred.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isPrimary 
                            ? isHighConfidence 
                              ? "bg-emerald-500" 
                              : "bg-blue-600" 
                            : "bg-slate-300"
                        }`}
                        style={{ width: `${pred.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
