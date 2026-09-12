/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  HeartPulse, 
  Activity, 
  User as UserIcon, 
  History, 
  LogOut, 
  Database, 
  Stethoscope, 
  ShieldAlert,
  Menu,
  X
} from "lucide-react";
import { User } from "../types.js";
import predictcareLogo from "../assets/images/predictcare_logo_1783257806029.jpg";

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export default function Layout({
  user,
  onLogout,
  currentPage,
  onNavigate,
  children
}: LayoutProps) {
  const isPatient = user && !user.isAdmin;
  const isAdmin = user && user.isAdmin;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Background Graphic Elements for Clean Minimalism */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

      {/* Professional Healthcare Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div 
                className="flex items-center space-x-2.5 cursor-pointer"
                onClick={() => user ? (user.isAdmin ? onNavigate("admin") : onNavigate("home")) : onNavigate("home")}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-2xs border border-slate-150 flex items-center justify-center bg-white">
                  <img
                    src={predictcareLogo}
                    alt="PredictCare Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                    Predict<span className="text-blue-600">Care</span>
                  </h1>
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest block mt-0.5">
                    Symptom Assessment Assistant
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menus depending on state */}
            {user && (
              <div className="hidden md:flex items-center space-x-1.5 sm:space-x-3">
                {isPatient && (
                  <>
                    <button
                      onClick={() => onNavigate("home")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === "home"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      Home
                    </button>
                    <button
                      onClick={() => onNavigate("dashboard")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === "dashboard"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate("predict")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1 ${
                        currentPage === "predict" || currentPage === "results"
                          ? "bg-emerald-50 text-emerald-700 font-bold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>Check Symptoms</span>
                    </button>
                    <button
                      onClick={() => onNavigate("history")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1 ${
                        currentPage === "history"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <History className="h-4 w-4" />
                      <span>My History</span>
                    </button>
                    <button
                      onClick={() => onNavigate("profile")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1 ${
                        currentPage === "profile"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => onNavigate("admin")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1 ${
                        currentPage === "admin"
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <Activity className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </button>
                  </>
                )}

                {/* Shared Logout Button */}
                <button
                  onClick={onLogout}
                  className="ml-2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-100 flex items-center space-x-1 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            )}

            {!user && (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-sm transition-all"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Hamburger Menu Toggle Button for Mobile Devices */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle main navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-5 duration-200">
              {user ? (
                <>
                  {isPatient && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleMobileNavigate("home")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          currentPage === "home"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        Home
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("dashboard")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          currentPage === "dashboard"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("predict")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                          currentPage === "predict" || currentPage === "results"
                            ? "bg-emerald-50 text-emerald-700 font-bold"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        <Stethoscope className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Check Symptoms</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("history")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                          currentPage === "history"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        <History className="h-4.5 w-4.5 text-blue-600" />
                        <span>My History</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("profile")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                          currentPage === "profile"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        <UserIcon className="h-4.5 w-4.5 text-blue-600" />
                        <span>Profile</span>
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleMobileNavigate("admin")}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                          currentPage === "admin"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                        }`}
                      >
                        <Activity className="h-4.5 w-4.5 text-blue-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-3 mt-1 px-2">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-100 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-2">
                  <button
                    onClick={() => handleMobileNavigate("login")}
                    className="w-full py-3 text-center text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleMobileNavigate("register")}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-sm text-center transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8">
        {children}
      </main>

      {/* Clean Minimalism Theme Footer */}
      <footer className="px-6 sm:px-8 py-6 border-t border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="max-w-2xl text-center md:text-left">
          <p className="text-[11px] leading-relaxed text-slate-400 uppercase font-bold tracking-tight">
            <span className="text-amber-600 font-extrabold">Medical Disclaimer:</span> This application is for preliminary health assessment only. It does not replace professional medical diagnosis, advice, or treatment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center md:justify-end shrink-0">

          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/50 rounded-full text-[11px] font-bold text-emerald-600">
            System Accuracy: 96.4%
          </div>
        </div>
      </footer>
    </div>
  );
}
