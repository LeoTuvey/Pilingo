/* =====================================
   🧠 OWL-LINGO POLISH LAYER
   STEP 19 — DUOLINGO UX SYSTEM (FIXED + STEP 21 READY)
===================================== */

const AppPolish = {

  /* =========================
     🦉 OWL EMOTION ENGINE
  ========================= */
  setMood(state){

    const owl =
      document.getElementById("owl") ||
      document.getElementById("owlGuide");

    if(!owl) return;

    owl.classList.remove(
      "happy",
      "sad",
      "celebrate",
      "levelup"
    );

    if(state === "correct") owl.classList.add("happy");
    if(state === "wrong") owl.classList.add("sad");
    if(state === "levelup") owl.classList.add("celebrate");
  },

  /* =========================
     ✨ XP POPUP ANIMATION
  ========================= */
  xpPopup(amount){

    const el = document.createElement("div");

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

    setTimeout(() => el.style.opacity = "1", 50);

    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 400);
    }, 900);
  },

  /* =========================
     🏅 BADGE SYSTEM
  ========================= */
  unlockBadge(id){

    const badges = JSON.parse(
      localStorage.getItem("badges") || "[]"
    );

    if(!badges.includes(id)){
      badges.push(id);
      localStorage.setItem("badges", JSON.stringify(badges));

      this.showBadgePopup(id);
    }
  },

  showBadgePopup(id){

    const el = document.createElement("div");

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

    setTimeout(() => el.remove(), 1500);
  },

  /* =========================
     🔥 STREAK VISUAL (SAFE)
  ========================= */
  getStreakLevel(){

    let streak = 0;

    if(
      window.Engine &&
      typeof Engine.updateStreak === "function"
    ){
      streak = Engine.updateStreak();
    }

    streak = isNaN(streak) ? 0 : streak;

    if(streak >= 10) return "🔥🔥🔥";
    if(streak >= 5) return "🔥🔥";
    if(streak >= 1) return "🔥";

    return "";
  },

  /* =========================
     🚀 ONBOARDING FLOW
  ========================= */
  firstTimeCheck(){

    const seen = localStorage.getItem("seenIntro");

    if(!seen){
      localStorage.setItem("seenIntro", "true");

      if(window.location.pathname !== "/index.html"){
        window.location.href = "index.html";
      }
    }
  },

  /* =========================
     ⚡ STEP 21 EFFECT FLASH
  ========================= */
  flash(type){

    // prevent stacking flashes
    const existing = document.getElementById("owl-flash");
    if(existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-flash";

    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.opacity = "0.12";

    if(type === "correct") el.style.background = "green";
    if(type === "wrong") el.style.background = "red";
    if(type === "levelup") el.style.background = "gold";

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 200);
  }
};
