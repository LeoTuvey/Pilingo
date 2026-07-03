const Engine = {
  HEARTS_MAX: 5,
  HEART_REFILL_MS: 2 * 60 * 60 * 1000,

  init(){
    this.dailyReset();
    this.updateStreak();
    this.ensureFirstSkill();
    this.ensureCourseProgress();
  },

  getCourse(){
    localStorage.setItem("course", "en-ku");
    return "en-ku";
  },

  setCourse(course){
    const next = "en-ku";
    localStorage.setItem("course", next);
    this.ensureFirstSkill();
    this.ensureCourseProgress();
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

  addHeart(amount = 1){
    this.applyHeartRefill();
    const current = this.getHearts();
    const next = Math.max(0, Math.min(this.HEARTS_MAX, current + (Number(amount) || 0)));
    localStorage.setItem("hearts", String(next));

    if (next >= this.HEARTS_MAX) {
      localStorage.removeItem("heartsRefillStartedAt");
    } else if (!localStorage.getItem("heartsRefillStartedAt")) {
      localStorage.setItem("heartsRefillStartedAt", String(Date.now()));
    }

    return next;
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

  getCourseProgressKey(){
    return this.getCourse() + "_course_progress_v2";
  },

  getCourseProgress(){
    const fallback = { sections: {} };

    try {
      const saved = JSON.parse(localStorage.getItem(this.getCourseProgressKey()) || "null");
      if (!saved || typeof saved !== "object") {
        return fallback;
      }

      if (!saved.sections || typeof saved.sections !== "object") {
        saved.sections = {};
      }

      return saved;
    } catch {
      return fallback;
    }
  },

  saveCourseProgress(progress){
    localStorage.setItem(this.getCourseProgressKey(), JSON.stringify(progress));
    return progress;
  },

  getCourseData(){
    if (!window.COURSE_DATA || !Array.isArray(window.COURSE_DATA.sections)) {
      return null;
    }

    return window.COURSE_DATA;
  },

  getCourseSection(sectionId){
    const courseData = this.getCourseData();
    if (!courseData) return null;
    return courseData.sections.find((section) => section.id === sectionId) || null;
  },

  getCoursePart(sectionId, partId){
    const section = this.getCourseSection(sectionId);
    if (!section || !Array.isArray(section.parts)) return null;
    return section.parts.find((part) => part.id === partId) || null;
  },

  partHasContent(sectionId, partId){
    const part = typeof sectionId === "object"
      ? sectionId
      : this.getCoursePart(sectionId, partId);

    return Boolean(part && part.href);
  },

  getRequiredParts(sectionId){
    const section = this.getCourseSection(sectionId);
    if (!section || !Array.isArray(section.parts)) return [];
    return section.parts.filter((part) => this.partHasContent(part));
  },

  ensureCourseProgress(){
    const courseData = this.getCourseData();
    if (!courseData) return;

    const progress = this.getCourseProgress();

    courseData.sections.forEach((section) => {
      if (!progress.sections[section.id]) {
        progress.sections[section.id] = { parts: {}, completed: false };
      }

      if (!progress.sections[section.id].parts || typeof progress.sections[section.id].parts !== "object") {
        progress.sections[section.id].parts = {};
      }

      (section.parts || []).forEach((part) => {
        if (!progress.sections[section.id].parts[part.id]) {
          progress.sections[section.id].parts[part.id] = {
            completed: false,
            completedAt: null,
            attempts: 0,
            latestResult: null
          };
        }
      });
    });

    this.saveCourseProgress(progress);
  },

  getPartProgress(sectionId, partId){
    this.ensureCourseProgress();
    const progress = this.getCourseProgress();
    const section = progress.sections[sectionId];
    if (!section || !section.parts) return null;
    return section.parts[partId] || null;
  },

  isPartCompleted(sectionId, partId){
    const part = this.getPartProgress(sectionId, partId);
    return Boolean(part && part.completed);
  },

  isSectionCompleted(sectionId){
    const requiredParts = this.getRequiredParts(sectionId);
    if (!requiredParts.length) {
      return false;
    }

    return requiredParts.every((part) => this.isPartCompleted(sectionId, part.id));
  },

  getCompletedPartsCount(sectionId){
    const requiredParts = this.getRequiredParts(sectionId);
    return requiredParts.filter((part) => this.isPartCompleted(sectionId, part.id)).length;
  },

  getCurrentPart(){
    const courseData = this.getCourseData();
    if (!courseData) return null;

    for (const section of courseData.sections) {
      if (!this.isSectionUnlocked(section.id)) continue;

      for (const part of section.parts || []) {
        if (
          this.partHasContent(part) &&
          this.isPartUnlocked(section.id, part.id) &&
          !this.isPartCompleted(section.id, part.id)
        ) {
          return { sectionId: section.id, partId: part.id };
        }
      }
    }

    return null;
  },

  isSectionUnlocked(sectionId){
    const courseData = this.getCourseData();
    if (!courseData) return false;

    const sectionIndex = courseData.sections.findIndex((section) => section.id === sectionId);
    if (sectionIndex === -1) return false;
    if (sectionIndex === 0) return true;

    const previousSection = courseData.sections[sectionIndex - 1];
    return this.isSectionCompleted(previousSection.id);
  },

  isPartUnlocked(sectionId, partId){
    const section = this.getCourseSection(sectionId);
    if (!section || !Array.isArray(section.parts) || !this.isSectionUnlocked(sectionId)) {
      return false;
    }

    const partIndex = section.parts.findIndex((part) => part.id === partId);
    if (partIndex === -1) return false;
    const part = section.parts[partIndex];
    const requiredParts = this.getRequiredParts(sectionId);

    if (this.partHasContent(part)) {
      const requiredIndex = requiredParts.findIndex((entry) => entry.id === partId);
      if (requiredIndex <= 0) return true;
      return this.isPartCompleted(sectionId, requiredParts[requiredIndex - 1].id);
    }

    for (let index = partIndex - 1; index >= 0; index -= 1) {
      const previousPart = section.parts[index];
      if (this.partHasContent(previousPart)) {
        return this.isPartCompleted(sectionId, previousPart.id);
      }
    }

    return true;
  },

  completeCoursePart(sectionId, partId, meta = {}){
    this.ensureCourseProgress();

    const part = this.getCoursePart(sectionId, partId);
    if (!part) return null;

    const progress = this.getCourseProgress();
    const sectionState = progress.sections[sectionId];
    const partState = sectionState.parts[partId];
    const wasCompleted = Boolean(partState.completed);

    partState.attempts = (partState.attempts || 0) + 1;
    partState.latestResult = meta.result || "passed";

    if (!wasCompleted) {
      partState.completed = true;
      partState.completedAt = new Date().toISOString();
      this.addXP(Number(meta.xp) || 10);
      this.addHeart(1);
      this.updateStreak();
    }

    const requiredParts = this.getRequiredParts(sectionId);
    sectionState.completed = Boolean(
      requiredParts.length &&
      requiredParts.every((entry) => sectionState.parts[entry.id] && sectionState.parts[entry.id].completed)
    );
    this.saveCourseProgress(progress);

    return {
      sectionCompleted: sectionState.completed,
      nextSectionUnlocked: sectionState.completed,
      alreadyCompleted: wasCompleted
    };
  },

  failCoursePart(sectionId, partId, meta = {}){
    this.ensureCourseProgress();

    const progress = this.getCourseProgress();
    const sectionState = progress.sections[sectionId];
    if (!sectionState || !sectionState.parts || !sectionState.parts[partId]) {
      return null;
    }

    sectionState.parts[partId].attempts = (sectionState.parts[partId].attempts || 0) + 1;
    sectionState.parts[partId].latestResult = meta.result || "failed";
    this.saveCourseProgress(progress);
    return sectionState.parts[partId];
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
