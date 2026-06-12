/* =====================================
   🧠 OWL-LINGO ADAPTIVE ENGINE
   STEP 23 — SMART LEARNING SYSTEM (STEP 25 FINAL FIXED)
===================================== */

const AdaptiveEngine = {

  /* =========================
     🔧 SINGLE SOURCE WORD KEY (FIXED)
  ========================= */
  getKey(word){

    if(!word || typeof word !== "object") return "unknown";

    // FORCE CONSISTENCY WITH ENGINE CORE
    return String(word.en || "unknown");
  },

  /* =========================
     📊 TRACK ANSWERS (SAFE)
  ========================= */
  mark(word, correct){

    const key = "w_" + this.getKey(word);

    let data;
    try{
      data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');
    }catch(e){
      data = { c:0, w:0 };
    }

    data.c = data.c || 0;
    data.w = data.w || 0;

    if(correct) data.c += 1;
    else data.w += 1;

    localStorage.setItem(key, JSON.stringify(data));
  },

  /* =========================
     ⚖️ CALCULATE WEIGHT (STABLE CURVE v2)
  ========================= */
  weight(word){

    const key = "w_" + this.getKey(word);

    let data;
    try{
      data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');
    }catch(e){
      data = { c:0, w:0 };
    }

    const mistakes = data.w || 0;
    const correct = data.c || 0;

    // FIXED: smoother learning curve (no oscillation)
    let score = (mistakes * 1.6) - (correct * 0.4);

    let weight = Math.round(score + 1);

    // HARD CAP for performance stability
    return Math.max(1, Math.min(weight, 5));
  },

  /* =========================
     🔁 BUILD ADAPTIVE POOL
  ========================= */
  buildPool(words){

    if(!Array.isArray(words)) return [];

    const pool = [];

    for(const w of words){

      if(!w) continue;

      const weight = this.weight(w);

      for(let i = 0; i < weight; i++){
        pool.push(w);
      }
    }

    return this.shuffle(pool);
  },

  /* =========================
     🔀 SHUFFLE (SAFE IMMUTABLE)
  ========================= */
  shuffle(arr){

    const a = Array.isArray(arr) ? [...arr] : [];

    for(let i = a.length - 1; i > 0; i--){

      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  },

  /* =========================
     🎯 GET SMART QUESTION SET (FIXED LOGIC)
  ========================= */
  getQuestions(baseQuestions){

    if(!Array.isArray(baseQuestions)){
      return [];
    }

    const pool = this.buildPool(baseQuestions);

    // IMPORTANT: never bypass adaptive system silently
    if(pool.length === 0){
      return [];
    }

    return pool;
  }
};
