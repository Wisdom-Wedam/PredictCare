# PredictCare — Machine Learning Model Guide

This document explains the machine-learning pipeline that powers disease
prediction in PredictCare, how it was built, and how to retrain it with a new
dataset. It is written to support a final-year BSc Information Technology
project defence.

---

## 1. Overview

PredictCare predicts a likely disease from a patient's free-text symptom
description. Two technologies cooperate, with a **clear separation of
responsibilities**:

| Stage | Technology | Responsibility |
|-------|-----------|----------------|
| Symptom extraction (NLP) | Google Gemini (optional) + keyword fallback | Turn everyday English into standard symptom keys |
| **Disease prediction** | **Bernoulli Naive Bayes (this project)** | Predict the disease from the extracted symptoms |

Gemini **never** predicts the disease. Prediction comes **exclusively** from the
trained Naive Bayes model in `src/ml/naiveBayes.ts`. If no Gemini key is
configured, a built-in keyword matcher performs extraction, so the app is fully
functional offline.

---

## 2. Dataset

**Source:** Kaggle — *Disease Prediction Using Machine Learning* (kaushil268).
Files used: `Training.csv` (4,920 rows) and `Testing.csv` (42 rows), stored in
`src/ml/data/`.

**Shape:** 132 binary symptom columns + one `prognosis` (disease) label column.
41 diseases in total, 120 rows each (perfectly balanced).

### 2.1 Data inspection findings
* **Trailing empty column** — every row ends with a stray comma; dropped.
* **Duplicated `fluid_overload` column** — appears twice; one copy is all-zeros.
  We keep the populated column and discard the empty one → **131 real symptoms**.
* **4 malformed symptom names** with stray spaces (`spotting_ urination`,
  `foul_smell_of urine`, `toxic_look_(typhos)`, `dischromic _patches`) — normalised.
* **4 messy disease labels** with double spaces / inconsistent casing
  (`Paralysis (brain hemorrhage)`, `Dimorphic hemmorhoids(piles)`,
  `(vertigo) Paroymsal  Positional Vertigo`, `hepatitis A`) — standardised.
* **No missing values, no non-binary cells, no conflicting labels.**
* **Duplicates:** the 4,920 rows collapse to ~304 unique symptom patterns
  (the dataset repeats each pattern ~114 times). This is handled during training
  (see §4.2).

---

## 3. Scope: 15 diseases

The application supports 15 diseases. **11 exist in the Kaggle dataset** and are
trained on **real data**:

Malaria · Typhoid Fever · Diabetes Mellitus · Common Cold · Dengue Fever ·
Bronchial Asthma · Hypertension · Migraine · Urinary Tract Infection ·
GERD · Pneumonia

**4 are NOT in the dataset** and are trained on **synthetic samples** generated
from documented symptom profiles (clearly flagged `fromDataset: false` in code):

Influenza (Flu) · COVID-19 · Allergic Rhinitis · Food Poisoning

> **For your defence:** be transparent about this split. The headline
> accuracy/precision/recall/F1 are computed **only on the real held-out
> `Testing.csv`** — synthetic diseases are excluded from the reported metric so
> the figure is honest.

---

## 4. The model — Bernoulli Naive Bayes

### 4.1 Why Bernoulli Naive Bayes
Every feature is a binary present/absent symptom, which is exactly what the
**Bernoulli** event model assumes. Naive Bayes is fast, interpretable, needs
little data, and is a standard, defensible choice for symptom→disease
classification.

### 4.2 Training pipeline (`train()` in `src/ml/naiveBayes.ts`)
1. **Load** `Training.csv` and `Testing.csv`.
2. **Clean** — build the 131-symptom canonical vocabulary (drop empty/duplicate
   columns, normalise names); standardise disease labels.
3. **Feature engineering** — represent each patient as a multi-hot binary vector
   over the 131 symptoms.
4. **De-duplicate** real rows per disease so the 11 dataset diseases and the 4
   synthetic diseases are represented by comparable numbers of *distinct*
   patterns. (Without this, the heavily-repeated real rows produce
   near-deterministic probabilities that crowd out the synthetic classes.)
5. **Fit** priors and Bernoulli conditionals with **Laplace (add-one)
   smoothing** (α = 1), computed in log-space for numerical stability:

   ```
   P(symptom=1 | disease) = (count(symptom=1, disease) + α) / (count(disease) + 2α)
   ```
6. **Evaluate** on the separate `Testing.csv` (real diseases only).

### 4.3 Inference (`predict()`)
For a set of active symptoms, the model computes a log-posterior for every
disease, then converts the scores to percentages with a numerically-stable
**softmax**, returning all diseases sorted by confidence. The top result is the
primary prediction; the runners-up populate the "Assessment Likelihoods" bars.

### 4.4 Results (held-out `Testing.csv`)
Accuracy **100%**, Precision **100%**, Recall **100%**, F1 **100%** (macro-averaged
over the 11 real diseases). A self-consistency check over all 15 diseases
(feeding each disease's characteristic profile) also returns the correct disease
15/15.

> These figures are high because the dataset's diseases have clean, largely
> non-overlapping symptom signatures — a known property of this Kaggle dataset,
> worth stating plainly rather than overselling.

---

## 5. Files that make up the ML system

| File | Role |
|------|------|
| `src/ml/naiveBayes.ts` | The classifier: data loading, cleaning, training, evaluation, `predict()`, `getMetrics()`, `DISEASES`, `SYMPTOMS_LIST` |
| `src/ml/data/Training.csv` | Kaggle training data (loaded at startup) |
| `src/ml/data/Testing.csv` | Kaggle held-out test data |
| `server.ts` | Calls `classifier.predict()`, does Gemini/keyword symptom extraction, serves `/api/predict` and `/api/admin/stats` |
| `src/pages/Admin.tsx` | Displays the model metrics (ML Performance Reports tab) |

---

## 6. Setup & run

**Prerequisites:** Node.js 18+.

```bash
npm install
# optional — enables Gemini NLP extraction (prediction works without it):
#   create a file named .env in the project root containing:
#   GEMINI_API_KEY=your_AIza_key_here
npm run dev
```

Open http://localhost:3000. The model trains automatically at server startup
(there is no separate training command — training is in-process and takes
milliseconds).

**Admin dashboard:** log in with `admin@hospital.com` / `admin123` and open the
*ML Performance Reports* tab to see live accuracy, precision, recall, F1, and the
model configuration.

---

## 7. Retraining with a new / larger dataset

The pipeline is data-driven — no code changes are needed to retrain on more rows
of the **same format** (132 symptom columns + `prognosis`):

1. Replace `src/ml/data/Training.csv` (and optionally `Testing.csv`) with your
   new file(s), keeping the same column format.
2. Restart the server (`npm run dev`). The model retrains at startup.

To **add a disease that exists in the dataset** to the app's supported set:
1. Add an entry to the `DISEASES` map in `src/ml/naiveBayes.ts` with
   `fromDataset: true` and `datasetLabel` set to the exact `prognosis` label.
2. Provide `description`, `recommendations`, and characteristic `symptoms`.
3. Restart. It will now be trained on the real rows for that disease.

To **add a disease NOT in the dataset**, add a `DISEASES` entry with
`fromDataset: false` and a `symptoms` profile (using canonical symptom keys);
synthetic samples are generated automatically.

---

## 8. Honest limitations (good to acknowledge in a defence)
* The dataset's symptom patterns are clean and mostly separable, so metrics are
  optimistic relative to messy real-world input.
* 4 diseases rely on synthetic profiles, not real epidemiological data.
* Naive Bayes assumes symptoms are conditionally independent given the disease,
  which is not strictly true medically — but works well here and keeps the model
  interpretable.
* This is a decision-support prototype, **not** a diagnostic device (see the
  medical disclaimer in the app footer).
