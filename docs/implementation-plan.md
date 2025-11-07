# Implementation Plan: "Symbi" (The Biometric Tamagotchi)

This document outlines a practical, phased approach to building the "Symbi" app, starting from a Minimum Viable Product (MVP) and scaling up to the full concept.

## 1. Core Feature Map

First, let's break the app's DNA into three core components:
1. **The "Symbi" (The Pet):** The digital creature itself. This is the core UI. Its state (visuals, animation, behavior) is the *output*.
2. **The Data Connection (The Senses):** The link to the user's real-world data. This is the *input*. (e.g., HealthKit, Google Fit).
3. **The "Brain" (The Logic):** The system that decides *how* the input (data) affects the output (pet). This can range from simple rules to a complex AI.

## 2. Proposed Tech Stack

- **App Framework:** **React Native** or **Flutter**. This is crucial for cross-platform development (iOS and Android) and, most importantly, provides access to native modules for both Apple HealthKit and Google Fit from a single codebase.
- **Health Data APIs:**
  - **iOS:** Apple's **HealthKit**.
  - **Android:** Google's **Google Fit API**.
- **Pet Visuals (Option 1 - Simple):** **Lottie (by Airbnb)**. Use pre-made, animatable vector graphics. This is the fastest way to an MVP. You can have `happy.json`, `sad.json`, `tired.json` animations and just play the right one.
- **Pet Visuals (Option 2 - Advanced):** **Three.js** (for a 3D creature) or a **Generative AI** (like `imagen-3.0-generate-002` or `gemini-2.5-flash-image-preview` to create unique "evolved" looks based on long-term habits).
- **The "Brain" (LLM):** **Gemini API (**`gemini-2.5-flash-preview-09-2025`**)**. This would be used to translate raw health data into an "emotional state" for the Symbi.

## 3. Phased Development Plan

Don't try to build the full AI version first. The key is to test the core "nurture loop" as simply as possible.

### Phase 1: The MVP (The "Hard-coded" Pet)

**Goal:** Prove the core loop: Does seeing your data reflected in a simple pet motivate you?
- **The "Symbi":** A simple 2D animated character (using Lottie). It has 3-4 distinct states: `Active`, `Resting`, `Sad`.
- **The Data Connection:** Connect to *only one* data source: **Daily Step Count**.
- **The "Brain":** Simple, hard-coded `if/else` logic:
  - `if (steps < 2000)` -> play `Sad` animation.
  - `if (steps > 2000 && steps < 8000)` -> play `Resting` animation.
  - `if (steps > 8000)` -> play `Active` animation.
- **Why this works:** It's achievable in a short time and immediately tests the core premise.

### Phase 2: The "Smart" Pet (Adding Data & AI)

**Goal:** Make the pet feel more responsive and holistic by linking it to multiple data points.
- **The "Symbi":** Upgrade visuals. Maybe a simple 3D model with **Three.js** that can look around.
- **The Data Connection:** Add **Sleep Data** and **Heart Rate Variability (HRV)** or "Mindful Minutes."
- **The "Brain":** This is the key upgrade. Instead of `if/else`, you'll use an LLM.
  1. **Data Batching:** Once a day (e.g., in the morning), fetch the user's data from the previous day (e.g., `Steps: 4,500`, `Sleep: 5.5 hours`, `HRV: 35ms`).
  2. **AI Prompt:** Send this data to the Gemini API with a system prompt:

     > "You are the 'brain' for a digital pet. Your job is to describe the user's overall state in one or two words based on their health data. Choose from: [Vibrant, Calm, Tired, Stressed, Anxious, Rested, Active].
     >
     > **Data:**     >
     > - Sleep: 5.5 hours (goal: 8)     >
     > - Steps: 4,500 (goal: 8,000)     >
     > - HRV: 35ms (low)
     >
     > **Your (one-word) response is:**"
  3. **The AI's Response:** The model will likely respond with `Tired` or `Stressed`.
  4. **Connecting to UI:** Your app takes this `Tired` string and sets the Symbi's state. The Symbi now looks visibly tired.

### Phase 3: The "Living" Pet (Interaction & Evolution)

**Goal:** Make the Symbi truly interactive and unique to the user.
- **The "Symbi":** Introduce generative evolution. After 30 days of "active" states, use the `gemini-2.5-flash-image-preview` model to generate a new, "evolved" version of the pet. (e.g., Prompt: "a small, cute, happy digital creature, with new glowing blue wings").
- **The Data Connection:** No new data, but add *write* permissions.
- **The "Brain" & Interaction:** Add the interactive loop.
  1. The "Brain" (from Phase 2) determines the Symbi is `Stressed`.
  2. The Symbi's UI shows it's anxious. A button appears: "Calm your Symbi?"
  3. Tapping it launches a 1-minute guided breathing exercise.
  4. When complete, the app *writes* a "1 Minute Mindful Session" back to HealthKit.
  5. The Symbi's state immediately updates to `Calm`, providing a positive feedback loop.

## 4. Key Challenges to Solve

- **Health Data Permissions:** This is the most sensitive data a user has. The app's "onboarding" MUST be crystal clear, friendly, and explain *exactly* why it needs each data point (e.g., "We use your Sleep Data to know if your Symbi is rested!").
- **Battery Life:** Reading data constantly will kill the user's battery. You must rely on **background fetches** or **webhooks** from HealthKit/Google Fit, which notify your app *when* new data is available, rather than your app constantly asking.
- **The "Brain" Logic:** The most difficult (and most creative) part is mapping data to emotion. "Low sleep + high steps" = "Tired but Productive"? "High sleep + low steps" = "Rested but Lazy"? This "emotional mapping" is the secret sauce of the entire app.