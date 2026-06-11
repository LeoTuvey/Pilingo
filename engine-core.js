// =====================================
// 🦉 OWL-LINGO PROGRESSION ENGINE
// =====================================

const Engine = {

  /* ---------------- COURSE ---------------- */
  getCourse(){
    return localStorage.getItem("course") || "en-ku";
  },

  /* ---------------- GLOBAL XP ---------------- */
  getXP(){
    let c = this.getCourse();
    return parseInt(localStorage.getItem(c+"_xp") || "0");
  },

  addXP(v){
    let c = this.getCourse();
    let key = c+"_xp";
    let xp = parseInt(localStorage.getItem(key) || "0");
    localStorage.setItem(key, xp + v);
  },

  /* ---------------- HEARTS ---------------- */
  getHearts(){
    return parseInt(localStorage.getItem("hearts") || "5");
  },

  loseHeart(){
    let h = this.getHearts() - 1;
    localStorage.setItem("hearts", h);
    return h;
  },

  resetHearts(){
    localStorage.setItem("hearts","5");
  },

  /* ---------------- STREAK ---------------- */
  updateStreak(){

    let today = new Date().toDateString();
    let last = localStorage.getItem("lastDay");
    let streak = parseInt(localStorage.getItem("streak") || "0");

    if(last !== today){

      if(last){
        let diff = (new Date(today)-new Date(last))/(1000*60*60*24);
        streak = (diff === 1) ? streak + 1 : 1;
      } else {
        streak = 1;
      }

      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDay", today);
    }

    return streak;
  },

  /* ---------------- SKILL PROGRESS ---------------- */
  getSkillState(index){
    let key = "skill_"+index;
    return parseInt(localStorage.getItem(key) || "0");
  },

  setSkillState(index, value){
    localStorage.setItem("skill_"+index, value);
  },

  upgradeSkill(index){

    let state = this.getSkillState(index);

    if(state < 4){
      state++;
      this.setSkillState(index, state);
    }

    return state;
  },

  /* ---------------- SKILL XP ---------------- */
  addSkillXP(skillId, amount){

    let key = skillId + "_xp";
    let xp = parseInt(localStorage.getItem(key) || "0");

    localStorage.setItem(key, xp + amount);
  },

  getSkillXP(skillId){
    return parseInt(localStorage.getItem(skillId+"_xp") || "0");
  },

  /* ---------------- ADAPTIVE WEIGHT SYSTEM ---------------- */
  getWeakWeight(word){

    // simulate weakness tracking
    let wrong = parseInt(localStorage.getItem(word.en+"_wrong") || "0");
    let correct = parseInt(localStorage.getItem(word.en+"_correct") || "0");

    return Math.max(1, wrong - correct);
  },

  markCorrect(word){
    let key = word.en+"_correct";
    let v = parseInt(localStorage.getItem(key) || "0");
    localStorage.setItem(key, v+1);
  },

  markWrong(word){
    let key = word.en+"_wrong";
    let v = parseInt(localStorage.getItem(key) || "0");
    localStorage.setItem(key, v+1);
  }

};
