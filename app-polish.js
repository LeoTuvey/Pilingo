/* =====================================
   🧠 OWL-LINGO POLISH LAYER
   STEP 19 — DUOLINGO UX SYSTEM
===================================== */

const AppPolish = {

  /* =========================
     🦉 OWL EMOTION ENGINE
  ========================= */
  setMood(state){

    let owl = document.getElementById("owl");
    if(!owl) return;

    owl.classList.remove("happy","sad","celebrate");

    if(state === "correct") owl.classList.add("happy");
    if(state === "wrong") owl.classList.add("sad");
    if(state === "levelup") owl.classList.add("celebrate");
  },

  /* =========================
     ✨ XP POPUP ANIMATION
  ========================= */
  xpPopup(amount){

    let el = document.createElement("div");

    el.innerText = "+" + amount + " XP";
    el.style.position = "fixed";
    el.style.top = "20%";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.background = "#58cc02";
    el.style.color = "white";
    el.style.padding = "10px 16px";
    el.style.borderRadius = "20px";
    el.style.fontWeight = "bold";
    el.style.zIndex = "9999";
    el.style.opacity = "0";
    el.style.transition = "0.3s";

    document.body.appendChild(el);

    setTimeout(()=> el.style.opacity = "1", 50);

    setTimeout(()=>{
      el.style.opacity = "0";
      setTimeout(()=> el.remove(), 400);
    }, 900);
  },

  /* =========================
     🏅 BADGE SYSTEM
  ========================= */
  unlockBadge(id){

    let badges = JSON.parse(localStorage.getItem("badges") || "[]");

    if(!badges.includes(id)){
      badges.push(id);
      localStorage.setItem("badges", JSON.stringify(badges));

      this.showBadgePopup(id);
    }
  },

  showBadgePopup(id){

    let el = document.createElement("div");

    el.innerHTML = "🏅 Badge Unlocked: " + id;
    el.style.position = "fixed";
    el.style.top = "40%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%,-50%)";
    el.style.background = "#000";
    el.style.color = "#fff";
    el.style.padding = "20px";
    el.style.borderRadius = "15px";
    el.style.zIndex = "9999";

    document.body.appendChild(el);

    setTimeout(()=> el.remove(), 1500);
  },

  /* =========================
     🔥 STREAK VISUAL
  ========================= */
  getStreakLevel(){

    let streak = 0;

    if(window.Engine){
      streak = Engine.updateStreak();
    }

    if(streak >= 10) return "🔥🔥🔥";
    if(streak >= 5) return "🔥🔥";
    if(streak >= 1) return "🔥";
    return "";
  },

  /* =========================
     🚀 ONBOARDING FLOW
  ========================= */
  firstTimeCheck(){

    let seen = localStorage.getItem("seenIntro");

    if(!seen){
      localStorage.setItem("seenIntro", "true");
      window.location.href = "index.html";
    }
  }
};
