/* =========================
   🧠 ENGINE CORE
   STEP 25 FINAL — STABLE + SAFE + PRODUCTION READY
========================= */

const Engine = {

  /* =========================
     INIT (NEW - IMPORTANT)
  ========================= */
  init(){
    try {
      this.dailyReset();
      this.updateStreak();
    } catch (e) {
      console.warn("Engine init failed:", e);
    }
  },

  /* =========================
     COURSE
  ========================= */
  getCourse(){
    try {
      return localStorage.getItem("course") || "en-ku";
    } catch {
      return "en-ku";
    }
  },

  /* =========================
     XP SYSTEM
  ========================= */
  getXP(){
    try {
      const course = Engine.getCourse();
      const xp = parseInt(localStorage.getItem(course + "_xp") || "0", 10);
      return Number.isFinite(xp) ? xp : 0;
    } catch {
      return 0;
    }
  },

  addXP(v){
    try {
      const course = Engine.getCourse();
      const key = course + "_xp";

      const xp = Engine.getXP() + (Number(v) || 0);

      localStorage.setItem(key, String(xp));
      return xp;
    } catch {
      return 0;
    }
  },

  /* =========================
     LEVEL SYSTEM
  ========================= */
  getLevel(){
    const xp = Engine.getXP();

    if(xp < 50) return 0;
    if(xp < 120) return 1;
    if(xp < 220) return 2;
    if(xp < 350) return 3;
    if(xp < 500) return 4;
    return 5;
  },

  /* =========================
     HEARTS
  ========================= */
  getHearts(){
    try {
      const h = parseInt(localStorage.getItem("hearts") || "5", 10);
      return Number.isFinite(h) ? h : 5;
    } catch {
      return 5;
    }
  },

  loseHeart(){
    const h = Math.max(0, Engine.getHearts() - 1);
    localStorage.setItem("hearts", String(h));
    return h;
  },

  resetHearts(){
    localStorage.setItem("hearts", "5");
    return 5;
  },

  /* =========================
     STREAK SYSTEM (SAFE FIXED)
  ========================= */
  updateStreak(){
    try {
      const today = new Date().toISOString().split("T")[0];
      const last = localStorage.getItem("lastDay");

      let streak = parseInt(localStorage.getItem("streak") || "0", 10);
      if (!Number.isFinite(streak)) streak = 0;

      if (last !== today) {

        if (last) {
          const diffDays =
            (new Date(today).getTime() - new Date(last).getTime())
            / (1000 * 60 * 60 * 24);

          if (diffDays === 1) streak += 1;
          else if (diffDays > 1) streak = 1;
        } else {
          streak = 1;
        }

        localStorage.setItem("streak", String(streak));
        localStorage.setItem("lastDay", today);
      }

      return streak;

    } catch {
      return 0;
    }
  },

  /* =========================
     WORD SYSTEM
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
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : { c:0, w:0 };
    } catch {
      return { c:0, w:0 };
    }
  },

  markCorrect(word){
    const key = "w_" + Engine._wordKey(word);
    const data = Engine._safeParse(key);

    data.c++;
    localStorage.setItem(key, JSON.stringify(data));
  },

  markWrong(word){
    const key = "w_" + Engine._wordKey(word);
    const data = Engine._safeParse(key);

    data.w++;
    localStorage.setItem(key, JSON.stringify(data));
  },

  getWeakScore(word){
    const key = "w_" + Engine._wordKey(word);
    const data = Engine._safeParse(key);

    const mistakes = data.w || 0;
    const correct = data.c || 0;

    const score = (mistakes * 2) - correct;

    return Math.max(1, Math.round(score));
  },

  /* =========================
     REVIEW
  ========================= */
  getReviewWords(pool){
    if (!Array.isArray(pool)) return [];

    let weighted = [];

    for (const w of pool) {
      if (!w) continue;

      const weight = Math.min(8, Engine.getWeakScore(w));

      for (let i = 0; i < weight; i++) {
        weighted.push(w);
      }
    }

    for (let i = weighted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }

    return weighted.length ? weighted : pool;
  },

  /* =========================
     SKILLS
  ========================= */
  getSkillState(i){
    const v = parseInt(localStorage.getItem("skill_" + i) || "0", 10);
    return Number.isFinite(v) ? v : 0;
  },

  setSkillState(i, v){
    v = Math.max(0, Math.min(4, Number(v) || 0));
    localStorage.setItem("skill_" + i, String(v));
  },

  markSkillProgress(i, correct = true){
    let s = Engine.getSkillState(i);

    if (correct && s < 4) s++;
    else if (!correct && s > 0) s--;

    Engine.setSkillState(i, s);
    return s;
  },

  /* =========================
     DAILY RESET
  ========================= */
  dailyReset(){
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastReset = localStorage.getItem("dailyReset");

      if (lastReset !== today) {
        localStorage.setItem("dailyReset", today);
        localStorage.setItem("dailyXP", "0");
      }
    } catch {}
  }
};

/* =========================
   AUTO BOOT (IMPORTANT FIX)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  Engine.init();
});
