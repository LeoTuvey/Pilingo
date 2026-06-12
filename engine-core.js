const Engine = {

/* =========================
   COURSE
========================= */
getCourse(){
  return localStorage.getItem("course") || "en-ku";
},

/* =========================
   XP + LEVEL
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
   🧠 WORD MEMORY SYSTEM (IMPROVED)
========================= */

markCorrect(word){

  let key = "w_" + word.en;

  let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

  data.c += 1;

  localStorage.setItem(key, JSON.stringify(data));
},

markWrong(word){

  let key = "w_" + word.en;

  let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

  data.w += 1;

  localStorage.setItem(key, JSON.stringify(data));
},

getWeakScore(word){

  let key = "w_" + word.en;
  let data = JSON.parse(localStorage.getItem(key) || '{"c":0,"w":0}');

  // stronger penalty system
  let mistakes = data.w;
  let correct = data.c;

  let score = (mistakes * 2) - correct;

  return Math.max(1, score);
},

/* =========================
   🔁 REAL REVIEW SYSTEM
========================= */

getReviewWords(pool){

  let weighted = [];

  pool.forEach(w=>{

    let weight = this.getWeakScore(w);

    for(let i=0;i<weight;i++){
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
  return parseInt(localStorage.getItem("skill_"+i) || "0");
},

setSkillState(i,v){
  localStorage.setItem("skill_"+i,v);
},

markSkillProgress(i, correct=true){

  let s = this.getSkillState(i);

  if(correct && s < 4) s++;
  if(!correct && s > 0) s--;

  this.setSkillState(i,s);

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

    // optional: reset daily XP tracking only
    localStorage.setItem("dailyXP", "0");
  }
}

};
