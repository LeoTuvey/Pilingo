/* =========================
   🎬 OWL-LINGO EFFECT SYSTEM
   STEP 21 — APP FEEL LAYER (FIXED + SAFE)
========================= */

const AppEffects = {

  /* =========================
     ✨ XP BURST EFFECT
  ========================= */
  xpBurst(xp){

    xp = Number(xp) || 0;

    const el = document.createElement("div");

    el.innerText = "+" + xp + " XP";
    el.style.position = "fixed";
    el.style.top = "40%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%,-50%)";
    el.style.fontSize = "28px";
    el.style.fontWeight = "bold";
    el.style.color = "#58cc02";
    el.style.zIndex = "9999";
    el.style.opacity = "0";
    el.style.transition = "0.3s";
    el.style.pointerEvents = "none";

    document.body.appendChild(el);

    setTimeout(() => el.style.opacity = "1", 50);

    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 800);
  },

  /* =========================
     🔥 STREAK FIRE EFFECT
  ========================= */
  streakFire(){

    const existing = document.getElementById("owl-streak-fire");
    if(existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-streak-fire";

    el.innerText = "🔥 Streak!";
    el.style.position = "fixed";
    el.style.top = "30%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%,-50%)";
    el.style.fontSize = "30px";
    el.style.fontWeight = "bold";
    el.style.color = "orange";
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 900);
  },

  /* =========================
     ❌ WRONG SHAKE EFFECT (FIXED)
  ========================= */
  shake(){

    // prevent stacking transform bugs
    document.body.style.transition = "transform 0.1s";

    document.body.style.transform = "translateX(-6px)";

    setTimeout(() => {
      document.body.style.transform = "translateX(6px)";
    }, 80);

    setTimeout(() => {
      document.body.style.transform = "translateX(0)";
    }, 160);

    setTimeout(() => {
      document.body.style.transition = "";
    }, 200);
  },

  /* =========================
     🟢 SUCCESS / ERROR FLASH
  ========================= */
  flash(type){

    const existing = document.getElementById("owl-flash");
    if(existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-flash";

    el.style.position = "fixed";
    el.style.top = 0;
    el.style.left = 0;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.opacity = "0.2";
    el.style.zIndex = "9998";
    el.style.pointerEvents = "none";

    if(type === "correct") el.style.background = "#58cc02";
    else if(type === "wrong") el.style.background = "#ff4b4b";
    else if(type === "levelup") el.style.background = "#ffd700";
    else el.style.background = "white";

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 180);
  }
};
