const AppEffects = {

  xpBurst(xp){

    if (!document?.body) return;

    const value = Number(xp) || 0;

    const existing = document.getElementById("owl-xp-burst");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-xp-burst";

    el.innerText = "+" + value + " XP";

    Object.assign(el.style, {
      position: "fixed",
      top: "40%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      fontSize: "28px",
      fontWeight: "bold",
      color: "#58cc02",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.3s",
      pointerEvents: "none"
    });

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });

    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 800);
  },

  streakFire(){

    if (!document?.body) return;

    const existing = document.getElementById("owl-streak-fire");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-streak-fire";

    el.innerText = "🔥 Streak!";

    Object.assign(el.style, {
      position: "fixed",
      top: "30%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      fontSize: "30px",
      fontWeight: "bold",
      color: "orange",
      zIndex: "9999",
      pointerEvents: "none"
    });

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 900);
  },

  shake(){

    if (!document?.body) return;

    const target = document.body;

    target.style.transition = "transform 0.1s";
    target.style.transform = "translateX(-6px)";

    setTimeout(() => {
      target.style.transform = "translateX(6px)";
    }, 80);

    setTimeout(() => {
      target.style.transform = "translateX(0)";
      target.style.transition = "";
    }, 160);
  },

  flash(type){

    if (!document?.body) return;

    const safeType = ["correct", "wrong", "levelup"].includes(type)
      ? type
      : "default";

    const existing = document.getElementById("owl-flash");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-flash";

    Object.assign(el.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: "0.18",
      zIndex: "9998",
      pointerEvents: "none"
    });

    const colors = {
      correct: "#58cc02",
      wrong: "#ff4b4b",
      levelup: "#ffd700",
      default: "white"
    };

    el.style.background = colors[safeType];

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 240);
  }
};
