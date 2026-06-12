/* =====================================
   🧠 OWL-LINGO ADAPTIVE BRAIN LAYER
   STEP 25 — DECISION INTELLIGENCE CORE
===================================== */

const AdaptiveBrain = {

  /* =========================
     🧭 MAIN DECISION ENGINE
     (what happens after each answer)
  ========================= */
  decide(context = {}){

    const {
      word,
      correct,
      streak = 0,
      level = 0,
      xp = 0
    } = context;

    const result = {
      xpMultiplier: 1,
      showStreakBoost: false,
      triggerReviewBoost: false,
      mood: "neutral",
      intensity: 1
    };

    // =========================
    // ❌ WRONG ANSWER LOGIC
    // =========================
    if(correct === false){

      result.xpMultiplier = 0.5;
      result.mood = "wrong";
      result.intensity = 2;

      // weak word boost
      if(window.AdaptiveEngine && word){
        const weight = AdaptiveEngine.weight(word);

        if(weight >= 3){
          result.triggerReviewBoost = true;
        }
      }

      return result;
    }

    // =========================
    // ✅ CORRECT ANSWER LOGIC
    // =========================
    result.mood = "correct";

    // streak amplification
    if(streak >= 5){
      result.xpMultiplier = 1.5;
      result.showStreakBoost = true;
    }

    if(streak >= 10){
      result.xpMultiplier = 2;
      result.triggerReviewBoost = true;
    }

    // level scaling
    if(level >= 3){
      result.xpMultiplier += 0.5;
    }

    // XP saturation control
    if(xp > 300){
      result.xpMultiplier *= 0.9;
    }

    return result;
  },

  /* =========================
     ⚡ XP CALCULATOR
  ========================= */
  calculateXP(baseXP, context = {}){

    const decision = this.decide(context);

    const xp = Math.max(
      1,
      Math.round(baseXP * (decision.xpMultiplier || 1))
    );

    return xp;
  },

  /* =========================
     🔥 UI FEEDBACK SIGNALS
  ========================= */
  getUIEffects(context = {}){

    const decision = this.decide(context);

    return {
      mood: decision.mood,
      shake: decision.mood === "wrong",
      flash: decision.mood === "correct" ? "correct" : "wrong",
      streakFire: decision.showStreakBoost,
      intensity: decision.intensity
    };
  },

  /* =========================
     📚 ADAPTIVE REVIEW TRIGGER
  ========================= */
  shouldBoostReview(context = {}){

    const decision = this.decide(context);

    return !!decision.triggerReviewBoost;
  }
};
