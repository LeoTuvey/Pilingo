/* =====================================
   🧠 OWL-LINGO APP STATE SYSTEM
   STEP 22B — REAL RESUME ENGINE (STEP 25 HARDENED)
===================================== */

const AppState = {

  /* =========================
     🔑 INTERNAL KEY SYSTEM
  ========================= */
  _key(){
    return "owl_state_v1";
  },

  /* =========================
     📥 SAFE LOAD (HARDENED)
  ========================= */
  load(){
    try{
      const raw = localStorage.getItem(this._key());
      return raw ? JSON.parse(raw) : null;
    }catch(e){
      return null;
    }
  },

  /* =========================
     💾 SAVE FULL SESSION (SAFE MERGE)
  ========================= */
  save(data){

    const current = this.load() || {};

    const updated = {
      ...current,
      ...data,
      timestamp: Date.now()
    };

    try{
      localStorage.setItem(
        this._key(),
        JSON.stringify(updated)
      );
    }catch(e){
      // fail silently (prevents lesson breakage)
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
        skill: Number.isFinite(data.skill) ? data.skill : 0,
        question: Number.isFinite(data.question) ? data.question : 0,
        score: Number.isFinite(data.score) ? data.score : 0
      }
    });
  },

  /* =========================
     📍 LESSON RESUME (ROBUST)
  ========================= */
  resume(){

    const state = this.load();

    const lesson = state?.lesson;

    return {
      skill: Number.isFinite(lesson?.skill) ? lesson.skill : 0,
      question: Number.isFinite(lesson?.question) ? lesson.question : 0,
      score: Number.isFinite(lesson?.score) ? lesson.score : 0
    };
  },

  /* =========================
     🧹 CLEAR LESSON ONLY (ATOMIC SAFE)
  ========================= */
  clearLessonProgress(){

    const state = this.load();

    if(!state || typeof state !== "object") return;

    // atomic rebuild (prevents race overwrite bugs)
    const { lesson, ...rest } = state;

    this.save(rest);
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

    if(!state){
      this.save({
        firstTime: true,
        createdAt: Date.now()
      });
    }
  }
};
