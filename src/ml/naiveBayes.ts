/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ============================================================================
 *  PredictCare - Bernoulli Naive Bayes Disease Classifier
 * ============================================================================
 *  This module trains a Bernoulli Naive Bayes model on the Kaggle
 *  "Disease Prediction Using Machine Learning" dataset (kaushil268):
 *  Training.csv / Testing.csv located in ./data.
 *
 *  Pipeline (all performed at server startup, in memory):
 *    1. Load Training.csv + Testing.csv from disk.
 *    2. Clean the data (normalise symptom names, fix duplicate/empty columns,
 *       standardise disease labels).
 *    3. Feature-engineer a binary (multi-hot) symptom matrix.
 *    4. Train Bernoulli NB with Laplace (add-one) smoothing.
 *    5. Evaluate on the held-out Testing.csv (accuracy / precision / recall /
 *       F1 / confusion matrix, macro-averaged).
 *
 *  Of the 15 diseases the application supports, 11 are present in the Kaggle
 *  dataset and are trained on REAL data. The remaining 4 (Influenza, COVID-19,
 *  Allergic Rhinitis, Food Poisoning) are NOT in the dataset; for those we
 *  synthesise labelled samples from their known symptom profiles so the app
 *  can still classify them. Synthetic diseases are clearly flagged
 *  (fromDataset: false) and are excluded from the headline accuracy metric,
 *  which is computed only on real held-out data.
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DISEASES, DiseaseInfo, labelForSymptom } from "./diseases.js";

// Re-export so existing server-side imports keep working unchanged.
export { DISEASES, labelForSymptom };
export type { DiseaseInfo };

// ---------------------------------------------------------------------------
// Types (unchanged public shape so the rest of the app stays compatible)
// ---------------------------------------------------------------------------
export interface TrainingSample {
  disease: string; // disease KEY
  symptoms: Record<string, number>; // symptomKey -> 0 | 1
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: Record<string, Record<string, number>>; // Row: True, Column: Predicted
  diseases: string[]; // disease NAMES included in the evaluation
  /** extra diagnostics surfaced for the report / admin panel */
  evaluatedOn: number; // number of held-out test rows used
  trainedSamples: number; // total training rows (real + synthetic)
  realDiseaseCount: number;
  syntheticDiseaseCount: number;
  smoothing: number; // Laplace alpha
}

// ---------------------------------------------------------------------------
// Disease catalogue (descriptions + recommendations preserved from the
// original app). datasetLabel links a disease KEY to its Training.csv label.
// symptoms are the canonical characteristic symptoms (used for the keyword
// fallback / synthetic generation); for real diseases these were derived from
// the dataset (present in >= 50% of that disease's rows).
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Data cleaning helpers
// ---------------------------------------------------------------------------

/** Normalise a raw CSV symptom header into a canonical snake_case key. */
export function normaliseSymptomKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Collapse repeated whitespace in a disease label (standardise labels). */
function normaliseLabel(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Resolve the directory of this module (ESM-safe). */
function moduleDir(): string {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return path.join(process.cwd(), "src", "ml");
  }
}

interface LoadedCsv {
  header: string[];
  rows: string[][];
}

/** Minimal, dependency-free CSV parser (dataset has no quoted commas). */
function parseCsv(content: string): LoadedCsv {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((l) => l.split(","));
  return { header, rows };
}

/**
 * Build the canonical symptom vocabulary from the training header:
 *  - drop trailing empty column
 *  - drop the 'prognosis' label column
 *  - de-duplicate columns that normalise to the same key (e.g. the dataset's
 *    duplicated fluid_overload), keeping the column that actually carries data
 */
function buildVocabulary(csv: LoadedCsv): { keys: string[]; colOfKey: Record<string, number> } {
  const { header, rows } = csv;
  const prognosisIdx = header.findIndex((h) => h.trim().toLowerCase() === "prognosis");

  const keyToCols: Record<string, number[]> = {};
  header.forEach((h, i) => {
    if (i === prognosisIdx) return;
    if (!h.trim()) return; // trailing empty column
    const k = normaliseSymptomKey(h);
    if (!k) return;
    (keyToCols[k] ||= []).push(i);
  });

  const colOfKey: Record<string, number> = {};
  for (const [key, cols] of Object.entries(keyToCols)) {
    if (cols.length === 1) {
      colOfKey[key] = cols[0];
    } else {
      let best = cols[0];
      let bestCount = -1;
      for (const c of cols) {
        let count = 0;
        for (const r of rows) if ((r[c] ?? "").trim() === "1") count++;
        if (count > bestCount) {
          bestCount = count;
          best = c;
        }
      }
      colOfKey[key] = best;
    }
  }

  const keys = Object.keys(colOfKey).sort();
  return { keys, colOfKey };
}

// ---------------------------------------------------------------------------
// The classifier
// ---------------------------------------------------------------------------
export class BernoulliNaiveBayes {
  private priors: Record<string, number> = {}; // ln P(disease)
  private condPresent: Record<string, Record<string, number>> = {}; // ln P(symptom=1 | disease)
  private condAbsent: Record<string, Record<string, number>> = {}; // ln P(symptom=0 | disease)
  private trained = false;
  private metrics: ModelMetrics | null = null;
  private readonly alpha = 1; // Laplace (add-one) smoothing

  public vocabulary: string[] = [];
  private labelToKey: Record<string, string> = {}; // dataset label -> disease KEY

  constructor() {
    this.train();
  }

  private loadCsv(fileName: string): LoadedCsv | null {
    const p = path.join(moduleDir(), "data", fileName);
    if (!fs.existsSync(p)) return null;
    return parseCsv(fs.readFileSync(p, "utf-8"));
  }

  private csvToSamples(csv: LoadedCsv, colOfKey: Record<string, number>): TrainingSample[] {
    const { header, rows } = csv;
    const prognosisIdx = header.findIndex((h) => h.trim().toLowerCase() === "prognosis");
    const samples: TrainingSample[] = [];

    for (const r of rows) {
      const label = normaliseLabel(r[prognosisIdx] ?? "");
      const diseaseKey = this.labelToKey[label];
      if (!diseaseKey) continue;

      const symptoms: Record<string, number> = {};
      for (const key of this.vocabulary) {
        const col = colOfKey[key];
        symptoms[key] = (r[col] ?? "").trim() === "1" ? 1 : 0;
      }
      samples.push({ disease: diseaseKey, symptoms });
    }
    return samples;
  }

  private synthesiseSamples(diseaseKey: string, count: number): TrainingSample[] {
    const info = DISEASES[diseaseKey];
    const out: TrainingSample[] = [];
    for (let i = 0; i < count; i++) {
      const symptoms: Record<string, number> = {};
      for (const key of this.vocabulary) symptoms[key] = 0;
      for (const s of info.symptoms) {
        if (this.vocabulary.includes(s) && Math.random() < 0.85) symptoms[s] = 1;
      }
      for (const key of this.vocabulary) {
        if (!info.symptoms.includes(key) && Math.random() < 0.02) symptoms[key] = 1;
      }
      out.push({ disease: diseaseKey, symptoms });
    }
    return out;
  }

  public train() {
    const training = this.loadCsv("Training.csv");
    const testing = this.loadCsv("Testing.csv");

    if (!training) {
      console.error("[ML] Training.csv not found in src/ml/data - model NOT trained.");
      this.trained = false;
      return;
    }

    // 1. CLEANING + FEATURE SPACE
    const { keys, colOfKey } = buildVocabulary(training);
    this.vocabulary = keys;

    this.labelToKey = {};
    for (const [key, info] of Object.entries(DISEASES)) {
      if (info.fromDataset && info.datasetLabel) {
        this.labelToKey[normaliseLabel(info.datasetLabel)] = key;
      }
    }

    // 2. BUILD TRAINING SET (real dataset rows + synthetic rows)
    // The Kaggle file repeats each unique symptom pattern many times (~114x).
    // Left as-is, the 11 real diseases get near-deterministic conditionals
    // (probabilities pinned at ~0/1) while the 4 synthesised diseases have
    // softer distributions, which biases inference toward the synthetic ones.
    // We de-duplicate identical (pattern,label) rows so every disease is
    // represented by its distinct clinical patterns on an equal footing.
    const allReal = this.csvToSamples(training, colOfKey);
    const seenPattern = new Set<string>();
    const realSamples: TrainingSample[] = [];
    for (const s of allReal) {
      const sig = s.disease + "|" + this.vocabulary.map((k) => s.symptoms[k]).join("");
      if (seenPattern.has(sig)) continue;
      seenPattern.add(sig);
      realSamples.push(s);
    }
    const perSynthetic = 8; // comparable to unique real patterns per disease
    let syntheticSamples: TrainingSample[] = [];
    for (const [key, info] of Object.entries(DISEASES)) {
      if (!info.fromDataset) {
        syntheticSamples = syntheticSamples.concat(this.synthesiseSamples(key, perSynthetic));
      }
    }
    const trainSet = [...realSamples, ...syntheticSamples];

    // 3. FIT
    this.fit(trainSet);
    this.trained = true;

    // 4. EVALUATE on held-out Testing.csv (real diseases only)
    let testSamples: TrainingSample[] = [];
    if (testing) {
      const { colOfKey: testCols } = buildVocabulary(testing);
      testSamples = this.csvToSamplesWithVocab(testing, testCols);
    }
    this.metrics = this.evaluate(testSamples, trainSet.length);
  }

  private csvToSamplesWithVocab(csv: LoadedCsv, colOfKey: Record<string, number>): TrainingSample[] {
    const { header, rows } = csv;
    const prognosisIdx = header.findIndex((h) => h.trim().toLowerCase() === "prognosis");
    const samples: TrainingSample[] = [];
    for (const r of rows) {
      const label = normaliseLabel(r[prognosisIdx] ?? "");
      const diseaseKey = this.labelToKey[label];
      if (!diseaseKey) continue;
      const symptoms: Record<string, number> = {};
      for (const key of this.vocabulary) {
        const col = colOfKey[key];
        symptoms[key] = col !== undefined && (r[col] ?? "").trim() === "1" ? 1 : 0;
      }
      samples.push({ disease: diseaseKey, symptoms });
    }
    return samples;
  }

  private fit(samples: TrainingSample[]) {
    this.priors = {};
    this.condPresent = {};
    this.condAbsent = {};

    const diseaseKeys = Object.keys(DISEASES);
    const diseaseCounts: Record<string, number> = {};
    const presentCounts: Record<string, Record<string, number>> = {};

    for (const d of diseaseKeys) {
      diseaseCounts[d] = 0;
      presentCounts[d] = {};
      for (const s of this.vocabulary) presentCounts[d][s] = 0;
    }

    for (const sample of samples) {
      diseaseCounts[sample.disease]++;
      for (const s of this.vocabulary) {
        if (sample.symptoms[s] === 1) presentCounts[sample.disease][s]++;
      }
    }

    const total = samples.length;
    for (const d of diseaseKeys) {
      const n = diseaseCounts[d];
      this.priors[d] = Math.log((n + this.alpha) / (total + this.alpha * diseaseKeys.length));

      this.condPresent[d] = {};
      this.condAbsent[d] = {};
      for (const s of this.vocabulary) {
        const pPresent = (presentCounts[d][s] + this.alpha) / (n + 2 * this.alpha);
        this.condPresent[d][s] = Math.log(pPresent);
        this.condAbsent[d][s] = Math.log(1 - pPresent);
      }
    }
  }

  private scoreDisease(diseaseKey: string, activeSet: Set<string>): number {
    let logProb = this.priors[diseaseKey] ?? -Infinity;
    for (const s of this.vocabulary) {
      logProb += activeSet.has(s) ? this.condPresent[diseaseKey][s] : this.condAbsent[diseaseKey][s];
    }
    return logProb;
  }

  private evaluate(testSamples: TrainingSample[], trainedSamples: number): ModelMetrics {
    const realKeys = Object.keys(DISEASES).filter((k) => DISEASES[k].fromDataset);
    const evalKeys = realKeys;
    const nameOf = (k: string) => DISEASES[k].name;

    const confusionMatrix: Record<string, Record<string, number>> = {};
    for (const t of evalKeys) {
      confusionMatrix[nameOf(t)] = {};
      for (const p of evalKeys) confusionMatrix[nameOf(t)][nameOf(p)] = 0;
    }

    let correct = 0;
    const tp: Record<string, number> = {};
    const fp: Record<string, number> = {};
    const fn: Record<string, number> = {};
    for (const d of evalKeys) {
      tp[d] = 0;
      fp[d] = 0;
      fn[d] = 0;
    }

    for (const sample of testSamples) {
      const active = new Set(this.vocabulary.filter((s) => sample.symptoms[s] === 1));
      let bestKey = "";
      let bestScore = -Infinity;
      for (const d of Object.keys(DISEASES)) {
        const sc = this.scoreDisease(d, active);
        if (sc > bestScore) {
          bestScore = sc;
          bestKey = d;
        }
      }
      const trueKey = sample.disease;
      if (bestKey === trueKey) correct++;
      if (confusionMatrix[nameOf(trueKey)] && confusionMatrix[nameOf(trueKey)][nameOf(bestKey)] !== undefined) {
        confusionMatrix[nameOf(trueKey)][nameOf(bestKey)]++;
      }
      if (bestKey === trueKey) tp[trueKey]++;
      else {
        fn[trueKey]++;
        if (fp[bestKey] !== undefined) fp[bestKey]++;
      }
    }

    const total = testSamples.length || 1;
    const accuracy = correct / total;

    let sumPrecision = 0;
    let sumRecall = 0;
    for (const d of evalKeys) {
      const precisionDenom = tp[d] + fp[d];
      const recallDenom = tp[d] + fn[d];
      if (precisionDenom > 0) sumPrecision += tp[d] / precisionDenom;
      if (recallDenom > 0) sumRecall += tp[d] / recallDenom;
    }
    const avgPrecision = sumPrecision / evalKeys.length;
    const avgRecall = sumRecall / evalKeys.length;
    const f1Score =
      avgPrecision + avgRecall > 0 ? (2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall) : 0;

    return {
      accuracy,
      precision: avgPrecision,
      recall: avgRecall,
      f1Score,
      confusionMatrix,
      diseases: evalKeys.map(nameOf),
      evaluatedOn: testSamples.length,
      trainedSamples,
      realDiseaseCount: realKeys.length,
      syntheticDiseaseCount: Object.keys(DISEASES).length - realKeys.length,
      smoothing: this.alpha
    };
  }

  /**
   * Predict the most likely diseases for a set of active symptom keys.
   * Returns a softmax-normalised confidence (%) over all diseases, sorted desc.
   */
  public predict(
    activeSymptoms: string[],
    _age?: number,
    _gender?: string
  ): { disease: string; name: string; score: number }[] {
    if (!this.trained) {
      return [{ disease: "unknown", name: "Model not trained", score: 0 }];
    }

    const active = new Set(activeSymptoms.filter((s) => this.vocabulary.includes(s)));

    const diseaseKeys = Object.keys(DISEASES);
    const logScores = diseaseKeys.map((d) => ({ d, log: this.scoreDisease(d, active) }));

    const maxLog = Math.max(...logScores.map((x) => x.log));
    const exps = logScores.map((x) => ({ d: x.d, e: Math.exp(x.log - maxLog) }));
    const sumExp = exps.reduce((acc, x) => acc + x.e, 0) || 1;

    return exps
      .map((x) => ({
        disease: x.d,
        name: DISEASES[x.d].name,
        score: Math.round((x.e / sumExp) * 1000) / 10
      }))
      .sort((a, b) => b.score - a.score);
  }

  public getMetrics(): ModelMetrics | null {
    return this.metrics;
  }

  public isTrained(): boolean {
    return this.trained;
  }
}

// ---------------------------------------------------------------------------
// Singleton + SYMPTOMS_LIST consumed by the rest of the app
// ---------------------------------------------------------------------------
export const classifier = new BernoulliNaiveBayes();

/**
 * SYMPTOMS_LIST: canonical symptom key -> human label, for the full dataset
 * vocabulary. Consumed by the Express server for Gemini prompting, keyword
 * fallback, and mapping prediction output back to readable symptom names.
 */
export const SYMPTOMS_LIST: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const key of classifier.vocabulary) map[key] = labelForSymptom(key);
  for (const info of Object.values(DISEASES)) {
    for (const s of info.symptoms) if (!map[s]) map[s] = labelForSymptom(s);
  }
  return map;
})();

export const SYMPTOM_KEYS = Object.keys(SYMPTOMS_LIST);
