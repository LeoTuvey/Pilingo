/* =====================================
   🧠 OWL-LINGO STEP 31
   REAL DIFFICULTY INTELLIGENCE LAYER
===================================== */

const AdaptiveDifficulty = {

  /* =========================
     📦 LOAD WORD HISTORY SAFE
  ========================= */
  _load(wordKey){

    try{
      return JSON.parse(
        localStorage.getItem("diff_" + wordKey) ||
        '{"history":[]}'
      );
    }catch(e){
      return { history: [] };
    }
  },

  /* =========================
     💾 SAVE WORD HISTORY SAFE
  ========================= */
  _save(wordKey, data){
    localStorage.setItem(
      "diff_" + wordKey,
      JSON.stringify(data)
    );
  },

  /* =========================
     📊 RECORD ATTEMPT
  ========================= */
  record(word, correct){

    const key = this._key(word);
    const data = this._load(key);

    data.history.push({
      correct: !!correct,
      t: Date.now()
    });

    // keep last 20 only (prevents memory bloat)
    if(data.history.length > 20){
      data.history.shift();
    }

    this._save(key, data);
  },

  /* =========================
     🔑 WORD KEY NORMALIZER
  ========================= */
  _key(word){

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
     🧠 DIFFICULTY SCORE ENGINE
  ========================= */
  getDifficulty(word){

    const key = this._key(word);
    const data = this._load(key);

    const history = data.history || [];

    if(history.length === 0) return 1;

    let now = Date.now();

    let score = 0;

    for(let i = 0; i < history.length; i++){

      const h = history[i];

      // recency weight (newer = stronger impact)
      const ageHours = (now - h.t) / (1000 * 60 * 60);

      let decay = Math.exp(-ageHours / 48); // 2-day half-life

      if(h.correct){
        score -= 1 * decay;
      } else {
        score += 2 * decay;
      }
    }

    // clamp to stable range
    return Math.max(1, Math.round(score + 1));
  },

  /* =========================
     🎯 FINAL WEIGHT (STEP 31 CORE OUTPUT)
  ========================= */
  getWeight(word){

    const base = this.getDifficulty(word);

    // soft cap prevents extreme repetition loops
    return Math.max(1, Math.min(base, 6));
  }
};
