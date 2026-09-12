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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
      {/* Profile summary card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 h-fit space-y-6">
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-100/60 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto text-xl font-bold uppercase mb-3 shadow-xs">
            {user.fullName.charAt(0)}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{user.fullName}</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-2">
            Registered Patient
          </span>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4 text-xs font-semibold">
          <div className="flex items-center justify-between gap-2 text-slate-600">
            <span className="text-slate-400">Email Address</span>
            <span className="text-slate-800 font-mono text-right truncate max-w-[150px]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-slate-600">
            <span className="text-slate-400">Account ID</span>
            <span className="text-slate-800 font-mono text-right truncate max-w-[120px]">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Security Update Password form */}
      <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Account Security Settings</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Update your password to ensure secure, authorized medical evaluations log access.</p>
        </div>

        <div className="border-t border-slate-100 mt-6 pt-6">
          {error && (
            <div className="bg-red-50/70 border border-red-100 p-4 rounded-2xl mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl mb-6 flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 focus:bg-white transition-all text-sm font-sans"
                />
                <div className="absolute left-3.5 top-4 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 focus:bg-white transition-all text-sm font-sans"
                  />
                  <div className="absolute left-3.5 top-4 text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 focus:bg-white transition-all text-sm font-sans"
                  />
                  <div className="absolute left-3.5 top-4 text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all cursor-pointer"
              >
                {loading ? "Updating password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
