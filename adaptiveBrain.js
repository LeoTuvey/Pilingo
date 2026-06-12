/* =====================================
   🧠 OWL-LINGO ADAPTIVE BRAIN
   STEP 25 + STEP 26 — FULL INTELLIGENCE CORE (PRODUCTION STABLE FIXED v2)
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

      try {
        if (window.AdaptiveEngine?.weight && word) {
          const weight = window.AdaptiveEngine.weight(word);
          if (weight >= 3) {
            result.triggerReviewBoost = true;
          }
        }
      } catch {}

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

    const base = Number(baseXP);
    const safeBase = Number.isFinite(base) ? base : 0;

    return Math.max(
      1,
      Math.round(safeBase * (decision.xpMultiplier || 1))
    );
  },

  /* =====================================
     🔥 UI FEEDBACK
  ===================================== */
  getUIEffects(context = {}){

    const d = this.decide(context);

    return {
      mood: d.mood,
      shake: d.mood === "wrong",
      flash: d.mood === "correct" ? "correct" : "wrong",
      streakFire: !!d.showStreakBoost,
      intensity: d.intensity
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
       KEY NORMALIZER
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
       SAFE JSON PARSE
    ========================= */
    _parse(raw){
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    /* =========================
       SAVE WORD RESULT
    ========================= */
    update(word, correct){

      if(!word) return;

      const key = this.key(word);

      let data = this._parse(localStorage.getItem(key));

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

      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    },

    /* =========================
       FORGETTING CURVE
    ========================= */
    decay(word){

      const key = this.key(word);

      const data = this._parse(localStorage.getItem(key));
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

      const data = this._parse(localStorage.getItem(key));

      if(!data){
        return 1.5;
      }

      const strength = data.strength ?? 0.5;
      const decay = this.decay(word);

      const score = (1 - strength) * 2 + (1 - decay);

      return Math.max(0.2, Math.min(score, 3));
    },

    /* =====================================
       BUILD NEXT LESSON POOL
    ===================================== */
    buildNext(words){

      if(!Array.isArray(words)) return [];

      const pool = [];

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
