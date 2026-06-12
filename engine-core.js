/* =========================
   🧠 ENGINE CORE
   STEP 21 SAFE + APP POLISH COMPATIBLE
========================= */

const Engine = {

  /* =========================
     COURSE
  ========================= */
  getCourse(){
    return localStorage.getItem("course") || "en-ku";
  },

  /* =========================
     XP SYSTEM (SAFE + CONSISTENT)
  ========================= */
  getXP(){
    let c = this.getCourse();
    return parseInt(localStorage.getItem(c + "_xp") || "0", 10);
  },

  addXP(v){
    let c = this.getCourse();
    let key = c + "_xp";

    let xp = this.getXP();
    xp = isNaN(xp) ? 0 : xp;

    xp += v;

    localStorage.setItem(key, xp);
    return xp;
  },

  /* =========================
     LEVEL SYSTEM (IMPROVED FOR POLISH LAYERS)
  ========================= */
  getLevel(){
    let xp = this.getXP();

    if(xp < 50) return 0;
    if(xp < 120) return 1;
    if(xp < 220) return 2;
    if(xp < 350) return 3;
    if(xp < 500) return 4;

    return 5;
  },

  /* =========================
     HEARTS SYSTEM (SAFE)
  ========================= */
  getHearts(){
    return parseInt(localStorage.getItem("hearts") || "5", 10);
  },

  loseHeart(){
    let h = this.getHearts();

    h = isNaN(h) ? 5 : h;
    h = Math.max(0, h - 1);

    localStorage.setItem("hearts", h);
    return h;
  },

  resetHearts(){
    localStorage.setItem("hearts", "5");
    return 5;
  },

  /* =========================
     STREAK SYSTEM (FIXED LOGIC)
  ========================= */
  updateStreak(){

    let today = new Date().toDateString();
    let last = localStorage.getItem("lastDay");
    let streak = parseInt(localStorage.getItem("streak") || "0", 10);

    if(isNaN(streak)) streak = 0;

    if(last !== today){

      if(last){
        let diff =
          (new Date(today).getTime() - new Date(last).getTime())
          / (1000 * 60 * 60 * 24);

        if(diff === 1){
          streak += 1;
        } else if(diff > 1){
          streak = 1;
        }
      } else {
        streak = 1;
      }

      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDay", today);
    }

    return streak;
  },

  /* =========================
     WORD MEMORY SYSTEM
  ========================= */
  markCorrect(word){

    if(!word || !word.en) return;

    let key = "w_" + word.en;

    let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

    data.c += 1;

    localStorage.setItem(key, JSON.stringify(data));
  },

  markWrong(word){

    if(!word || !word.en) return;

    let key = "w_" + word.en;

    let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

    data.w += 1;

    localStorage.setItem(key, JSON.stringify(data));
  },

  getWeakScore(word){

    if(!word || !word.en) return 1;

    let key = "w_" + word.en;
    let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

    let mistakes = data.w || 0;
    let correct = data.c || 0;

    let score = (mistakes * 2) - correct;

    return Math.max(1, score);
  },

  /* =========================
     REVIEW SYSTEM
  ========================= */
  getReviewWords(pool){

    let weighted = [];

    pool.forEach(w => {

      let weight = this.getWeakScore(w);

      for(let i = 0; i < weight; i++){
        weighted.push(w);
      }

    });

    // shuffle
    for(let i = weighted.length - 1; i > 0; i--){
      let j = Math.floor(Math.random() * (i + 1));
      [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }

    return weighted.length ? weighted : pool;
  },

  /* =========================
     SKILL SYSTEM (SAFE)
  ========================= */
  getSkillState(i){
    return parseInt(localStorage.getItem("skill_" + i) || "0", 10);
  },

  setSkillState(i, v){
    v = Math.max(0, Math.min(4, v));
    localStorage.setItem("skill_" + i, v);
  },

  markSkillProgress(i, correct = true){

    let s = this.getSkillState(i);

    if(correct && s < 4) s++;
    if(!correct && s > 0) s--;

    this.setSkillState(i, s);

    return s;
  },

  /* =========================
     DAILY RESET HOOK
  ========================= */
  dailyReset(){

    let today = new Date().toDateString();
    let lastReset = localStorage.getItem("dailyReset");

    if(lastReset !== today){
      localStorage.setItem("dailyReset", today);
      localStorage.setItem("dailyXP", "0");
    }
  }
};
