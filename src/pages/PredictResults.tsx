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
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => onNavigate("predict")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Test Another Symptom</span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {(detail.age || detail.gender) && (
            <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span className="capitalize">
                {detail.age ? `${detail.age} Y/O` : ""}
                {detail.age && detail.gender ? " • " : ""}
                {detail.gender || ""}
              </span>
            </span>
          )}
          <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3.5 py-1.5 rounded-full">
            Assessment: {new Date(date).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Critical Serious Symptoms Warning Display */}
      {hasSeriousSymptoms && (
        <div className="bg-red-50/70 border border-red-100 p-5 rounded-3xl flex items-start gap-3.5 animate-pulse shadow-sm">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-extrabold text-red-900 uppercase tracking-wide">
              Please seek immediate medical attention.
            </h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed font-medium">
              Your description matches critical or serious respiratory/cardiac symptoms (e.g., chest pain, difficulty breathing, or severe tightness). Please proceed directly to the nearest emergency healthcare center or consult an on-duty clinician immediately.
            </p>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Mapped Symptoms & Confidence comparison */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mapped Symptoms Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-blue-500" />
              <span>Extracted Physical Indicators</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {detectedSymptoms.map((symptom, idx) => (
                <span 
                  key={idx} 
                  className="bg-blue-50/70 border border-blue-100/60 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-1"
                >
                  <span className="bg-blue-500 h-1.5 w-1.5 rounded-full inline-block mr-1" />
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Machine Learning Prediction Output */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">Primary Match</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                {primaryDisease.name}
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {primaryDisease.description}
              </p>
            </div>

            {/* AI Explanation of Naive Bayes output */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>AI Clinical Interpretation</span>
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                "{aiExplanation}"
              </p>
            </div>
          </div>

          {/* Health & Clinical Recommendations Checklist */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                <span>Tailored Health Recommendations</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                General wellness suggestions based on {primaryDisease.name} patterns:
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {primaryDisease.recommendations.map((recText, idx) => (
                <div key={idx} className="py-3 flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <span className="bg-emerald-50 text-emerald-700 font-extrabold rounded-full h-5 w-5 flex items-center justify-center text-2xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{recText}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 bg-slate-50/40 -mx-6 -mb-6 p-6 rounded-b-3xl text-[11px] text-slate-500 leading-relaxed font-medium">
              <span className="font-extrabold text-amber-700">Generic Wellness Guidelines:</span> Drink at least 8 glasses of water daily, monitor your symptoms and body temperature every 4 hours, avoid physical strain, and isolate if contagions are suspected. Visit a medical professional if symptoms do not improve within 48 hours.
            </div>
          </div>

        </div>

        {/* Right Column: Comparative Bayes Classifier Scores */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-blue-500" />
                <span>Assessment Likelihoods</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                Likelihood matching for related conditions:
              </p>
            </div>

            <div className="space-y-4">
              {predictions.map((pred, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={isPrimary ? "text-slate-900 font-bold" : "text-slate-500 font-medium"}>
                        {pred.name}
                      </span>
                      <span className={isPrimary ? "text-blue-600 font-extrabold" : "text-slate-500 font-mono"}>
                        {pred.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
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
