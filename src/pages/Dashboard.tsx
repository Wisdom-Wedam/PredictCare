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
    <div className="space-y-8 py-4">
      {/* Welcome Banner in Midnight/Slate Premium Minimalist styling */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2.5">
            Welcome, {user.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Describe your physical health symptoms in simple, everyday language. Our system will analyze potential conditions and supply tailored general wellness guidelines.
          </p>
          <button
            onClick={() => onNavigate("predict")}
            className="px-5 py-3 bg-white text-slate-900 font-extrabold rounded-2xl text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-black/10"
          >
            <Stethoscope className="h-4 w-4 text-blue-600" />
            <span>Check Symptoms Now</span>
          </button>
        </div>
        
        <div className="absolute right-10 bottom-6 text-white/5 hidden lg:block">
          <Sparkles className="h-44 w-44" />
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-4">
          <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Assessments</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{history.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-4">
          <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Type</span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Symptom Classification</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Assessment Date</span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">
              {history.length > 0 
                ? new Date(history[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : "No assessments yet"}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Symptom Analyses</h3>
            <p className="text-xs text-slate-400 font-medium">Your last 3 physical assessment records</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => onNavigate("history")}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View All History</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading your assessments history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 font-semibold text-sm">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No Assessment Logs Found</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4 leading-relaxed font-medium">
              You haven't run any health symptom prediction analyses yet.
            </p>
            <button
              onClick={() => onNavigate("predict")}
              className="px-4 py-2.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 hover:shadow-lg transition-all"
            >
              Analyze Your First Symptom
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:-mx-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-y border-slate-100">
                  <th className="py-3.5 px-6 sm:px-8">Date</th>
                  <th className="py-3.5 px-6">Your Description</th>
                  <th className="py-3.5 px-6">Identified Symptoms</th>
                  <th className="py-3.5 px-6">Predicted Disease</th>
                  <th className="py-3.5 px-6 sm:px-8">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {history.slice(0, 3).map((item) => (
                  <tr key={item.predictionId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 sm:px-8 font-bold text-slate-700 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4.5 px-6 text-slate-500 max-w-xs truncate">
                      "{item.originalInput}"
                    </td>
                    <td className="py-4.5 px-6 text-slate-600">
                      <div className="flex flex-wrap gap-1.5">
                        {item.detectedSymptoms.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="bg-blue-50/80 border border-blue-100/50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                        {item.detectedSymptoms.length > 3 && (
                          <span className="text-[10px] text-slate-400 ml-1 self-center">+{item.detectedSymptoms.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-extrabold text-slate-800">
                      {item.predictedDisease}
                    </td>
                    <td className="py-4.5 px-6 sm:px-8 font-mono text-xs whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] ${
                        item.confidence >= 70 ? "bg-emerald-50 border border-emerald-100 text-emerald-700" :
                        item.confidence >= 40 ? "bg-blue-50 border border-blue-100 text-blue-700" : "bg-amber-50 border border-amber-100 text-amber-700"
                      }`}>
                        {item.confidence}%
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
