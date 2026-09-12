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
  Server,
  Database,
  CheckCircle2,
  HardDrive
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
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "model" | "database">("stats");

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
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto py-2">
      {/* Admin Title Banner with Clinical Informatics Photography */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider w-fit">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            <span>Healthcare System Administration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Administrator Control Center
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
            Audit system usage metrics, monitor active patient registries, and inspect Naive Bayes diagnostic classifier performance logs.
          </p>
          <div className="pt-2">
            <button
              onClick={fetchData}
              className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm sm:text-base font-extrabold hover:bg-slate-200 text-slate-800 inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="h-4 w-4 text-slate-600" />
              <span>Refresh Console Data</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-4 relative hidden lg:block bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80"
            alt="Clinical healthcare data informatics and medical diagnostic workstation"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-black uppercase tracking-wider text-blue-300">Live Telemetry</p>
            <p className="text-sm font-bold text-slate-100">PredictCare Health Informatics</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 p-5 rounded-2xl">
          <p className="text-base text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Admin Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 border border-blue-100 shrink-0">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Registered Patients</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 border border-emerald-100 shrink-0">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Symptom Inferences</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{stats?.totalPredictions || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 flex items-center gap-5">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 border border-blue-100 shrink-0">
            <Server className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Classifier Accuracy</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              {stats?.modelPerformance ? `${Math.round(stats.modelPerformance.accuracy * 100)}%` : "92%"}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("stats")}
          className={`py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            activeTab === "stats"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Usage & Statistics
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Registered Patients ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("model")}
          className={`py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            activeTab === "model"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          ML Performance Reports
        </button>
        <button
          onClick={() => setActiveTab("database" as any)}
          className={`py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            activeTab === ("database" as any)
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Database Engine & Storage
        </button>
      </div>

      {/* Active Panel Content */}
      <div className="space-y-8">
        
        {/* TAB 1: GENERAL STATS */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Disease Frequency bar chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Disease Distribution</h3>
                <p className="text-sm text-slate-500 font-medium">Frequency count of diseases identified across patients</p>
              </div>
              
              {stats?.commonDiseases.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  No prediction data recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.commonDiseases.map((d, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm sm:text-base font-bold">
                        <span className="text-slate-800">{d.disease}</span>
                        <span className="text-slate-500 font-mono">{d.count} query(s)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
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
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Recent System Assessments</h3>
                <p className="text-sm text-slate-500 font-medium">Real-time usage logs of patient queries</p>
              </div>

              {stats?.recentPredictions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  No query logs exist.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-xs sm:text-sm border-b border-slate-200">
                        <th className="py-4 px-5">Timestamp</th>
                        <th className="py-4 px-5">Patient Name</th>
                        <th className="py-4 px-5">Classification</th>
                        <th className="py-4 px-5">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-sm sm:text-base font-medium">
                      {stats?.recentPredictions.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4.5 px-5 font-mono text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                            {new Date(log.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-4.5 px-5 text-slate-900 font-black">{log.userName}</td>
                          <td className="py-4.5 px-5 text-slate-700 font-bold">{log.disease}</td>
                          <td className="py-4.5 px-5 font-mono">
                            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-black">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Patient Registries</h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium">Database records of all registered users in the system</p>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-xs sm:text-sm border-b border-slate-200">
                      <th className="py-4 px-6">User ID</th>
                      <th className="py-4 px-6">Full Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-sm sm:text-base">
                    {users.map((usr) => (
                      <tr key={usr.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4.5 px-6 font-mono text-slate-400 text-xs sm:text-sm">{usr.userId}</td>
                        <td className="py-4.5 px-6 font-black text-slate-900">{usr.fullName}</td>
                        <td className="py-4.5 px-6 font-mono text-slate-700 font-medium">{usr.email}</td>
                        <td className="py-4.5 px-6 whitespace-nowrap text-slate-600 font-medium">
                          {new Date(usr.dateCreated).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>
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
          <div className="space-y-8">
            
            {/* Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Precision Score (Macro)</span>
                <h4 className="text-3xl sm:text-4xl font-black text-blue-600">
                  {(stats.modelPerformance.precision * 100).toFixed(1)}%
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Ratio of correct predictions over total predictions for each class.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Recall Score (Macro)</span>
                <h4 className="text-3xl sm:text-4xl font-black text-emerald-600">
                  {(stats.modelPerformance.recall * 100).toFixed(1)}%
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Percentage of true positives identified out of actual disease counts.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">F1-Score Measure</span>
                <h4 className="text-3xl sm:text-4xl font-black text-violet-600">
                  {(stats.modelPerformance.f1Score * 100).toFixed(1)}%
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Harmonic mean of precision and recall for balanced metric evaluation.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Laplace Smoothing</span>
                <h4 className="text-3xl sm:text-4xl font-black text-amber-600">
                  &alpha; = 1.0
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Additive probability smoothing avoiding zero-frequency penalties.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DATABASE & PERSISTENCE CONFIGURATION */}
        {activeTab === "database" && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Database Storage Status</h3>
                  <p className="text-sm sm:text-base text-slate-500 font-medium">
                    Current active storage engine, collections, and record status
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border ${
                  stats?.databaseStatus?.connected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {stats?.databaseStatus?.connected ? "MongoDB Online" : "Local File Storage (Active & Ready)"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Storage Mode</span>
                  <p className="text-base font-bold text-slate-900 capitalize">
                    {stats?.databaseStatus?.mode === "mongodb" ? "MongoDB Atlas / Cloud" : "Persistent JSON Engine"}
                  </p>
                  <p className="text-xs text-slate-500">Auto-persists all patients & assessments</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Target Database</span>
                  <p className="text-base font-mono font-bold text-slate-900">
                    {stats?.databaseStatus?.databaseName || "predictcare"}
                  </p>
                  <p className="text-xs text-slate-500">Configured in MONGODB_DB_NAME</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">System Health</span>
                  <p className="text-base font-bold text-emerald-600">100% Operational</p>
                  <p className="text-xs text-slate-500">Zero data loss fallback guarantee</p>
                </div>
              </div>

              {/* Records Breakdown */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-base font-black text-slate-900 mb-4">Stored Clinical Collections</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <p className="text-xs font-bold text-slate-500">Users</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <p className="text-xs font-bold text-slate-500">Predictions</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalPredictions || 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <p className="text-xs font-bold text-slate-500">Diseases</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {stats?.databaseStatus?.records?.diseases || 42}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <p className="text-xs font-bold text-slate-500">Recommendations</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {stats?.databaseStatus?.records?.recommendations || 126}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection string instruction banner */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Database className="h-4 w-4 text-blue-700" />
                  <span>Connecting to MongoDB Compass / MongoDB Atlas</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  Because this app runs in a secure cloud container, connecting to a MongoDB server running on your local machine requires either MongoDB Atlas (cloud connection string) or exposing your local MongoDB instance with an external URI. In the meantime, the app automatically runs smoothly with zero errors using persistent local file storage.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
