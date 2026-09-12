/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Key } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onNavigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State for Password Reset Mode
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      setResetSuccess(data.message || "Your password has been reset. Please sign in.");
      setResetEmail("");
      setNewPassword("");
      setTimeout(() => {
        setIsResetMode(false);
        setResetSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isResetMode ? "Reset Your Password" : "Sign In to Your Account"}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {isResetMode 
            ? "Enter your email address and choose a new password"
            : "Access the disease prediction system and your health history"
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {resetSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6">
          <p className="text-xs text-emerald-700 font-semibold">{resetSuccess}</p>
        </div>
      )}

      {!isResetMode ? (
        // SIGN IN FORM
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
              />
              <div className="absolute left-3.5 top-4 text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
              />
              <div className="absolute left-3.5 top-4 text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-extrabold rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          <div className="text-center mt-4">
            <span className="text-sm text-slate-500">Don't have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </form>
      ) : (
        // PASSWORD RESET FORM
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Registered Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
              />
              <div className="absolute left-3.5 top-4 text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Choose New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
              />
              <div className="absolute left-3.5 top-4 text-slate-400">
                <Key className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-extrabold rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
          >
            {loading ? "Processing Reset..." : "Reset Password"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="text-sm font-semibold text-slate-400 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
