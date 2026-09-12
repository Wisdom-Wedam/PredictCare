/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Lock, Mail, ChevronRight, Eye, EyeOff } from "lucide-react";

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: () => void;
}

export default function Register({ onNavigate, onRegisterSuccess }: RegisterProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
      {/* Visual Healthcare Column - Healthcare Professional Photography */}
      <div className="lg:col-span-5 relative hidden md:block min-h-[440px] bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80"
          alt="Healthcare doctor welcoming patient in modern clinic"
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
          <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-200 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block">
            Personal Health Account
          </span>
          <h3 className="text-2xl font-black tracking-tight leading-snug">
            Proactive Health Starts with Accurate Symptoms Tracking
          </h3>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            Create an account to preserve all your symptom evaluations, track health progress across time, and receive evidence-based machine learning guidance.
          </p>
        </div>
      </div>

      {/* Form Interaction Column - Roomy & High Visibility */}
      <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Patient Account
          </h2>
          <p className="text-base text-slate-600 font-medium mt-2">
            Register to keep an accurate record of your machine learning health assessments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base sm:text-lg font-sans"
              />
              <div className="absolute left-4 top-4.5 text-slate-400">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-11 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-11 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base font-sans"
                />
                <div className="absolute left-4 top-4.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
          >
            {loading ? "Registering account..." : "Complete Registration"}
          </button>

          <div className="text-center pt-2">
            <span className="text-base text-slate-600 font-medium">Already have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-base font-extrabold text-blue-600 hover:underline cursor-pointer ml-1"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
