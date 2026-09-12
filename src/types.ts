/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin?: boolean;
}

export interface PredictionResult {
  disease: string;
  name: string;
  score: number;
}

export interface PrimaryDisease {
  id: string;
  name: string;
  description: string;
  recommendations: string[];
}

export interface PredictionDetail {
  predictionId: string;
  detectedSymptoms: string[];
  predictions: PredictionResult[];
  primaryDisease: PrimaryDisease;
  aiExplanation: string;
  hasSeriousSymptoms: boolean;
  date: string;
  age?: number;
  gender?: string;
}

export interface HistoryItem {
  predictionId: string;
  originalInput: string;
  detectedSymptoms: string[];
  predictedDisease: string;
  confidence: number;
  date: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  commonDiseases: { disease: string; count: number }[];
  recentPredictions: {
    id: string;
    userName: string;
    disease: string;
    confidence: number;
    date: string;
  }[];
  databaseStatus?: {
    connected: boolean;
    mode: string;
    databaseName: string;
    hasUri: boolean;
    records: {
      users: number;
      predictions: number;
      diseases: number;
      recommendations: number;
    };
  };
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: Record<string, Record<string, number>>;
    diseases: string[];
  } | null;
}
