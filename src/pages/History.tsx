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
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="h-7 w-7 text-blue-600" />
          <span>Symptom Assessment History</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Review your chronological record of clinical-like symptom checks and machine learning disease classifications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by predicted disease, input text, or symptoms..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans shadow-xs"
          />
          <div className="absolute left-4 top-4.5 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Retrieving your record files...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 border border-red-100 rounded-3xl font-semibold text-sm">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50">
          <History className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Assessment Records Created</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed font-medium">
            You do not have any logged evaluations in our secure relational database schema.
          </p>
          <button
            onClick={() => onNavigate("predict")}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 transition-all"
          >
            Check Symptoms Now
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50">
          <p className="text-sm text-slate-500 font-medium">No records match your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredHistory.map((item) => {
            const { age, gender, cleanText } = parseDemographicsAndInput(item.originalInput);
            return (
              <div 
                key={item.predictionId}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5"
              >
                <div className="space-y-3 max-w-xl">
                  {/* Meta details row */}
                  <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-bold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full text-blue-600 font-bold">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Naive Bayes Model</span>
                    </div>
                    {(age || gender) && (
                      <div className="flex items-center gap-1 bg-blue-50/70 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                        <User className="h-3.5 w-3.5 text-blue-500" />
                        <span className="capitalize">
                          {age ? `${age} Y/O` : ""}
                          {age && gender ? " • " : ""}
                          {gender || ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Patient Natural Input */}
                  <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                    "{cleanText}"
                  </p>

                {/* Extracted Symptoms */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-1 flex items-center">
                    <FileText className="h-3 w-3 mr-0.5 text-blue-500" /> Indicators:
                  </span>
                  {item.detectedSymptoms.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="bg-blue-50/80 border border-blue-100/50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prediction details & action */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 pt-4 md:pt-0 md:border-0 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Primary Match</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-extrabold text-slate-800">
                      {item.predictedDisease}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold font-mono text-[11px] px-2 py-0.5 rounded-full border border-emerald-100">
                      {item.confidence}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onViewDetails(item.predictionId)}
                  className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-2xl transition-all cursor-pointer border border-slate-100 hover:border-blue-100"
                >
                  <ArrowRight className="h-5 w-5" />
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
