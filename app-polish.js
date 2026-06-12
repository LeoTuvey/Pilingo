const AppPolish = {

  setMood(state){

    const owl =
      document.getElementById("owl") ||
      document.getElementById("owlGuide");

    if(!owl) return;

    owl.classList.remove("happy","sad","celebrate","levelup");

    if(state === "correct") owl.classList.add("happy");
    else if(state === "wrong") owl.classList.add("sad");
    else if(state === "levelup") owl.classList.add("celebrate");
  },

  xpPopup(amount){

    if (!document?.body) return;

    const value = Number(amount) || 0;

    const el = document.createElement("div");

    el.innerText = "+" + value + " XP";

    Object.assign(el.style, {
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#58cc02",
      color: "white",
      padding: "10px 16px",
      borderRadius: "20px",
      fontWeight: "bold",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.3s"
    });

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });

    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 400);
    }, 900);
  },

  unlockBadge(id){

    try {
      const badges = JSON.parse(localStorage.getItem("badges") || "[]");

      if(!badges.includes(id)){
        badges.push(id);
        localStorage.setItem("badges", JSON.stringify(badges));
        this.showBadgePopup(id);
      }
    } catch {}
  },

  showBadgePopup(id){

    if (!document?.body) return;

    const el = document.createElement("div");

    el.innerHTML = "🏅 Badge Unlocked: " + id;

    Object.assign(el.style, {
      position: "fixed",
      top: "40%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      background: "#000",
      color: "#fff",
      padding: "20px",
      borderRadius: "15px",
      zIndex: "9999"
    });

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1500);
  },

  getStreakLevel(){

    try {
      const streak =
        typeof window.Engine?.updateStreak === "function"
          ? window.Engine.updateStreak()
          : 0;

      const safe = Number(streak) || 0;

      if(safe >= 10) return "🔥🔥🔥";
      if(safe >= 5) return "🔥🔥";
      if(safe >= 1) return "🔥";

      return "";

    } catch {
      return "";
    }
  },

  firstTimeCheck(){

    try {
      const seen = localStorage.getItem("seenIntro");

      if(!seen){
        localStorage.setItem("seenIntro", "true");

        const path = window.location.pathname || "";
        const isIndex =
          path.endsWith("index.html") || path === "/";

        if(!isIndex){
          window.location.href = "index.html";
        }
      }
    } catch {}
  },

  flash(type){

    if (!document?.body) return;

    const safeType = ["correct","wrong","levelup"].includes(type)
      ? type
      : "default";

    const existing = document.getElementById("owl-flash");
    if(existing) existing.remove();

    const el = document.createElement("div");
    el.id = "owl-flash";

    Object.assign(el.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "9999",
      opacity: "0.12"
    });

    const colors = {
      correct: "green",
      wrong: "red",
      levelup: "gold",
      default: "white"
    };

    el.style.background = colors[safeType];

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 250);
  }
};
