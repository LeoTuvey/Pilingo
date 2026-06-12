/* =========================
   🎬 OWL-LINGO EFFECT SYSTEM
   STEP 21 — APP FEEL LAYER
========================= */

const AppEffects = {

  /* =========================
     ✨ XP BURST EFFECT
  ========================= */
  xpBurst(xp){

    let el = document.createElement("div");

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

    document.body.appendChild(el);

    setTimeout(()=> el.style.opacity = "1", 50);

    setTimeout(()=>{
      el.style.opacity = "0";
      setTimeout(()=> el.remove(), 300);
    }, 800);
  },

  /* =========================
     🔥 STREAK FIRE EFFECT
  ========================= */
  streakFire(){

    let el = document.createElement("div");

    el.innerText = "🔥 Streak!";
    el.style.position = "fixed";
    el.style.top = "30%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%,-50%)";
    el.style.fontSize = "30px";
    el.style.fontWeight = "bold";
    el.style.color = "orange";
    el.style.zIndex = "9999";

    document.body.appendChild(el);

    setTimeout(()=> el.remove(), 900);
  },

  /* =========================
     ❌ WRONG SHAKE EFFECT
  ========================= */
  shake(){

    document.body.style.transform = "translateX(-5px)";

    setTimeout(()=>{
      document.body.style.transform = "translateX(5px)";
    }, 80);

    setTimeout(()=>{
      document.body.style.transform = "translateX(0)";
    }, 160);
  },

  /* =========================
     🟢 SUCCESS FLASH
  ========================= */
  flash(type){

    let color = type === "correct" ? "#58cc02" : "#ff4b4b";

    let el = document.createElement("div");

    el.style.position = "fixed";
    el.style.top = 0;
    el.style.left = 0;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.background = color;
    el.style.opacity = "0.25";
    el.style.zIndex = "9998";

    document.body.appendChild(el);

    setTimeout(()=> el.remove(), 200);
  }
};
