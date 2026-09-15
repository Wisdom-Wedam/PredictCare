/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Browser-safe disease catalogue.
 * This file contains NO Node.js imports so it can be bundled into the React
 * frontend (App.tsx) as well as used by the Express backend. The trained
 * classifier itself lives in naiveBayes.ts, which is SERVER-ONLY because it
 * reads the CSV dataset from disk with Node's fs module.
 */

export interface DiseaseInfo {
  id: string;
  name: string;
  description: string;
  symptoms: string[]; // canonical symptom keys characteristic of this disease
  recommendations: string[];
  /** Dataset label as it appears in Training.csv (undefined for synthetic diseases) */
  datasetLabel?: string;
  /** true = trained on real Kaggle rows, false = trained on synthesised rows */
  fromDataset: boolean;
}

export const DISEASES: Record<string, DiseaseInfo> = {
  // ----------------------- REAL (in Kaggle dataset) -----------------------
  malaria: {
    id: "malaria",
    name: "Malaria",
    datasetLabel: "Malaria",
    fromDataset: true,
    description:
      "An infectious disease caused by plasmodium parasites, transmitted through the bite of infected female Anopheles mosquitoes. It causes recurrent attacks of chills and fever.",
    symptoms: ["chills", "vomiting", "high_fever", "sweating", "headache", "nausea", "diarrhoea", "muscle_pain"],
    recommendations: [
      "Sleep under insecticide-treated bed nets.",
      "Seek immediate medical care for blood testing and anti-malarial therapy.",
      "Stay hydrated and rest adequately.",
      "Avoid standing water areas to prevent mosquito breeding."
    ]
  },
  typhoid: {
    id: "typhoid",
    name: "Typhoid Fever",
    datasetLabel: "Typhoid",
    fromDataset: true,
    description:
      "A systemic bacterial infection caused by Salmonella typhi, usually contracted by consuming contaminated food or water.",
    symptoms: ["chills", "vomiting", "fatigue", "high_fever", "headache", "nausea", "constipation", "abdominal_pain", "diarrhoea", "toxic_look_typhos", "belly_pain"],
    recommendations: [
      "Drink only boiled or bottled water.",
      "Seek medical consultation for stool culture and antibiotic treatment.",
      "Maintain high personal hygiene and wash hands thoroughly.",
      "Eat warm, thoroughly cooked food."
    ]
  },
  diabetes: {
    id: "diabetes",
    name: "Diabetes Mellitus",
    datasetLabel: "Diabetes",
    fromDataset: true,
    description:
      "A chronic metabolic disease characterized by elevated levels of blood glucose, which leads over time to serious damage to the heart, blood vessels, eyes, kidneys, and nerves.",
    symptoms: ["fatigue", "weight_loss", "restlessness", "lethargy", "irregular_sugar_level", "blurred_and_distorted_vision", "obesity", "excessive_hunger", "increased_appetite", "polyuria"],
    recommendations: [
      "Monitor blood glucose levels regularly.",
      "Adopt a balanced low-glycemic, fiber-rich diet.",
      "Engage in regular physical activity.",
      "Consult an endocrinologist for customized insulin or oral medication guidelines."
    ]
  },
  common_cold: {
    id: "common_cold",
    name: "Common Cold",
    datasetLabel: "Common Cold",
    fromDataset: true,
    description:
      "A viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way.",
    symptoms: ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "headache", "swelled_lymph_nodes", "malaise", "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion", "chest_pain", "loss_of_smell", "muscle_pain"],
    recommendations: [
      "Drink plenty of fluids (water, warm tea, broth).",
      "Get plenty of bed rest to help your immune system.",
      "Use warm saline gargles for sore throat relief.",
      "Monitor for high fever or worsening symptoms."
    ]
  },
  dengue: {
    id: "dengue",
    name: "Dengue Fever",
    datasetLabel: "Dengue",
    fromDataset: true,
    description:
      "A painful, debilitating mosquito-borne viral disease caused by dengue viruses. Known as 'breakbone fever' due to intense muscle and joint pain.",
    symptoms: ["skin_rash", "chills", "joint_pain", "vomiting", "fatigue", "high_fever", "headache", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "malaise", "muscle_pain", "red_spots_over_body"],
    recommendations: [
      "Stay strictly hydrated; fluid intake is critical for dengue monitoring.",
      "Consult a doctor immediately for complete blood count (platelet count) monitoring.",
      "Use mosquito repellents and wear protective clothing.",
      "Avoid NSAIDs like aspirin or ibuprofen as they can worsen bleeding risks; use acetaminophen if recommended."
    ]
  },
  asthma: {
    id: "asthma",
    name: "Bronchial Asthma",
    datasetLabel: "Bronchial Asthma",
    fromDataset: true,
    description:
      "A chronic condition in which your airways narrow and swell, causing extra mucus production. This makes breathing difficult and triggers coughing and wheezing.",
    symptoms: ["fatigue", "cough", "high_fever", "breathlessness", "family_history", "mucoid_sputum"],
    recommendations: [
      "Always keep your rescue inhaler handy.",
      "Avoid triggers like cold air, smoke, or intense dust.",
      "Follow your asthma action plan as created by your physician.",
      "If wheezing becomes severe or persistent, seek emergency medical care."
    ]
  },
  hypertension: {
    id: "hypertension",
    name: "Hypertension",
    datasetLabel: "Hypertension",
    fromDataset: true,
    description:
      "A chronic condition where the force of the blood against your artery walls is consistently too high, often called a silent killer because it can have no noticeable symptoms.",
    symptoms: ["headache", "chest_pain", "dizziness", "loss_of_balance", "lack_of_concentration"],
    recommendations: [
      "Measure blood pressure daily and maintain a log.",
      "Reduce sodium (salt) intake dramatically.",
      "Avoid smoking, caffeine, and heavy alcohol usage.",
      "Practice stress-relief techniques and take prescribed antihypertensive medication regularly."
    ]
  },
  migraine: {
    id: "migraine",
    name: "Migraine",
    datasetLabel: "Migraine",
    fromDataset: true,
    description:
      "A neurological condition that can cause multiple symptoms, most notably a throbbing headache on one side of your head, often accompanied by extreme sensitivity to light and sound.",
    symptoms: ["acidity", "indigestion", "headache", "blurred_and_distorted_vision", "excessive_hunger", "stiff_neck", "depression", "irritability", "visual_disturbances"],
    recommendations: [
      "Rest in a quiet, dark, cool room during attacks.",
      "Apply a cold compress or ice pack to your forehead or temples.",
      "Keep a headache journal to track and avoid triggers.",
      "Ensure regular sleep schedules and drink plenty of water."
    ]
  },
  uti: {
    id: "uti",
    name: "Urinary Tract Infection",
    datasetLabel: "Urinary tract infection",
    fromDataset: true,
    description:
      "An infection in any part of your urinary system, including your kidneys, ureters, bladder, and urethra, most commonly caused by bacteria.",
    symptoms: ["burning_micturition", "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urine"],
    recommendations: [
      "Drink a large volume of water daily to help flush out bacteria.",
      "Consult a medical provider for a urine test and proper antibiotic course.",
      "Avoid caffeine and spicy foods which can irritate the bladder.",
      "Maintain proper personal hygiene."
    ]
  },
  gerd: {
    id: "gerd",
    name: "GERD (Acid Reflux)",
    datasetLabel: "GERD",
    fromDataset: true,
    description:
      "A chronic digestive disease where stomach acid or bile flows back into your food pipe (esophagus), irritating its lining.",
    symptoms: ["stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "cough", "chest_pain"],
    recommendations: [
      "Eat smaller, more frequent meals rather than large feasts.",
      "Avoid lying down for at least 2-3 hours after eating.",
      "Elevate the head of your bed by 6-9 inches.",
      "Avoid trigger foods (fried/fatty items, chocolate, mint, tomato sauces)."
    ]
  },
  pneumonia: {
    id: "pneumonia",
    name: "Pneumonia",
    datasetLabel: "Pneumonia",
    fromDataset: true,
    description:
      "An infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing.",
    symptoms: ["chills", "fatigue", "cough", "high_fever", "breathlessness", "sweating", "malaise", "phlegm", "chest_pain", "fast_heart_rate", "rusty_sputum"],
    recommendations: [
      "Consult a doctor immediately for diagnostic imaging (chest X-ray) and targeted therapy.",
      "Get plenty of rest and stay hydrated.",
      "Do not take cough suppressants without consulting a doctor, as coughing helps clear lungs.",
      "Use a humidifier or inhale steam to loosen phlegm."
    ]
  },

  // ---------------- SYNTHETIC (not present in Kaggle dataset) ----------------
  // These four diseases are not in the training data. Their samples are
  // synthesised from the symptom profiles below. All symptom keys used here
  // exist in the canonical dataset vocabulary so the feature space stays unified.
  influenza: {
    id: "influenza",
    name: "Influenza (Flu)",
    fromDataset: false,
    description:
      "A highly contagious viral infection that attacks your respiratory system, causing severe body aches and high fever.",
    // Flu is distinguished from the common cold by high_fever + chills +
    // muscle_pain + sweating dominating over the cold's sneezing/runny_nose/
    // swelled_lymph_nodes/sinus_pressure profile.
    symptoms: ["high_fever", "chills", "headache", "muscle_pain", "fatigue", "sweating", "joint_pain"],
    recommendations: [
      "Isolate to prevent spreading the infection to others.",
      "Stay hydrated with warm fluids.",
      "Rest in bed until fever resolves for at least 24 hours.",
      "Seek medical advice for antiviral prescriptions if within 48 hours of onset."
    ]
  },
  covid_19: {
    id: "covid_19",
    name: "COVID-19",
    fromDataset: false,
    description:
      "A respiratory illness caused by the SARS-CoV-2 virus, which spreads primarily through respiratory droplets.",
    // loss_of_smell + throat_irritation + muscle_pain distinguish COVID from
    // asthma (which centres on breathlessness/mucoid_sputum/family_history).
    symptoms: ["high_fever", "cough", "fatigue", "loss_of_smell", "headache", "muscle_pain", "throat_irritation", "malaise"],
    recommendations: [
      "Isolate in a well-ventilated room.",
      "Monitor blood oxygen levels (SpO2) using a pulse oximeter.",
      "Seek emergency medical help if you experience chest pain or breathing difficulties.",
      "Wear a mask and practice hand hygiene."
    ]
  },
  allergy: {
    id: "allergy",
    name: "Allergic Rhinitis",
    fromDataset: false,
    description:
      "An allergic response causing itchy eyes, sneezing, runny nose, and sinus pressure, typically triggered by pollen, dust mites, or pet dander.",
    // Allergy is set apart from the common cold by prominent eye involvement
    // (watering_from_eyes + redness_of_eyes) and the ABSENCE of fever/chills/
    // swelled_lymph_nodes that characterise the cold.
    symptoms: ["continuous_sneezing", "watering_from_eyes", "redness_of_eyes", "itching", "skin_rash"],
    recommendations: [
      "Identify and avoid known allergens (dust, pollen, mold).",
      "Keep indoor spaces clean and vacuumed.",
      "Wash bedding frequently in hot water.",
      "Consult an allergist for targeted antihistamine or immunotherapy options."
    ]
  },
  food_poisoning: {
    id: "food_poisoning",
    name: "Food Poisoning",
    fromDataset: false,
    description:
      "An illness caused by consuming contaminated, spoiled, or toxic food, leading to gastrointestinal irritation.",
    symptoms: ["vomiting", "nausea", "abdominal_pain", "diarrhoea", "stomach_pain", "belly_pain", "dehydration", "fatigue"],
    recommendations: [
      "Sip oral rehydration salts (ORS) slowly to maintain electrolyte balance.",
      "Avoid solid foods for a few hours until vomiting stops.",
      "Gradually reintroduce bland foods (toast, rice, bananas).",
      "Consult a physician if you see blood in stool or have high fever."
    ]
  }
};


/** Human-readable label for a canonical symptom key (high_fever -> "High Fever"). */
export function labelForSymptom(key: string): string {
  return key
    .split("_")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
