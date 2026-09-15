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
    <div className="max-w-5xl mx-auto my-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
      {/* Visual Healthcare Column - Doctor / Patient Consultation Photography */}
      <div className="lg:col-span-5 relative hidden md:block min-h-[420px] bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80"
          alt="Healthcare doctor in consultation with patient"
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
          <span className="px-3 py-1 bg-blue-500/30 backdrop-blur-md border border-blue-400/40 text-blue-200 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block">
            Secure Patient Portal
          </span>
          <h3 className="text-2xl font-black tracking-tight leading-snug">
            Compassionate Care Driven by Diagnostic Data
          </h3>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            Sign in to track ongoing symptoms, review historical assessments, and receive clinical machine learning recommendations.
          </p>
        </div>
      </div>

      {/* Form Interaction Column - Roomy & High Visibility */}
      <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isResetMode ? "Reset Your Password" : "Sign In to Your Account"}
          </h2>
          <p className="text-base text-slate-600 font-medium mt-2">
            {isResetMode 
              ? "Enter your email address to set a new password"
              : "Access the machine learning disease prediction system and your medical logs"
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {resetSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6">
            <p className="text-sm text-emerald-700 font-bold">{resetSuccess}</p>
          </div>
        )}

        {!isResetMode ? (
          // SIGN IN FORM
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
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
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? "Authenticating..." : "Sign In to PredictCare"}
            </button>

            <div className="text-center pt-2">
              <span className="text-base text-slate-600 font-medium">Don't have an account? </span>
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="text-base font-extrabold text-blue-600 hover:underline cursor-pointer ml-1"
              >
                Create an Account
              </button>
            </div>
          </form>
        ) : (
          // PASSWORD RESET FORM
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Choose New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Key className="h-5 w-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? "Processing Reset..." : "Reset Password"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-base font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
