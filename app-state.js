/* =====================================
   🧠 OWL-LINGO APP STATE MANAGER
   STEP 18 — CORE FLOW SYSTEM
===================================== */

const AppState = {

  /* =========================
     SAVE SESSION
  ========================= */
  save(key, value){
    localStorage.setItem("owl_" + key, JSON.stringify(value));
  },

  get(key){
    let v = localStorage.getItem("owl_" + key);
    return v ? JSON.parse(v) : null;
  },

  /* =========================
     CURRENT FLOW STATE
  ========================= */
  setLastSkill(skillId){
    this.save("lastSkill", skillId);
  },

  getLastSkill(){
    return this.get("lastSkill") || 0;
  },

  setLessonProgress(data){
    this.save("lessonProgress", data);
  },

  getLessonProgress(){
    return this.get("lessonProgress") || {
      skill: 0,
      question: 0,
      score: 0
    };
  },

  clearLessonProgress(){
    localStorage.removeItem("owl_lessonProgress");
  },

  /* =========================
     APP ROUTING LAYER
  ========================= */
  go(url){

    // smooth app-like transition
    let fade = document.createElement("div");

    fade.style.position = "fixed";
    fade.style.top = "0";
    fade.style.left = "0";
    fade.style.width = "100%";
    fade.style.height = "100%";
    fade.style.background = "#fff";
    fade.style.zIndex = "99999";
    fade.style.opacity = "0";
    fade.style.transition = "0.25s";

    document.body.appendChild(fade);

    setTimeout(()=> fade.style.opacity = "1", 10);

    setTimeout(()=>{
      window.location.href = url;
    }, 250);
  },

  /* =========================
     RESUME LOGIC
  ========================= */
  resume(){

    let progress = this.getLessonProgress();

    if(!progress) return false;

    return progress;
  }
};
