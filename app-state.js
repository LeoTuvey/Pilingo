/* =====================================
   🧠 OWL-LINGO APP STATE SYSTEM
   STEP 22B — REAL RESUME ENGINE (STEP 25 FINAL HARDENED)
===================================== */

const AppState = {

  /* =========================
     🔑 INTERNAL KEY SYSTEM
  ========================= */
  _key(){
    return "owl_state_v1";
  },

  /* =========================
     📥 SAFE LOAD (ROBUST)
  ========================= */
  load(){
    try{
      const raw = localStorage.getItem(this._key());
      return raw ? JSON.parse(raw) : {};
    }catch(e){
      return {};
    }
  },

  /* =========================
     💾 SAFE ATOMIC SAVE (FIXED RACE SAFETY)
  ========================= */
  save(data){

    try{
      const current = this.load() || {};

      const updated = Object.assign({}, current, data, {
        timestamp: Date.now()
      });

      localStorage.setItem(
        this._key(),
        JSON.stringify(updated)
      );
    }catch(e){
      // fail silently to avoid breaking lesson flow
    }
  },

  /* =========================
     ▶ SAFE NAVIGATION
  ========================= */
  go(url){

    if(typeof url !== "string") return;

    this.save({ lastUrl: url });

    window.location.href = url;
  },

  /* =========================
     📍 LESSON PROGRESS SAVE (SAFE)
  ========================= */
  setLessonProgress(data){

    if(!data || typeof data !== "object") return;

    this.save({
      lesson: {
        skill: Number(data.skill) || 0,
        question: Number(data.question) || 0,
        score: Number(data.score) || 0
      }
    });
  },

  /* =========================
     📍 LESSON RESUME (STRICT SAFE DEFAULTS)
  ========================= */
  resume(){

    const state = this.load();
    const lesson = state?.lesson || {};

    return {
      skill: Number(lesson.skill) || 0,
      question: Number(lesson.question) || 0,
      score: Number(lesson.score) || 0
    };
  },

  /* =========================
     🧹 CLEAR LESSON ONLY (FULLY SAFE ATOMIC)
  ========================= */
  clearLessonProgress(){

    try{
      const state = this.load();

      if(!state || typeof state !== "object") return;

      // rebuild safely (avoid mutation + corruption carryover)
      const newState = Object.assign({}, state);
      delete newState.lesson;

      this.save(newState);
    }catch(e){
      // ignore to prevent crash loops
    }
  },

  /* =========================
     💾 GENERIC SAFE SET/GET
  ========================= */
  set(key, value){

    if(typeof key !== "string") return;

    const state = this.load() || {};
    state[key] = value;

    this.save(state);
  },

  get(key){

    const state = this.load();
    return state ? state[key] : null;
  },

  /* =========================
     🧠 FIRST TIME CHECK (SAFE)
  ========================= */
  firstTimeCheck(){

    const state = this.load();

    if(!state || Object.keys(state).length === 0){
      this.save({
        firstTime: true,
        createdAt: Date.now()
      });
    }
  }
};
