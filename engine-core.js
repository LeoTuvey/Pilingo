/* =====================================
   🧠 OWL-LINGO ENGINE CORE (STEP 13 SAFE)
   BUILDS ON STEP 12 (DO NOT REMOVE OLD FEATURES)
===================================== */

const Engine = {

/* =========================
   COURSE
========================= */
getCourse(){
  return localStorage.getItem("course") || "en-ku";
},

/* =========================
   XP SYSTEM
========================= */
getXP(){
  let c = this.getCourse();
  return parseInt(localStorage.getItem(c+"_xp") || "0");
},

addXP(v){
  let c = this.getCourse();
  let key = c+"_xp";
  let xp = this.getXP();
  xp += v;
  localStorage.setItem(key, xp);
},

getLevel(){
  return Math.floor(this.getXP() / 50) + 1;
},

/* =========================
   HEARTS
========================= */
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

/* =========================
   STREAK SYSTEM
========================= */
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

/* =========================
   🟢 SKILL MASTERY SYSTEM (STEP 13 CORE)
   REQUIRED FOR engine.html UI
========================= */

getSkillState(index){
  return parseInt(localStorage.getItem("skill_"+index) || "0");
},

setSkillState(index, value){
  localStorage.setItem("skill_"+index, value);
},

upgradeSkill(index){

  let s = this.getSkillState(index);

  if(s < 4){
    s++;
    this.setSkillState(index, s);
  }

  return s;
},

/* =========================
   AUTO SKILL PROGRESSION HOOK
   (CALL THIS FROM LESSON LATER IF NEEDED)
========================= */

markSkillProgress(index, correct=true){

  let current = this.getSkillState(index);

  if(correct){
    if(current < 4) current++;
  } else {
    if(current > 0) current--;
  }

  this.setSkillState(index, current);
  return current;
},

/* =========================
   WORD MEMORY (STEP 12)
========================= */

markCorrect(word){
  let key = word.en+"_c";
  let v = parseInt(localStorage.getItem(key) || "0");
  localStorage.setItem(key, v+1);
},

markWrong(word){
  let key = word.en+"_w";
  let v = parseInt(localStorage.getItem(key) || "0");
  localStorage.setItem(key, v+1);
},

getWeakScore(word){
  let c = parseInt(localStorage.getItem(word.en+"_c") || "0");
  let w = parseInt(localStorage.getItem(word.en+"_w") || "0");
  return Math.max(1, w - c);
},

/* =========================
   REVIEW SYSTEM (STEP 12 CORE)
========================= */

getReviewWords(pool){

  let weighted = [];

  pool.forEach(w=>{
    let weight = this.getWeakScore(w);
    for(let i=0;i<weight;i++){
      weighted.push(w);
    }
  });

  return weighted.length ? weighted : pool;
}

};
