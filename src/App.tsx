/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Layout from "./components/Layout.js";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import Predict from "./pages/Predict.js";
import PredictResults from "./pages/PredictResults.js";
import HistoryPage from "./pages/History.js";
import Profile from "./pages/Profile.js";
import Admin from "./pages/Admin.js";
import { User, PredictionDetail, HistoryItem } from "./types.js";
import { DISEASES } from "./ml/diseases.js";

export default function App() {
  // Session Persistence states
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [predictionDetail, setPredictionDetail] = useState<PredictionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");

  useEffect(() => {
    // Check local storage for session files
    const cachedUser = localStorage.getItem("med_user");
    const cachedToken = localStorage.getItem("med_token");
    if (cachedUser && cachedToken) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setAuthToken(cachedToken);
        // Default to appropriate dashboard
        setCurrentPage(parsed.isAdmin ? "admin" : "dashboard");
      } catch (e) {
        localStorage.removeItem("med_user");
        localStorage.removeItem("med_token");
      }
    }
  }, []);

  const handleLoginSuccess = (data: { user: any; isAdmin?: boolean }) => {
    const sessionUser: User = {
      id: data.user.id,
      fullName: data.user.fullName,
      email: data.user.email,
      isAdmin: data.isAdmin || false
    };

    setUser(sessionUser);
    setAuthToken(data.user.id); // Simple token mapping
    localStorage.setItem("med_user", JSON.stringify(sessionUser));
    localStorage.setItem("med_token", data.user.id);

    // If there were temporary symptoms typed on the landing page, consume and analyze them immediately!
    const tempSymptoms = sessionStorage.getItem("temp_symptoms");
    if (tempSymptoms && !sessionUser.isAdmin) {
      setCurrentPage("predict");
      handleAnalyzeSymptoms(tempSymptoms, undefined, undefined, data.user.id);
    } else {
      setCurrentPage(sessionUser.isAdmin ? "admin" : "dashboard");
    }
  };

  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken("");
    localStorage.removeItem("med_user");
    localStorage.removeItem("med_token");
    sessionStorage.removeItem("temp_symptoms");
    setPredictionDetail(null);
    setCurrentPage("home");
  };

  const handleAnalyzeSymptoms = async (symptomText: string, age?: number, gender?: string, customToken?: string) => {
    setLoading(true);
    setGlobalError("");
    
    // Support custom token passing for direct post-auth triggers
    const token = customToken || authToken;

    try {
      // Direct post to backend express service
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ symptomText, age, gender })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process symptoms.");
      }

      const detail: PredictionDetail = {
        predictionId: data.predictionId,
        detectedSymptoms: data.detectedSymptoms,
        predictions: data.predictions,
        primaryDisease: data.primaryDisease,
        aiExplanation: data.aiExplanation,
        hasSeriousSymptoms: data.hasSeriousSymptoms,
        date: data.date,
        age: data.age,
        gender: data.gender
      };

      setPredictionDetail(detail);
      setCurrentPage("results");
    } catch (err: any) {
      setGlobalError(err.message || "An unexpected prediction failure occurred.");
      setCurrentPage("predict");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (predictionId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions/history", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const list: HistoryItem[] = data.history || [];
        const match = list.find((item) => item.predictionId === predictionId);
        
        if (match) {
          // Find standard primary disease recommendations
          // Search in DISEASES map or compile defaults
          const standardDiseaseKey = Object.keys(DISEASES).find(
            (key) => DISEASES[key].name.toLowerCase() === match.predictedDisease.toLowerCase()
          ) || "malaria";

          const diseaseInfo = DISEASES[standardDiseaseKey];

          // Reconstruct predictions structure from single value
          const predictionsArr = [
            { disease: standardDiseaseKey, name: match.predictedDisease, score: match.confidence },
            { disease: "other", name: "Other likelihood", score: Math.round((100 - match.confidence) * 0.4) },
            { disease: "unlikely", name: "Secondary match", score: Math.round((100 - match.confidence) * 0.2) }
          ];

          // Form simulated AI Explanation
          const formatting = match.detectedSymptoms.map(s => s.toLowerCase()).join(", ");
          const explanationStr = `The historical record logs the presence of ${formatting}. The Bernoulli Naive Bayes classifier computed a ${match.confidence}% likelihood score for ${match.predictedDisease} relative to occurrences in the Kaggle dataset.`;

          // Serious symptom check
          const seriousKeys = ["Chest Pain", "Breathlessness", "Fast Heart Rate", "Blood In Sputum", "Coma", "Altered Sensorium", "Slurred Speech", "Weakness Of One Body Side"];
          const hasSerious = match.detectedSymptoms.some(s => seriousKeys.includes(s));

          const detail: PredictionDetail = {
            predictionId: match.predictionId,
            detectedSymptoms: match.detectedSymptoms,
            predictions: predictionsArr,
            primaryDisease: {
              id: standardDiseaseKey,
              name: match.predictedDisease,
              description: diseaseInfo?.description || "Description logs for match.",
              recommendations: diseaseInfo?.recommendations || ["Drink water and rest.", "Monitor temperature.", "Seek medical consultation."]
            },
            aiExplanation: explanationStr,
            hasSeriousSymptoms: hasSerious,
            date: match.date
          };

          setPredictionDetail(detail);
          setCurrentPage("results");
        }
      }
    } catch (err) {
      console.error("Failed to load historical detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe navigation guard for Patient vs Admin roles
  const handleNavigate = (page: string) => {
    setGlobalError("");
    if (user && user.isAdmin) {
      setCurrentPage("admin");
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {globalError && (
        <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700 font-medium">{globalError}</p>
        </div>
      )}

      {/* Basic router logic */}
      {currentPage === "home" && (
        <Home 
          onAnalyzeSymptoms={(text) => handleAnalyzeSymptoms(text)} 
          isLoggedIn={!!user}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "login" && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "register" && (
        <Register 
          onNavigate={handleNavigate} 
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {user && !user.isAdmin && (
        <>
          {currentPage === "dashboard" && (
            <Dashboard 
              user={user} 
              onNavigate={handleNavigate} 
              authToken={authToken}
            />
          )}

          {currentPage === "predict" && (
            <Predict 
              onAnalyzeSymptoms={(text, age, gender) => handleAnalyzeSymptoms(text, age, gender)} 
              loading={loading}
            />
          )}

          {currentPage === "results" && (
            <PredictResults 
              detail={predictionDetail} 
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "history" && (
            <HistoryPage 
              authToken={authToken} 
              onNavigate={handleNavigate} 
              onViewDetails={handleViewDetails}
            />
          )}

          {currentPage === "profile" && (
            <Profile 
              user={user} 
              authToken={authToken}
            />
          )}
        </>
      )}

      {user && user.isAdmin && (
        <>
          {currentPage === "admin" && (
            <Admin authToken={authToken} />
          )}
        </>
      )}
    </Layout>
  );
}
