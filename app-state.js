/* =====================================
   🧠 OWL-LINGO APP STATE SYSTEM
   STEP 22B — REAL RESUME ENGINE
===================================== */

const AppState = {

  /* =========================
     🔑 INTERNAL KEY SYSTEM
  ========================= */
  _key(){
    return "owl_state_v1";
  },

  /* =========================
     💾 SAVE FULL SESSION
  ========================= */
  save(data){

    let current = this.load() || {};

    let updated = {
      ...current,
      ...data,
      timestamp: Date.now()
    };

    localStorage.setItem(this._key(), JSON.stringify(updated));
  },

  /* =========================
     📥 LOAD SESSION
  ========================= */
  load(){
    try{
      return JSON.parse(localStorage.getItem(this._key()));
    }catch(e){
      return null;
    }
  },

  /* =========================
     ▶ GO TO PAGE (SAFE NAV)
  ========================= */
  go(url){

    // optional save before navigation
    this.save({ lastUrl: url });

    window.location.href = url;
  },

  /* =========================
     📍 LESSON PROGRESS SAVE
  ========================= */
  setLessonProgress(data){

    this.save({
      lesson: {
        skill: data.skill ?? null,
        question: data.question ?? 0,
        score: data.score ?? 0
      }
    });
  },

  /* =========================
     📍 GET LESSON RESUME
  ========================= */
  resume(){

    let state = this.load();

    if(!state || !state.lesson){
      return {
        skill: 0,
        question: 0,
        score: 0
      };
    }

    return state.lesson;
  },

  /* =========================
     🧹 CLEAR LESSON ONLY
  ========================= */
  clearLessonProgress(){

    let state = this.load();
    if(!state) return;

    delete state.lesson;

    localStorage.setItem(this._key(), JSON.stringify(state));
  },

  /* =========================
     💾 GENERIC SAVE (SAFE)
  ========================= */
  set(key, value){

    let state = this.load() || {};
    state[key] = value;

    localStorage.setItem(this._key(), JSON.stringify(state));
  },

  get(key){

    let state = this.load();
    return state ? state[key] : null;
  },

  /* =========================
     🧠 FIRST TIME CHECK
  ========================= */
  firstTimeCheck(){

    let state = this.load();

    if(!state){
      this.save({
        firstTime: true,
        createdAt: Date.now()
      });
    }
  }
};
