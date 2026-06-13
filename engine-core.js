const Engine = {

  init(){
    this.dailyReset();
    this.updateStreak();
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

document.addEventListener("DOMContentLoaded", () => {
  Engine.init();
});
