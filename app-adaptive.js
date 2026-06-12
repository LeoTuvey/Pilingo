/* =====================================
   🧠 OWL-LINGO ADAPTIVE ENGINE
   STEP 23 — SMART LEARNING SYSTEM (STEP 25 READY FIXED)
===================================== */

const AdaptiveEngine = {

  /* =========================
     🔧 SAFE WORD KEY (HARDENED)
  ========================= */
  getKey(word){

    if(!word || typeof word !== "object") return "unknown";

    return (
      word.en ||
      word.word ||
      word.translation ||
      word.id ||
      "unknown"
    );
  },

  /* =========================
     📊 TRACK ANSWERS (SAFE)
  ========================= */
  mark(word, correct){

    if(!word) return;

    let key = "w_" + this.getKey(word);

    let data;

    try{
      data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');
    }catch(e){
      data = { c:0, w:0 };
    }

    if(correct){
      data.c = (data.c || 0) + 1;
    } else {
      data.w = (data.w || 0) + 1;
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  /* =========================
     ⚖️ CALCULATE WEIGHT (STABLE CURVE)
  ========================= */
  weight(word){

    let key = "w_" + this.getKey(word);

    let data;

    try{
      data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');
    }catch(e){
      data = { c:0, w:0 };
    }

    let mistakes = data.w || 0;
    let correct = data.c || 0;

    // STEP 25 FIX: prevents runaway inflation
    let score = (mistakes * 1.5) - (correct * 0.75);

    // clamp to prevent over-repetition explosion
    let weight = Math.round(score + 1);

    return Math.max(1, Math.min(weight, 6));
  },

  /* =========================
     🔁 BUILD ADAPTIVE POOL (SAFE)
  ========================= */
  buildPool(words){

    if(!Array.isArray(words)) return [];

    let pool = [];

    for(const w of words){

      if(!w) continue;

      let weight = this.weight(w);

      for(let i = 0; i < weight; i++){
        pool.push(w);
      }
    }

    return this.shuffle(pool);
  },

  /* =========================
     🔀 SHUFFLE (IMMUTABLE SAFE)
  ========================= */
  shuffle(arr){

    let a = Array.isArray(arr) ? [...arr] : [];

    for(let i = a.length - 1; i > 0; i--){

      let j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  },

  /* =========================
     🎯 GET SMART QUESTION SET
  ========================= */
  getQuestions(baseQuestions){

    if(!Array.isArray(baseQuestions)){
      return [];
    }

    // STEP 25 INTEGRATION HOOK SAFETY (future-proof)
    let pool = this.buildPool(baseQuestions);

    if(pool.length === 0){
      return baseQuestions;
    }

    return pool;
  }
};
