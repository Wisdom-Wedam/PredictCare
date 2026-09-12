/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Stethoscope, 
  History, 
  ChevronRight, 
  Calendar, 
  Sparkles 
} from "lucide-react";
import { User, HistoryItem } from "../types.js";

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  authToken: string;
}

export default function Dashboard({ user, onNavigate, authToken }: DashboardProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(data.error || "Failed to load dashboard data.");
        }
      } catch (err) {
        setError("Network error fetching statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authToken]);

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto py-2">
      {/* Top Banner with Digital Healthcare Photography */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider w-fit">
            <Activity className="h-4 w-4" />
            <span>Digital Patient Health Console</span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Welcome back, {user.fullName}!
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-2 font-medium leading-relaxed max-w-xl">
              Describe your physical symptoms in simple, everyday language. Our validated machine learning model analyzes your indicators and provides evidence-backed triage guidance.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate("predict")}
              className="px-7 py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black rounded-2xl text-base sm:text-lg hover:shadow-lg shadow-blue-200 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Check Symptoms Now</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Digital Healthcare Photo */}
        <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-[340px] bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
            alt="Doctor and clinical team reviewing digital patient diagnostics"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Metrics Widgets - Large Numbers & Clear Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5">
          <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl text-blue-600 shrink-0 border border-blue-100">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Assessments</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{history.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5">
          <div className="bg-emerald-50 p-4 sm:p-5 rounded-2xl text-emerald-600 shrink-0 border border-emerald-100">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Analysis Method</span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">Multi-Symptom NB</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5 sm:col-span-2 md:col-span-1">
          <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl text-amber-600 shrink-0 border border-amber-100">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Last Evaluation</span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {history.length > 0 
                ? new Date(history[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : "No assessments yet"}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent History Table - High Visibility & Comfortable Padding */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Symptom Analyses</h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Your recent clinical assessment queries</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => onNavigate("history")}
              className="text-base font-extrabold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All Records</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-base text-slate-500 font-medium">Loading your assessments history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 font-bold text-base">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-6">
            <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-800">No Assessment Records Yet</h4>
            <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mt-2 mb-6 leading-relaxed font-medium">
              You haven't run any health symptom prediction analyses yet. Enter your symptoms to receive an instant machine learning triage.
            </p>
            <button
              onClick={() => onNavigate("predict")}
              className="px-6 py-3.5 bg-blue-600 text-white text-base font-extrabold rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer"
            >
              Analyze Your First Symptom
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-8 sm:-mx-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs sm:text-sm uppercase tracking-wider font-extrabold border-y border-slate-200">
                  <th className="py-4.5 px-8">Date</th>
                  <th className="py-4.5 px-6">Description</th>
                  <th className="py-4.5 px-6">Identified Symptoms</th>
                  <th className="py-4.5 px-6">Predicted Disease</th>
                  <th className="py-4.5 px-8">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base font-medium">
                {history.slice(0, 3).map((item) => (
                  <tr key={item.predictionId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-5 px-8 font-bold text-slate-800 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-5 px-6 text-slate-600 max-w-xs truncate italic font-normal">
                      "{item.originalInput}"
                    </td>
                    <td className="py-5 px-6 text-slate-700">
                      <div className="flex flex-wrap gap-1.5">
                        {item.detectedSymptoms.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                        {item.detectedSymptoms.length > 3 && (
                          <span className="text-xs text-slate-500 font-bold ml-1 self-center">+{item.detectedSymptoms.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 font-black text-slate-900 text-base sm:text-lg">
                      {item.predictedDisease}
                    </td>
                    <td className="py-5 px-8 whitespace-nowrap">
                      <span className={`px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm ${
                        item.confidence >= 70 ? "bg-emerald-50 border border-emerald-200 text-emerald-700" :
                        item.confidence >= 40 ? "bg-blue-50 border border-blue-200 text-blue-700" : "bg-amber-50 border border-amber-200 text-amber-700"
                      }`}>
                        {item.confidence}% Match
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
