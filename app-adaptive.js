/* =====================================
   🧠 OWL-LINGO ADAPTIVE ENGINE
   STEP 23 — SMART LEARNING SYSTEM (FIXED)
===================================== */

const AdaptiveEngine = {

  /* =========================
     🔧 SAFE WORD KEY
  ========================= */
  getKey(word){
    return (
      word.en ||
      word.word ||
      word.translation ||
      "unknown"
    );
  },

  /* =========================
     📊 TRACK ANSWERS
  ========================= */
  mark(word, correct){

    let key = "w_" + this.getKey(word);

    let data = JSON.parse(
      localStorage.getItem(key) || '{"c":0,"w":0}'
    );

    if(correct){
      data.c++;
    } else {
      data.w++;
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  /* =========================
     ⚖️ CALCULATE WEIGHT (IMPROVED)
  ========================= */
  weight(word){

    let key = "w_" + this.getKey(word);

    let data = JSON.parse(
      localStorage.getItem(key) || '{"c":0,"w":0}'
    );

    let mistakes = data.w;
    let correct = data.c;

    // smoother Duolingo-like curve
    let score = (mistakes * 1.5) - (correct * 0.5);

    // ensure at least 1 appearance
    return Math.max(1, Math.round(score + 1));
  },

  /* =========================
     🔁 BUILD ADAPTIVE POOL
  ========================= */
  buildPool(words){

    let pool = [];

    if(!Array.isArray(words)) return [];

    words.forEach(w => {

      let weight = this.weight(w);

      for(let i = 0; i < weight; i++){
        pool.push(w);
      }

    });

    return this.shuffle(pool);
  },

  /* =========================
     🔀 SHUFFLE (FISHER-YATES)
  ========================= */
  shuffle(arr){

    let a = [...arr];

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

    if(!baseQuestions) return [];

    return this.buildPool(baseQuestions);
  }
};
