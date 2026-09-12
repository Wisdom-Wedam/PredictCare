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
      {/* Left Side Decorative Background Imagery (Low Opacity) */}
      <div 
        aria-hidden="true"
        className="fixed left-0 top-0 bottom-0 w-36 sm:w-56 md:w-72 lg:w-88 xl:w-[26rem] pointer-events-none z-0 overflow-hidden select-none opacity-20 sm:opacity-25"
      >
        <div className="h-1/2 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="w-full h-full object-cover object-left filter contrast-110 saturate-75"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="h-1/2 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="w-full h-full object-cover object-left filter contrast-110 saturate-75"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Soft gradient masks ensuring images dissolve seamlessly into the page background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-slate-50/90" />
      </div>

      {/* Right Side Decorative Background Imagery (Low Opacity) */}
      <div 
        aria-hidden="true"
        className="fixed right-0 top-0 bottom-0 w-36 sm:w-56 md:w-72 lg:w-88 xl:w-[26rem] pointer-events-none z-0 overflow-hidden select-none opacity-20 sm:opacity-25"
      >
        <div className="h-1/2 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="w-full h-full object-cover object-right filter contrast-110 saturate-75"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="h-1/2 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="w-full h-full object-cover object-right filter contrast-110 saturate-75"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Soft gradient masks ensuring images dissolve seamlessly into the page background */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-50/50 to-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-slate-50/90" />
      </div>

      {/* Subtle color glow backdrops */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

      {/* Professional Healthcare Header - Enlarged & Spacious for Maximum Visibility */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex justify-between items-center h-20 sm:h-22">
            <div className="flex items-center">
              <div 
                className="flex items-center space-x-3.5 cursor-pointer select-none group"
                onClick={() => user ? (user.isAdmin ? onNavigate("admin") : onNavigate("home")) : onNavigate("home")}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center bg-white group-hover:scale-105 transition-transform">
                  <img
                    src={predictcareLogo}
                    alt="PredictCare Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                    Predict<span className="text-blue-600">Care</span>
                  </h1>
                  <span className="text-[11px] sm:text-xs text-emerald-600 font-extrabold uppercase tracking-wider block">
                    Disease Prediction & Health Assistant
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menus depending on state */}
            {user && (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                {isPatient && (
                  <>
                    <button
                      onClick={() => onNavigate("home")}
                      className={`px-4 py-2.5 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                        currentPage === "home"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      }`}
                    >
                      Home
                    </button>
                    <button
                      onClick={() => onNavigate("dashboard")}
                      className={`px-4 py-2.5 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                        currentPage === "dashboard"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate("predict")}
                      className={`px-4.5 py-2.5 rounded-2xl text-base font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
                        currentPage === "predict" || currentPage === "results"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      <Stethoscope className="h-5 w-5" />
                      <span>Check Symptoms</span>
                    </button>
                    <button
                      onClick={() => onNavigate("history")}
                      className={`px-4 py-2.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                        currentPage === "history"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      }`}
                    >
                      <History className="h-5 w-5" />
                      <span>My History</span>
                    </button>
                    <button
                      onClick={() => onNavigate("profile")}
                      className={`px-4 py-2.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                        currentPage === "profile"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      }`}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => onNavigate("admin")}
                      className={`px-4.5 py-2.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                        currentPage === "admin"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      }`}
                    >
                      <Activity className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </button>
                  </>
                )}

                {/* Shared Logout Button */}
                <button
                  onClick={onLogout}
                  className="ml-2 px-4 py-2.5 border-2 border-red-200 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            )}

            {!user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => onNavigate("login")}
                  className="px-5 py-2.5 text-base font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-extrabold shadow-md hover:shadow-lg shadow-blue-200 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Hamburger Menu Toggle Button for Mobile Devices */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-2xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle main navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-5 border-t border-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
              {user ? (
                <>
                  {isPatient && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleMobileNavigate("home")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-bold transition-all ${
                          currentPage === "home"
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        Home
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("dashboard")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-bold transition-all ${
                          currentPage === "dashboard"
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("predict")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-extrabold transition-all flex items-center space-x-2.5 ${
                          currentPage === "predict" || currentPage === "results"
                            ? "bg-emerald-600 text-white"
                            : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        <Stethoscope className="h-5 w-5" />
                        <span>Check Symptoms</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("history")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2.5 ${
                          currentPage === "history"
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        <History className="h-5 w-5" />
                        <span>My History</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavigate("profile")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2.5 ${
                          currentPage === "profile"
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span>Profile</span>
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleMobileNavigate("admin")}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-bold transition-all flex items-center space-x-2.5 ${
                          currentPage === "admin"
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        <Activity className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </button>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3.5 mt-2">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3.5 border-2 border-red-200 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleMobileNavigate("login")}
                    className="w-full py-3.5 text-center text-base font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleMobileNavigate("register")}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-extrabold shadow-md text-center transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Screen Content - Generous Max-Width & Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 relative z-10">
        {children}
      </main>

      {/* Clean Minimalism Theme Footer - Larger text & prominent badges */}
      <footer className="px-6 sm:px-10 py-8 border-t border-slate-200 bg-white/95 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-5 shrink-0 relative z-10">
        <div className="max-w-3xl text-center md:text-left">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
            <span className="text-amber-700 font-extrabold uppercase tracking-wide mr-1.5">Medical Disclaimer:</span> 
            PredictCare is an intelligent preliminary symptom assessment and classification tool. It is intended for educational and clinical triaging guidance only, and is not a substitute for formal medical evaluation, laboratory diagnosis, or prescription treatment by a qualified healthcare professional.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end shrink-0">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-extrabold text-emerald-700 flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            <span>Accuracy: 96.4%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
