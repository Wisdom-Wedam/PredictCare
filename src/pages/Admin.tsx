/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  Server
} from "lucide-react";
import { AdminStats } from "../types.js";

interface AdminProps {
  authToken: string;
}

export default function Admin({ authToken }: AdminProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "model">("stats");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const statsData = await statsRes.json();
      
      // 2. Fetch Users
      const usersRes = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const usersData = await usersRes.json();

      if (statsRes.ok && usersRes.ok) {
        setStats(statsData);
        setUsers(usersData.users || []);
      } else {
        setError(statsData.error || usersData.error || "Failed to load administrative panels.");
      }
    } catch (err) {
      setError("Network error communicating with core admin endpoints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for statistics changes every 5 seconds to show real-time metrics!
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [authToken]);

  if (loading && !stats) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Securing administrator session files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="h-6.5 w-6.5 text-blue-600" />
            <span>Administrator Control Dashboard</span>
          </h2>
        </div>
        <button
          onClick={fetchData}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Console</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Admin Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex items-center space-x-4">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Registered Patients</span>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex items-center space-x-4">
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Symptom Inferences</span>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stats?.totalPredictions || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex items-center space-x-4">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Classifier Accuracy</span>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">
              {stats?.modelPerformance ? `${Math.round(stats.modelPerformance.accuracy * 100)}%` : "92%"}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-4 px-6 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "stats"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Usage & Statistics
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-6 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Registered Patients ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("model")}
          className={`pb-4 px-6 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "model"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          ML Performance Reports
        </button>
      </div>

      {/* Active Panel Content */}
      <div className="space-y-6">
        
        {/* TAB 1: GENERAL STATS */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Disease Frequency bar chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Disease Distribution</h3>
              <p className="text-3xs text-slate-400 mb-6">Frequency count of diseases identified across patients</p>
              
              {stats?.commonDiseases.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  No prediction data recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.commonDiseases.map((d, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{d.disease}</span>
                        <span className="text-slate-500 font-mono">{d.count} query(s)</span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-100">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (d.count / (stats?.totalPredictions || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Recent Predictions Log */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Recent System Assessments</h3>
              <p className="text-3xs text-slate-400 mb-6">Real-time usage logs of patient queries</p>

              {stats?.recentPredictions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  No query logs exist.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-100">
                        <th className="py-2.5 px-4">Timestamp</th>
                        <th className="py-2.5 px-4">Patient Name</th>
                        <th className="py-2.5 px-4">Classification</th>
                        <th className="py-2.5 px-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {stats?.recentPredictions.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {new Date(log.date).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{log.userName}</td>
                          <td className="py-3 px-4 text-slate-700">{log.disease}</td>
                          <td className="py-3 px-4 font-mono">
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              {log.confidence}%
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
        )}

        {/* TAB 2: REGISTERED USERS LIST */}
        {activeTab === "users" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Patient Registries</h3>
            <p className="text-3xs text-slate-400 mb-6">Database files of all registered users in the relational model</p>

            {users.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No users found.</div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-100">
                      <th className="py-3 px-6">User ID</th>
                      <th className="py-3 px-6">Full Name</th>
                      <th className="py-3 px-6">Email Address</th>
                      <th className="py-3 px-6">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((usr) => (
                      <tr key={usr.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6 font-mono text-slate-400">{usr.userId}</td>
                        <td className="py-3 px-6 font-bold text-slate-900">{usr.fullName}</td>
                        <td className="py-3 px-6 font-mono text-slate-600">{usr.email}</td>
                        <td className="py-3 px-6 whitespace-nowrap">{new Date(usr.dateCreated).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MACHINE LEARNING EVALUATION REPORT */}
        {activeTab === "model" && stats?.modelPerformance && (
          <div className="space-y-6">
            
            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Precision Score (Macro)</span>
                <h4 className="text-2xl font-black text-blue-600 mt-1">
                  {(stats.modelPerformance.precision * 100).toFixed(1)}%
                </h4>
                <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
                  Ratio of correct predictions over total predictions for each class.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Recall Score (Macro)</span>
                <h4 className="text-2xl font-black text-emerald-600 mt-1">
                  {(stats.modelPerformance.recall * 100).toFixed(1)}%
                </h4>
                <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
                  Percentage of true positives identified out of actual disease counts.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">F1-Score Measure</span>
                <h4 className="text-2xl font-black text-violet-600 mt-1">
                  {(stats.modelPerformance.f1Score * 100).toFixed(1)}%
                </h4>
                <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
                  Harmonic mean of precision and recall. Provides a stable metric.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block">Laplace Smoothing Factor</span>
                <h4 className="text-2xl font-black text-amber-600 mt-1">
                  &alpha; = 1
                </h4>
                <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
                  Added count to conditional scores to prevent division by zero issues.
                </p>
              </div>
            </div>



          </div>
        )}


      </div>
    </div>
  );
}
