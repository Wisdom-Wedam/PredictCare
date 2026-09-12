/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { History, Calendar, FileText, ArrowRight, Activity, Search, User } from "lucide-react";
import { HistoryItem } from "../types.js";

interface HistoryProps {
  authToken: string;
  onNavigate: (page: string) => void;
  onViewDetails: (predictionId: string) => Promise<void>;
}

export default function HistoryPage({ authToken, onNavigate, onViewDetails }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const parseDemographicsAndInput = (inputStr: string) => {
    const match = inputStr.match(/^\[Age:\s*([^,]+),\s*Gender:\s*([^\]]+)\]\s*(.*)$/i);
    if (match) {
      return {
        age: match[1] === "N/A" ? null : match[1],
        gender: match[2] === "N/A" ? null : match[2],
        cleanText: match[3]
      };
    }
    return {
      age: null,
      gender: null,
      cleanText: inputStr
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/predictions/history", {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setHistory(data.history || []);
        } else {
          setError(data.error || "Failed to retrieve history logs.");
        }
      } catch (err) {
        setError("Network connection failure.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authToken]);

  const filteredHistory = history.filter((item) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      item.predictedDisease.toLowerCase().includes(searchStr) ||
      item.originalInput.toLowerCase().includes(searchStr) ||
      item.detectedSymptoms.some((s) => s.toLowerCase().includes(searchStr))
    );
  });

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto py-2">
      {/* Header Banner with Clinical Records Photography */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider w-fit">
            <History className="h-4 w-4 text-blue-600" />
            <span>Patient Longitudinal Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Symptom Assessment History
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
            Review your chronological record of clinical-grade symptom evaluations and Naive Bayes disease classifications.
          </p>
        </div>
        <div className="lg:col-span-4 relative hidden lg:block bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
            alt="Clinician reviewing clinical patient medical records and diagnostic files"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-black uppercase tracking-wider text-blue-300">Verified History</p>
            <p className="text-sm font-bold text-slate-100">Persistent Diagnostic Logs</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assessments by disease name, described symptoms, or input text..."
            className="w-full pl-14 pr-5 py-4.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans shadow-sm"
          />
          <div className="absolute left-5 top-5 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-base text-slate-500 font-medium">Retrieving your record files...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 border border-red-200 rounded-3xl font-bold text-base">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
          <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-800">No Assessment Records Created</h3>
          <p className="text-base text-slate-500 mt-2 mb-6 max-w-md mx-auto leading-relaxed font-medium">
            You do not have any logged evaluations yet. Run a symptom analysis to begin tracking your records.
          </p>
          <button
            onClick={() => onNavigate("predict")}
            className="px-7 py-4 bg-blue-600 text-white text-base font-extrabold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer"
          >
            Check Symptoms Now
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
          <p className="text-base sm:text-lg text-slate-500 font-medium">No records match your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((item) => {
            const { age, gender, cleanText } = parseDemographicsAndInput(item.originalInput);
            return (
              <div 
                key={item.predictionId}
                className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 hover:border-blue-300 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                <div className="space-y-4 max-w-2xl flex-1">
                  {/* Meta details row */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-1.5 rounded-full text-slate-600 border border-slate-200">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3.5 py-1.5 rounded-full text-blue-700 border border-blue-200">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span>Naive Bayes Model</span>
                    </div>
                    {(age || gender) && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-200">
                        <User className="h-4 w-4 text-emerald-600" />
                        <span className="capitalize">
                          {age ? `${age} Y/O` : ""}
                          {age && gender ? " • " : ""}
                          {gender || ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Patient Natural Input */}
                  <p className="text-base sm:text-lg text-slate-600 italic font-normal leading-relaxed">
                    "{cleanText}"
                  </p>

                  {/* Extracted Symptoms */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1 flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1 text-blue-600" /> Indicators:
                    </span>
                    {item.detectedSymptoms.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold px-3 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prediction details & action */}
                <div className="flex items-center gap-5 w-full lg:w-auto justify-between lg:justify-end border-t border-slate-200 pt-5 lg:pt-0 lg:border-0 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold block">Primary Match</span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        {item.predictedDisease}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 font-black text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-200">
                        {item.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewDetails(item.predictionId)}
                    className="px-5 py-3.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-extrabold text-sm sm:text-base rounded-2xl transition-all cursor-pointer border border-blue-200 hover:border-blue-600 flex items-center gap-2 shadow-sm"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
