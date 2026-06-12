/* =====================================
   📱 OWL-LINGO APP UI SYSTEM (FIXED)
   STEP 17 — SAFE PRODUCTION VERSION
===================================== */

const AppUI = {

/* =========================
   🧠 SAFE ENGINE ACCESS
========================= */
getXP(){
  return window.Engine ? Engine.getXP() : 0;
},

/* =========================
   🦉 OWL MOOD SYSTEM
========================= */
getMood(){

  let xp = this.getXP();

  if(xp < 50) return "new";
  if(xp < 150) return "learning";
  if(xp < 300) return "confident";
  return "master";
},

/* =========================
   🦉 OWL UPDATE (SAFE)
========================= */
updateOwl(){

  let owl = document.getElementById("owl");

  if(!owl || !window.Engine) return;

  let mood = this.getMood();

  owl.classList.remove("owl-new","owl-learning","owl-confident","owl-master");

  if(mood === "new") owl.innerText = "🦉";
  if(mood === "learning") owl.innerText = "🦉✨";
  if(mood === "confident") owl.innerText = "🦉🔥";
  if(mood === "master") owl.innerText = "🦉🏆";
},

/* =========================
   🔔 NOTIFICATIONS
========================= */
notify(message){

  let n = document.createElement("div");

  n.innerText = message;

  n.style.position = "fixed";
  n.style.top = "20px";
  n.style.left = "50%";
  n.style.transform = "translateX(-50%)";
  n.style.background = "#000";
  n.style.color = "#fff";
  n.style.padding = "10px 16px";
  n.style.borderRadius = "20px";
  n.style.zIndex = "9999";
  n.style.fontSize = "14px";
  n.style.opacity = "0";
  n.style.transition = "0.3s";

  document.body.appendChild(n);

  setTimeout(()=> n.style.opacity = "1", 50);

  setTimeout(()=>{
    n.style.opacity = "0";
    setTimeout(()=> n.remove(), 300);
  }, 2500);
},

/* =========================
   🎯 DAILY QUEST SYSTEM
========================= */
getDailyQuest(){

  let today = new Date().toDateString();
  let stored = localStorage.getItem("dailyQuest");

  if(stored){
    let data = JSON.parse(stored);
    if(data.day === today) return data;
  }

  let quest = {
    day: today,
    goal: 20,
    progress: 0,
    reward: 10
  };

  localStorage.setItem("dailyQuest", JSON.stringify(quest));

  return quest;
},

updateQuestProgress(amount){

  let quest = this.getDailyQuest();

  quest.progress += amount;

  localStorage.setItem("dailyQuest", JSON.stringify(quest));

  if(quest.progress >= quest.goal){
    this.notify("🎯 Daily Quest Complete! +10 XP");

    if(window.Engine){
      Engine.addXP(quest.reward);
    }
  }
},

/* =========================
   📱 NAVIGATION SYSTEM
========================= */
navigate(url){

  let fade = document.createElement("div");

  fade.style.position = "fixed";
  fade.style.top = "0";
  fade.style.left = "0";
  fade.style.width = "100%";
  fade.style.height = "100%";
  fade.style.background = "#fff";
  fade.style.zIndex = "9999";
  fade.style.opacity = "0";
  fade.style.transition = "0.25s ease";

  document.body.appendChild(fade);

  setTimeout(()=> fade.style.opacity = "1", 10);

  setTimeout(()=>{
    window.location.href = url;
  }, 250);
},

/* =========================
   🚀 INIT SYSTEM (IMPORTANT FIX)
========================= */
init(){

  this.getDailyQuest();
  this.updateOwl();
}

};

/* =========================
   AUTO START HOOK
========================= */

document.addEventListener("DOMContentLoaded", ()=>{
  AppUI.init();
});
