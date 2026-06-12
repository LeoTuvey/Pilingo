/* =====================================
   🧠 OWL-LINGO ADAPTIVE BRAIN
   STEP 25 + STEP 26 — FULL INTELLIGENCE CORE (HARDENED)
===================================== */

const AdaptiveBrain = {

  /* =====================================
     🧭 DECISION ENGINE (STEP 25)
  ===================================== */
  decide(context = {}){

    const {
      word,
      correct,
      streak = 0,
      level = 0,
      xp = 0
    } = context || {};

    const result = {
      xpMultiplier: 1,
      showStreakBoost: false,
      triggerReviewBoost: false,
      mood: "neutral",
      intensity: 1
    };

    // =========================
    // WRONG ANSWER
    // =========================
    if(correct === false){

      result.xpMultiplier = 0.5;
      result.mood = "wrong";
      result.intensity = 2;

      if(window.AdaptiveEngine && word){
        const weight = window.AdaptiveEngine.weight(word);
        if(weight >= 3){
          result.triggerReviewBoost = true;
        }
      }

      return result;
    }

    // =========================
    // CORRECT ANSWER
    // =========================
    result.mood = "correct";

    if(streak >= 5){
      result.xpMultiplier = 1.5;
      result.showStreakBoost = true;
    }

    if(streak >= 10){
      result.xpMultiplier = 2;
      result.triggerReviewBoost = true;
    }

    if(level >= 3){
      result.xpMultiplier += 0.5;
    }

    if(xp > 300){
      result.xpMultiplier *= 0.9;
    }

    return result;
  },

  /* =====================================
     ⚡ XP CALCULATOR
  ===================================== */
  calculateXP(baseXP, context = {}){

    const decision = this.decide(context);

    const xp = Math.max(
      1,
      Math.round(Number(baseXP || 0) * (decision.xpMultiplier || 1))
    );

    return xp;
  },

  /* =====================================
     🔥 UI FEEDBACK
  ===================================== */
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

  /* =====================================
     📚 REVIEW TRIGGER
  ===================================== */
  shouldBoostReview(context = {}){

    return this.decide(context).triggerReviewBoost;
  },


  /* =====================================
     🧠 STEP 26 — MEMORY SYSTEM
  ===================================== */
  memory: {

    /* =========================
       KEY NORMALIZER (FIX #1)
    ========================= */
    key(word){
      return "brain_" + (
        word?.en ||
        word?.word ||
        word?.id ||
        "x"
      );
    },

    /* =========================
       SAVE WORD RESULT
    ========================= */
    update(word, correct){

      if(!word) return;

      const key = this.key(word);

      let data;

      try{
        data = JSON.parse(localStorage.getItem(key));
      }catch(e){
        data = null;
      }

      if(!data || typeof data !== "object"){
        data = {
          seen: 0,
          correct: 0,
          wrong: 0,
          last: Date.now(),
          strength: 0.5
        };
      }

      data.seen = (data.seen || 0) + 1;

      if(correct){
        data.correct = (data.correct || 0) + 1;
      } else {
        data.wrong = (data.wrong || 0) + 1;
      }

      const accuracy = data.correct / data.seen;
      const errorRate = data.wrong / data.seen;

      data.strength = Math.max(
        0.05,
        Math.min(0.95, accuracy - errorRate * 0.5)
      );

      data.last = Date.now();

      localStorage.setItem(key, JSON.stringify(data));
    },

    /* =========================
       FORGETTING CURVE
    ========================= */
    decay(word){

      const key = this.key(word);

      const data = JSON.parse(localStorage.getItem(key) || "null");
      if(!data) return 1;

      const days =
        (Date.now() - (data.last || Date.now())) /
        (1000 * 60 * 60 * 24);

      return Math.exp(-days / 4);
    },

    /* =========================
       PRIORITY SCORE
    ========================= */
    priority(word){

      const key = this.key(word);

      const data = JSON.parse(localStorage.getItem(key) || "null");

      if(!data){
        return 1.5;
      }

      const strength = data.strength ?? 0.5;
      const decay = this.decay(word);

      const score = (1 - strength) * 2 + (1 - decay);

      return Math.max(0.2, Math.min(score, 3));
    },

    /* =========================
       BUILD NEXT LESSON POOL
    ========================= */
    buildNext(words){

      if(!Array.isArray(words)) return [];

      let pool = [];

      for(const w of words){

        if(!w) continue;

        const weight = Math.max(
          1,
          Math.round(this.priority(w) * 3)
        );

        for(let i = 0; i < weight; i++){
          pool.push(w);
        }
      }

      return this.shuffle(pool);
    },

    /* =========================
       SHUFFLE (SAFE)
    ========================= */
    shuffle(arr){

      const a = Array.isArray(arr) ? [...arr] : [];

      for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }

      return a;
    }
  }
};
