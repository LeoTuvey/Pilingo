const Engine = {

  // ------------------------
  // COURSE
  // ------------------------
  getCourse() {
    return localStorage.getItem("course") || "en-ku";
  },

  // ------------------------
  // XP SYSTEM
  // ------------------------
  getXP() {
    let course = this.getCourse();
    return parseInt(localStorage.getItem(course + "_xp") || "0");
  },

  addXP(amount) {
    let course = this.getCourse();
    let xpKey = course + "_xp";

    let xp = parseInt(localStorage.getItem(xpKey) || "0");
    xp += amount;

    localStorage.setItem(xpKey, xp);
  },

  // ------------------------
  // UNLOCK SYSTEM
  // ------------------------
  getUnlocked() {
    let course = this.getCourse();
    return JSON.parse(
      localStorage.getItem(course + "_unlocked") ||
      "[true,false,false,false,false,false,false]"
    );
  },

  saveUnlocked(arr) {
    let course = this.getCourse();
    localStorage.setItem(course + "_unlocked", JSON.stringify(arr));
  },

  unlockLevel(index) {
    let u = this.getUnlocked();
    u[index] = true;
    this.saveUnlocked(u);
  },

  isUnlocked(index) {
    return this.getUnlocked()[index];
  },

  // ------------------------
  // HEARTS
  // ------------------------
  getHearts() {
    return parseInt(localStorage.getItem("hearts") || "5");
  },

  setHearts(v) {
    localStorage.setItem("hearts", v);
  },

  loseHeart() {
    let h = this.getHearts();
    h--;
    this.setHearts(h);
    return h;
  },

  resetHearts() {
    this.setHearts(5);
  },

  // ------------------------
  // STREAK
  // ------------------------
  updateStreak() {
    let today = new Date().toDateString();
    let last = localStorage.getItem("lastDay");
    let streak = parseInt(localStorage.getItem("streak") || "0");

    if (last !== today) {
      if (last) {
        let diff = (new Date(today) - new Date(last)) / (1000*60*60*24);
        streak = (diff === 1) ? streak + 1 : 1;
      } else {
        streak = 1;
      }

      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDay", today);
    }

    return streak;
  }

};
