const UX = {

  /* ---------------- OWL EMOTION ---------------- */
  owl(state){

    const o = document.getElementById("owl");

    if(!o) return;

    o.classList.remove("happy","sad","celebrate","thinking");

    if(state === "happy") o.classList.add("happy");
    if(state === "sad") o.classList.add("sad");
    if(state === "celebrate") o.classList.add("celebrate");
    if(state === "thinking") o.classList.add("thinking");
  },

  /* ---------------- SCREEN FLASH ---------------- */
  flash(type){

    let body = document.body;

    body.classList.remove("flash-correct","flash-wrong");

    if(type === "correct"){
      body.classList.add("flash-correct");
    }

    if(type === "wrong"){
      body.classList.add("flash-wrong");
    }

    setTimeout(()=>{
      body.classList.remove("flash-correct","flash-wrong");
    },400);
  },

  /* ---------------- XP POPUP ---------------- */
  xp(amount){

    let el = document.getElementById("xpPopup");
    if(!el) return;

    el.innerText = "+" + amount + " XP";
    el.style.opacity = 1;

    setTimeout(()=> el.style.opacity = 0, 800);
  },

  /* ---------------- STREAK POP ---------------- */
  streak(value){

    let el = document.getElementById("streakBox");
    if(!el) return;

    el.style.transform = "scale(1.1)";
    setTimeout(()=> el.style.transform = "scale(1)",200);
  }

};
