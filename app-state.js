/* =====================================
   🧠 OWL-LINGO APP STATE SYSTEM
   STEP 22B — REAL RESUME ENGINE (FIXED)
===================================== */

const AppState = {

  /* =========================
     🔑 INTERNAL KEY SYSTEM
  ========================= */
  _key(){
    return "owl_state_v1";
  },

  /* =========================
     📥 SAFE LOAD (FIXED)
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

    localStorage.setItem(
      this._key(),
      JSON.stringify(updated)
    );
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
        skill: data.skill ?? 0,
        question: data.question ?? 0,
        score: data.score ?? 0
      }
    });
  },

  /* =========================
     📍 LESSON RESUME (SAFE DEFAULTS)
  ========================= */
  resume(){

    const state = this.load();

    if(!state || !state.lesson){
      return {
        skill: 0,
        question: 0,
        score: 0
      };
    }

    return {
      skill: state.lesson.skill ?? 0,
      question: state.lesson.question ?? 0,
      score: state.lesson.score ?? 0
    };
  },

  /* =========================
     🧹 CLEAR LESSON ONLY (SAFE)
  ========================= */
  clearLessonProgress(){

    const state = this.load();
    if(!state) return;

    delete state.lesson;

    localStorage.setItem(
      this._key(),
      JSON.stringify(state)
    );
  },

  /* =========================
     💾 GENERIC SAFE SET/GET
  ========================= */
  set(key, value){

    if(!key) return;

    const state = this.load() || {};
    state[key] = value;

    localStorage.setItem(
      this._key(),
      JSON.stringify(state)
    );
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
