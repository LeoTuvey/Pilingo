const Engine = {

  init(){
    this.dailyReset();
    this.updateStreak();
    this.ensureFirstSkill();
    this.applyMapClickFix();
  },

  getCourse(){
    return localStorage.getItem("course") || "en-ku";
  },

  getXP(){
    const c = this.getCourse();
    return parseInt(localStorage.getItem(c + "_xp") || "0", 10) || 0;
  },

  addXP(v){
    const c = this.getCourse();
    const key = c + "_xp";

    const xp = this.getXP() + (Number(v) || 0);
    localStorage.setItem(key, String(xp));
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
    const hearts = parseInt(localStorage.getItem("hearts") || "5", 10);
    return Math.max(0, Math.min(5, hearts || 0));
  },

  loseHeart(){
    const hearts = Math.max(0, this.getHearts() - 1);
    localStorage.setItem("hearts", String(hearts));
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
    localStorage.setItem("skill_" + index, "1");

    return unlocked;
  },

  ensureFirstSkill(){
    localStorage.setItem("skill_0", "1");
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
    localStorage.setItem("hearts", "5");
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
