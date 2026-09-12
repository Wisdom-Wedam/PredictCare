/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User as UserIcon, Lock, Key, Mail, Calendar, CheckCircle } from "lucide-react";
import { User } from "../types.js";

interface ProfileProps {
  user: User;
  authToken: string;
}

export default function Profile({ user, authToken }: ProfileProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match. Please verify.");
      return;
    }

    if (newPassword.length < 6) {
      setError("The new password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password update failed.");
      }

      setSuccess(data.message || "Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 py-2">
      {/* Header Banner with Patient Care Photography */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider w-fit">
            <UserIcon className="h-4 w-4 text-blue-600" />
            <span>Patient Profile & Credential Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Account Management
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
            Manage your personal healthcare account details and maintain encrypted credential security for your machine learning diagnostics logs.
          </p>
        </div>
        <div className="lg:col-span-4 relative hidden lg:block bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80"
            alt="Healthcare professional reviewing patient medical profile"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-black uppercase tracking-wider text-blue-300">Protected Data</p>
            <p className="text-sm font-bold text-slate-100">Encrypted Patient Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile summary card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="text-center">
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-full h-20 w-20 flex items-center justify-center mx-auto text-3xl font-black uppercase mb-4 shadow-sm">
              {user.fullName.charAt(0)}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.fullName}</h3>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full inline-block mt-3 uppercase tracking-wider">
              Registered Patient
            </span>
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-4 text-sm font-bold">
            <div className="flex flex-col gap-1 text-slate-600">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Email Address</span>
              <span className="text-slate-900 font-medium text-base break-all">{user.email}</span>
            </div>
            <div className="flex flex-col gap-1 text-slate-600">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Patient System ID</span>
              <span className="text-slate-700 font-mono text-xs bg-slate-100 p-2 rounded-xl break-all">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Security Update Password form */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Security & Credentials</h3>
            <p className="text-base text-slate-500 mt-1 font-medium">Update your password to ensure secure, authorized medical evaluations log access.</p>
          </div>

          <div className="border-t border-slate-200 mt-6 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4.5 rounded-2xl mb-6">
                <p className="text-base text-red-700 font-bold">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 p-4.5 rounded-2xl mb-6 flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-base text-emerald-800 font-bold">{success}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                  />
                  <div className="absolute left-4 top-4.5 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                    />
                    <div className="absolute left-4 top-4.5 text-slate-400">
                      <Key className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                    />
                    <div className="absolute left-4 top-4.5 text-slate-400">
                      <Key className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer"
                >
                  {loading ? "Updating password..." : "Update Account Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
