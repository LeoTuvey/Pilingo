const Engine = {
  HEARTS_MAX: 5,
  HEART_REFILL_MS: 2 * 60 * 60 * 1000,

  init(){
    this.dailyReset();
    this.updateStreak();
    this.ensureFirstSkill();
    this.applyMapClickFix();
  },

  getCourse(){
    localStorage.setItem("course", "en-ku");
    return "en-ku";
  },

  setCourse(course){
    const next = "en-ku";
    localStorage.setItem("course", next);
    this.ensureFirstSkill();
    return next;
  },

  getCourseLabel(){
    return "Kurmanji to English";
  },

  getXP(){
    const c = this.getCourse();
    return parseInt(localStorage.getItem(c + "_xp") || "0", 10) || 0;
  },

  addXP(v){
    const c = this.getCourse();
    const key = c + "_xp";
    const amount = Number(v) || 0;

    const xp = this.getXP() + amount;
    localStorage.setItem(key, String(xp));

    const dailyXP = parseInt(localStorage.getItem("dailyXP") || "0", 10) || 0;
    localStorage.setItem("dailyXP", String(dailyXP + amount));

    try {
      const quest = JSON.parse(localStorage.getItem("dailyQuest") || "null");
      if (quest && quest.day === new Date().toDateString()) {
        quest.progress = (Number(quest.progress) || 0) + amount;
        localStorage.setItem("dailyQuest", JSON.stringify(quest));
      }
    } catch {}

    return xp;
  },

  getLevel(){
    const xp = this.getXP();

    if (xp < 50) return 0;
    if (xp < 120) return 1;
    if (xp < 220) return 2;
    if (xp < 350) return 3;
    if (xp < 500) return 4;
    return 5;
  },

  getHearts(){
    this.applyHeartRefill();
    const hearts = parseInt(localStorage.getItem("hearts") || String(this.HEARTS_MAX), 10);
    return Math.max(0, Math.min(this.HEARTS_MAX, hearts || 0));
  },

  loseHeart(){
    this.applyHeartRefill();
    const current = this.getHearts();
    if (current >= this.HEARTS_MAX) {
      localStorage.setItem("heartsRefillStartedAt", String(Date.now()));
    }

    const hearts = Math.max(0, current - 1);
    localStorage.setItem("hearts", String(hearts));
    return hearts;
  },

  getHeartRefillRemainingMs(){
    this.applyHeartRefill();
    const hearts = this.getHearts();
    if (hearts >= this.HEARTS_MAX) return 0;

    const startedAt = parseInt(localStorage.getItem("heartsRefillStartedAt") || "0", 10) || 0;
    if (!startedAt) return this.HEART_REFILL_MS;

    return Math.max(0, this.HEART_REFILL_MS - (Date.now() - startedAt));
  },

  applyHeartRefill(){
    const hearts = parseInt(localStorage.getItem("hearts") || String(this.HEARTS_MAX), 10) || 0;
    if (hearts >= this.HEARTS_MAX) {
      localStorage.removeItem("heartsRefillStartedAt");
      return this.HEARTS_MAX;
    }

    const startedAt = parseInt(localStorage.getItem("heartsRefillStartedAt") || "0", 10) || 0;
    if (!startedAt) {
      localStorage.setItem("heartsRefillStartedAt", String(Date.now()));
      return hearts;
    }

    if (Date.now() - startedAt >= this.HEART_REFILL_MS) {
      this.resetHearts();
      return this.HEARTS_MAX;
    }

    return hearts;
  },

  unlockLevel(level){
    const course = this.getCourse();
    const key = course + "_unlocked";
    let unlocked;

    try {
      unlocked = JSON.parse(
        localStorage.getItem(key) ||
        "[true,false,false,false,false,false,false]"
      );
    } catch {
      unlocked = [true,false,false,false,false,false,false];
    }

    if (!Array.isArray(unlocked)) {
      unlocked = [true,false,false,false,false,false,false];
    }

    const index = Number(level) || 0;
    unlocked[index] = true;
    localStorage.setItem(key, JSON.stringify(unlocked));

    if (index > 0) {
      localStorage.setItem("skill_" + (index - 1), "4");
    }

    const currentSkillLevel =
      parseInt(localStorage.getItem("skill_" + index) || "0", 10) || 0;

    if (index < 7 && currentSkillLevel < 1) {
      localStorage.setItem("skill_" + index, "1");
    }

    return unlocked;
  },

  completeSkill(skillIndex, xpReward = 10){
    const index = Math.max(0, Math.min(6, Number(skillIndex) || 0));

    this.addXP(xpReward);
    this.updateStreak();
    this.resetHearts();

    localStorage.setItem("skill_" + index, "4");

    if (index < 6) {
      this.unlockLevel(index + 1);
    }

    return this.getXP();
  },

  ensureFirstSkill(){
    const current = parseInt(localStorage.getItem("skill_0") || "0", 10) || 0;
    if (current < 1) {
      localStorage.setItem("skill_0", "1");
    }
  },

  applyMapClickFix(){
    if (document.getElementById("engine-map-click-fix")) return;

    const style = document.createElement("style");
    style.id = "engine-map-click-fix";
    style.textContent = ".line,#owlGuide{pointer-events:none!important;}";
    document.head.appendChild(style);

    setTimeout(() => {
      const firstNode = document.querySelector(".node");
      if (!firstNode) return;

      firstNode.classList.remove("locked");
      firstNode.classList.add("unlocked");
      firstNode.style.pointerEvents = "auto";
    }, 300);
  },

  updateStreak(){
    const today = new Date().toISOString().split("T")[0];
    const last = localStorage.getItem("lastDay");

    let streak = parseInt(localStorage.getItem("streak") || "0", 10) || 0;

    if (last !== today) {
      if (last) {
        const diff = (new Date(today) - new Date(last)) / 86400000;
        streak = diff === 1 ? streak + 1 : 1;
      } else {
        streak = 1;
      }

      localStorage.setItem("streak", String(streak));
      localStorage.setItem("lastDay", today);
    }

    return streak;
  },

  resetHearts(){
    localStorage.setItem("hearts", String(this.HEARTS_MAX));
    localStorage.removeItem("heartsRefillStartedAt");
  },

  dailyReset(){
    const today = new Date().toISOString().split("T")[0];
    const last = localStorage.getItem("dailyReset");

    if (last !== today) {
      localStorage.setItem("dailyReset", today);
      localStorage.setItem("dailyXP", "0");
    }
  }
};

window.Engine = Engine;

document.addEventListener("DOMContentLoaded", () => {
  Engine.init();
});
