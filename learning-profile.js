/* =========================
   🧠 OWL-LINGO LEARNING PROFILE
   STEP 26 — PERSONALIZATION ENGINE
========================= */

const LearningProfile = {

  /* =========================
     📊 GET ALL WORD STATS
  ========================= */
  getAllStats(){

    const keys = Object.keys(localStorage);

    let stats = [];

    for(const key of keys){

      if(!key.startsWith("w_")) continue;

      try{
        const data = JSON.parse(localStorage.getItem(key));

        const word = key.replace("w_", "");

        stats.push({
          word,
          correct: data.c || 0,
          wrong: data.w || 0,
          total: (data.c || 0) + (data.w || 0)
        });

      }catch(e){}
    }

    return stats;
  },

  /* =========================
     📉 FIND WEAK AREAS
  ========================= */
  getWeakWords(limit = 5){

    const stats = this.getAllStats();

    return stats
      .sort((a, b) => (b.wrong - a.wrong))
      .slice(0, limit);
  },

  /* =========================
     🧠 BUILD SKILL PROFILE
  ========================= */
  getSkillProfile(){

    const stats = this.getAllStats();

    let totalWrong = 0;
    let totalCorrect = 0;

    for(const s of stats){
      totalWrong += s.wrong;
      totalCorrect += s.correct;
    }

    return {
      accuracy: totalCorrect + totalWrong === 0
        ? 0
        : totalCorrect / (totalCorrect + totalWrong),

      weakWords: this.getWeakWords(3)
    };
  }
};
