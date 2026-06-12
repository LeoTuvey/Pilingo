/* =====================================
   🧠 OWL-LINGO ADAPTIVE ENGINE
   STEP 23 — SMART LEARNING SYSTEM
===================================== */

const AdaptiveEngine = {

  /* =========================
     📊 TRACK ANSWERS
  ========================= */
  mark(word, correct){

    let key = "w_" + word.en;

    let data = JSON.parse(
      localStorage.getItem(key) || '{"c":0,"w":0}'
    );

    if(correct){
      data.c++;
    } else {
      data.w++;
    }

    localStorage.setItem(key, JSON.stringify(data));
  },

  /* =========================
     ⚖️ CALCULATE WEIGHT
  ========================= */
  weight(word){

    let key = "w_" + word.en;

    let data = JSON.parse(
      localStorage.getItem(key) || '{"c":0,"w":0}'
    );

    // mistakes matter more than correct answers
    let mistakes = data.w;
    let correct = data.c;

    let score = (mistakes * 2) - correct;

    // minimum weight = 1
    return Math.max(1, score + 1);
  },

  /* =========================
     🔁 BUILD ADAPTIVE POOL
  ========================= */
  buildPool(words){

    let pool = [];

    words.forEach(w => {

      let weight = this.weight(w);

      for(let i = 0; i < weight; i++){
        pool.push(w);
      }

    });

    return this.shuffle(pool);
  },

  /* =========================
     🔀 SHUFFLE (FISHER-YATES)
  ========================= */
  shuffle(arr){

    for(let i = arr.length - 1; i > 0; i--){

      let j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  },

  /* =========================
     🎯 GET SMART QUESTION SET
  ========================= */
  getQuestions(baseQuestions){

    // convert normal list → adaptive list
    return this.buildPool(baseQuestions);
  }
};
