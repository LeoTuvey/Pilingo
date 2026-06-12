/* =========================
   🧠 ENGINE CORE
   STEP 25 FINAL — ADAPTIVE READY + PRODUCTION SAFE (FIXED)
========================= */

const Engine = {

  /* =========================
     COURSE
  ========================= */
  getCourse(){
    return localStorage.getItem("course") || "en-ku";
  },

  /* =========================
     XP SYSTEM (SAFE)
  ========================= */
  getXP(){
    const c = this.getCourse();
    const xp = parseInt(localStorage.getItem(c + "_xp") || "0", 10);
    return isNaN(xp) ? 0 : xp;
  },

  addXP(v){
    const c = this.getCourse();
    const key = c + "_xp";

    let xp = this.getXP();
    const safeValue = Number(v) || 0;

    xp += safeValue;

    localStorage.setItem(key, String(xp));
    return xp;
  },

  /* =========================
     LEVEL SYSTEM
  ========================= */
  getLevel(){
    const xp = this.getXP();

    if(xp < 50) return 0;
    if(xp < 120) return 1;
    if(xp < 220) return 2;
    if(xp < 350) return 3;
    if(xp < 500) return 4;

    return 5;
  },

  /* =========================
     HEARTS SYSTEM
  ========================= */
  getHearts(){
    const h = parseInt(localStorage.getItem("hearts") || "5", 10);
    return isNaN(h) ? 5 : h;
  },

  loseHeart(){
    const h = Math.max(0, this.getHearts() - 1);
    localStorage.setItem("hearts", String(h));
    return h;
  },

  resetHearts(){
    localStorage.setItem("hearts", "5");
    return 5;
  },

  /* =========================
     STREAK SYSTEM (SAFE)
  ========================= */
  updateStreak(){

    const today = new Date().toISOString().split("T")[0];
    const last = localStorage.getItem("lastDay");

    let streak = parseInt(localStorage.getItem("streak") || "0", 10);
    if(isNaN(streak)) streak = 0;

    if(last !== today){

      if(last){

        const diff =
          (new Date(today).getTime() - new Date(last).getTime())
          / 86400000;

        if(diff === 1) streak += 1;
        else if(diff > 1) streak = 1;

      } else {
        streak = 1;
      }

      localStorage.setItem("streak", String(streak));
      localStorage.setItem("lastDay", today);
    }

    return streak;
  },

  /* =========================
     WORD MEMORY SYSTEM (FIXED KEY SAFETY)
  ========================= */

  _wordKey(word){
    return (
      word?.en ||
      word?.word ||
      word?.translation ||
      "unknown"
    );
  },

  _safeParse(key){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {c:0,w:0};
    }catch(e){
      return {c:0,w:0};
    }
  },

  markCorrect(word){

    const key = "w_" + this._wordKey(word);
    const data = this._safeParse(key);

    data.c += 1;
    localStorage.setItem(key, JSON.stringify(data));
  },

  markWrong(word){

    const key = "w_" + this._wordKey(word);
    const data = this._safeParse(key);

    data.w += 1;
    localStorage.setItem(key, JSON.stringify(data));
  },

  getWeakScore(word){

    const key = "w_" + this._wordKey(word);
    const data = this._safeParse(key);

    const mistakes = data.w || 0;
    const correct = data.c || 0;

    const score = (mistakes * 2) - correct;

    return Math.max(1, Math.round(score));
  },

  /* =========================
     REVIEW SYSTEM (CAPPED SAFE)
  ========================= */
  getReviewWords(pool){

    if(!Array.isArray(pool) || pool.length === 0){
      return [];
    }

    let weighted = [];

    for(const w of pool){

      if(!w) continue;

      const weight = Math.min(8, this.getWeakScore(w)); // CAP prevents explosion

      for(let i = 0; i < weight; i++){
        weighted.push(w);
      }
    }

    // shuffle
    for(let i = weighted.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }

    return weighted.length ? weighted : pool;
  },

  /* =========================
     SKILL SYSTEM
  ========================= */
  getSkillState(i){
    const v = parseInt(localStorage.getItem("skill_" + i) || "0", 10);
    return isNaN(v) ? 0 : v;
  },

  setSkillState(i, v){
    v = Math.max(0, Math.min(4, v));
    localStorage.setItem("skill_" + i, String(v));
  },

  markSkillProgress(i, correct = true){

    let s = this.getSkillState(i);

    if(correct && s < 4) s++;
    if(!correct && s > 0) s--;

    this.setSkillState(i, s);
    return s;
  },

  /* =========================
     DAILY RESET
  ========================= */
  dailyReset(){

    const today = new Date().toISOString().split("T")[0];
    const lastReset = localStorage.getItem("dailyReset");

    if(lastReset !== today){
      localStorage.setItem("dailyReset", today);
      localStorage.setItem("dailyXP", "0");
    }
  }
};
