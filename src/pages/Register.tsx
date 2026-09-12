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
    <div className="max-w-md mx-auto my-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Patient Account
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Register to keep an accurate log of your health assessments and predicted history
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">
          <p className="text-xs text-red-700 font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. John Doe"
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
            />
            <div className="absolute left-3.5 top-4 text-slate-400">
              <User className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Choose Password
          </label>
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

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm font-sans"
            />
            <div className="absolute left-3.5 top-4 text-slate-400">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-extrabold rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center"
        >
          {loading ? "Registering account..." : "Sign Up"}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-slate-500">Already have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
