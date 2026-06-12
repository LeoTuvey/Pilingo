/* =========================
 🧠 OWL-LINGO STEP 31
 ADAPTIVE DIFFICULTY ENGINE
========================= */

const AdaptiveEngineV31 = {

  /* =========================
     🎯 DIFFICULTY STATE
  ========================= */
  state: {
    difficulty: 1, // 0.5 (easy) → 2.5 (hard)
    heat: 0        // performance pressure tracker
  },

  /* =========================
     📊 UPDATE DIFFICULTY
  ========================= */
  update(context = {}){

    const {
      correct,
      streak = 0
    } = context;

    // increase heat on success streak
    if(correct){
      this.state.heat += 1;
    } else {
      this.state.heat -= 2;
    }

    // clamp heat
    this.state.heat = Math.max(-5, Math.min(10, this.state.heat));

    // =========================
    // DIFFICULTY LOGIC
    // =========================
    if(this.state.heat <= -3){
      this.state.difficulty = 0.7; // easier mode
    }

    if(this.state.heat >= 5){
      this.state.difficulty = 1.8; // harder mode
    }

    if(streak >= 5){
      this.state.difficulty += 0.2;
    }

    if(streak === 0 && !correct){
      this.state.difficulty -= 0.1;
    }

    // clamp difficulty
    this.state.difficulty =
      Math.max(0.5, Math.min(2.5, this.state.difficulty));
  },

  /* =========================
     ⚡ XP SCALING
  ========================= */
  scaleXP(baseXP){

    return Math.max(
      1,
      Math.round(baseXP * this.state.difficulty)
    );
  },

  /* =========================
     📚 WORD PRIORITY BOOST
  ========================= */
  weight(word, baseWeight = 1){

    const difficulty = this.state.difficulty;

    // harder mode → emphasize weak words
    if(difficulty > 1.5){
      return baseWeight * 1.5;
    }

    // easy mode → reduce repetition
    if(difficulty < 0.8){
      return baseWeight * 0.7;
    }

    return baseWeight;
  },

  /* =========================
     🎯 GET CURRENT STATE
  ========================= */
  getState(){
    return {
      ...this.state
    };
  }
};

// expose globally
window.AdaptiveEngineV31 = AdaptiveEngineV31;
