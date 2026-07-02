const PilingoAudio = (() => {
  let audioContext = null;
  let buttonSoundInstalled = false;
  let lastTapAt = 0;

  function getContext(){
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return null;
    if(!audioContext) audioContext = new AudioContext();
    if(audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  function tone(frequency, start, duration, options = {}){
    const ctx = getContext();
    if(!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const now = ctx.currentTime;
    const begin = now + start;
    const end = begin + duration;
    const volume = options.volume || 0.06;

    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(frequency, begin);

    if(options.slideTo){
      oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, end);
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(options.filter || 3200, begin);

    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(volume, begin + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(begin);
    oscillator.stop(end + 0.02);
  }

  function canPlayEffects(){
    try {
      const account = window.PilingoAuth?.loadAccount?.();
      if(account?.settings?.soundEffects === false) return false;
    } catch(error) {
      // keep default behavior below
    }

    return true;
  }

  function playButtonTap(){
    if(!canPlayEffects()) return;

    [
      { frequency:540, start:0.00, duration:0.065, type:"triangle", volume:0.065, filter:2800, slideTo:650 },
      { frequency:760, start:0.03, duration:0.075, type:"sine", volume:0.048, filter:3600, slideTo:710 }
    ].forEach((note) => {
      tone(note.frequency, note.start, note.duration, {
        type:note.type,
        volume:note.volume,
        filter:note.filter,
        slideTo:note.slideTo
      });
    });
  }

  function playCorrect(){
    [
      { frequency:587.33, start:0.00, duration:0.18, type:"sine", volume:0.032, filter:3600 },
      { frequency:739.99, start:0.09, duration:0.2, type:"triangle", volume:0.028, filter:3200 },
      { frequency:880.0, start:0.18, duration:0.24, type:"sine", volume:0.03, filter:3900 },
      { frequency:1174.66, start:0.26, duration:0.32, type:"sine", volume:0.024, filter:4300 }
    ].forEach((note) => {
      tone(note.frequency, note.start, note.duration, {
        type:note.type,
        volume:note.volume,
        filter:note.filter
      });
    });
  }

  function playWrong(){
    tone(220, 0, 0.16, { type:"triangle", slideTo:160, volume:0.045, filter:1800 });
  }

  function meow(offset){
    tone(640, offset, 0.08, { type:"triangle", slideTo:920, volume:0.022, filter:2600 });
    tone(560, offset + 0.04, 0.26, { type:"sine", slideTo:840, volume:0.034, filter:3000 });
    tone(820, offset + 0.16, 0.32, { type:"sine", slideTo:430, volume:0.038, filter:2500 });
    tone(410, offset + 0.18, 0.2, { type:"triangle", slideTo:360, volume:0.016, filter:1800 });
  }

  function bark(offset){
    tone(180, offset, 0.06, { type:"square", slideTo:150, volume:0.03, filter:1100 });
    tone(240, offset + 0.03, 0.08, { type:"sawtooth", slideTo:180, volume:0.022, filter:1400 });
    tone(160, offset + 0.13, 0.07, { type:"square", slideTo:130, volume:0.026, filter:1000 });
    tone(220, offset + 0.17, 0.08, { type:"triangle", slideTo:170, volume:0.018, filter:1200 });
  }

  function squeak(offset){
    tone(920, offset, 0.06, { type:"triangle", slideTo:1240, volume:0.022, filter:3400 });
    tone(1120, offset + 0.06, 0.05, { type:"sine", slideTo:980, volume:0.016, filter:3600 });
    tone(980, offset + 0.12, 0.07, { type:"triangle", slideTo:800, volume:0.02, filter:3000 });
  }

  function squawk(offset){
    tone(720, offset, 0.08, { type:"sawtooth", slideTo:460, volume:0.024, filter:2000 });
    tone(540, offset + 0.08, 0.09, { type:"square", slideTo:700, volume:0.022, filter:1900 });
    tone(660, offset + 0.16, 0.06, { type:"triangle", slideTo:560, volume:0.018, filter:2200 });
    tone(500, offset + 0.22, 0.08, { type:"square", slideTo:650, volume:0.017, filter:1800 });
  }

  function quack(offset){
    tone(360, offset, 0.09, { type:"square", slideTo:250, volume:0.03, filter:1000 });
    tone(300, offset + 0.08, 0.1, { type:"square", slideTo:220, volume:0.026, filter:950 });
    tone(340, offset + 0.18, 0.07, { type:"triangle", slideTo:260, volume:0.014, filter:1200 });
  }

  function hoot(offset){
    tone(310, offset, 0.32, { type:"sine", slideTo:250, volume:0.045, filter:1600 });
    tone(230, offset + 0.26, 0.38, { type:"sine", slideTo:190, volume:0.04, filter:1400 });
  }

  function playLessonComplete(){
    playCorrect();
    setTimeout(() => {
      meow(0);
      quack(0.5);
      hoot(1.0);
    }, 420);
  }

  function playStudyAlarm(){
    [
      { frequency:659.25, start:0.00, duration:0.18, type:"sine", volume:0.028, filter:3400 },
      { frequency:880.0, start:0.12, duration:0.18, type:"triangle", volume:0.024, filter:3600 },
      { frequency:659.25, start:0.28, duration:0.18, type:"sine", volume:0.028, filter:3400 },
      { frequency:987.77, start:0.42, duration:0.26, type:"triangle", volume:0.026, filter:3800 }
    ].forEach((note) => {
      tone(note.frequency, note.start, note.duration, {
        type:note.type,
        volume:note.volume,
        filter:note.filter
      });
    });
  }

  function playWoodpeckerAlarm(){
    [
      { frequency:980, start:0.00, duration:0.12, type:"triangle", volume:0.011, filter:2600, slideTo:1240 },
      { frequency:1320, start:0.12, duration:0.11, type:"sine", volume:0.011, filter:3000, slideTo:1120 },
      { frequency:1480, start:0.24, duration:0.12, type:"triangle", volume:0.012, filter:3200, slideTo:1680 },
      { frequency:1220, start:0.38, duration:0.10, type:"sine", volume:0.01, filter:2900, slideTo:1440 },
      { frequency:1680, start:0.50, duration:0.10, type:"triangle", volume:0.011, filter:3400, slideTo:1360 },
      { frequency:1180, start:0.62, duration:0.12, type:"sine", volume:0.009, filter:2800, slideTo:1020 },
      { frequency:1540, start:0.76, duration:0.11, type:"triangle", volume:0.01, filter:3300, slideTo:1760 }
    ].forEach((note) => {
      tone(note.frequency, note.start, note.duration, {
        type:note.type,
        volume:note.volume,
        filter:note.filter,
        slideTo:note.slideTo
      });
    });
  }

  function playPartAnimal(partIndex){
    switch(Number(partIndex)) {
      case 0:
        meow(0);
        break;
      case 1:
        bark(0);
        break;
      case 2:
        squeak(0);
        break;
      case 3:
        squawk(0);
        break;
      case 4:
        quack(0);
        break;
      default:
        hoot(0);
        break;
    }
  }

  function getYoungEnglishFemaleVoice(){
    if(!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => {
      const lang = (voice.lang || "").toLowerCase();
      const name = (voice.name || "").toLowerCase();

      if(!lang.startsWith("en")) return false;
      if(lang.startsWith("sv")) return false;
      if(name.includes("swedish") || name.includes("svenska")) return false;
      return true;
    });

    const samanthaVoice = englishVoices.find((voice) => (voice.name || "").toLowerCase() === "samantha");
    if(samanthaVoice) return samanthaVoice;

    const preferredNames = [
      "samantha",
      "ivy",
      "aria",
      "ava",
      "allison",
      "serena",
      "salli",
      "kimberly",
      "zira",
      "tessa",
      "victoria",
      "moira",
      "anna",
      "alice",
      "monica",
      "susan",
      "karen",
      "female",
      "girl",
      "young",
      "child",
      "kid",
      "junior",
      "joelle",
      "nicky"
    ];

    const preferredEnglish = englishVoices.find((voice) => {
      const name = (voice.name || "").toLowerCase();
      return preferredNames.some((preferred) => name.includes(preferred));
    });

    return preferredEnglish ||
      englishVoices.find((voice) => (voice.lang || "").toLowerCase() === "en-us") ||
      englishVoices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en-gb")) ||
      englishVoices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en-au")) ||
      englishVoices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en-ca")) ||
      englishVoices[0] ||
      null;
  }

  function getVoiceForLang(preferredLang, options){
    if(!window.speechSynthesis) return null;

    const wanted = String(preferredLang || "").toLowerCase().trim();
    const preferFemale = options?.preferFemale === true;
    if(!wanted) return getYoungEnglishFemaleVoice();

    const voices = window.speechSynthesis.getVoices();
    const femaleHints = [
      "female",
      "woman",
      "girl",
      "ava",
      "allison",
      "anna",
      "samantha",
      "serena",
      "salli",
      "karen",
      "victoria",
      "zira",
      "monica",
      "alice",
      "tessa",
      "susan",
      "helena",
      "sofia",
      "saara"
    ];

    const matchesFemale = (voice) => {
      const name = String(voice?.name || "").toLowerCase();
      return femaleHints.some((hint) => name.includes(hint));
    };

    const exactFemale = voices.find((voice) =>
      String(voice.lang || "").toLowerCase() === wanted && matchesFemale(voice)
    );
    if(exactFemale) return exactFemale;

    const familyFemale = voices.find((voice) =>
      String(voice.lang || "").toLowerCase().startsWith(wanted.split("-")[0]) && matchesFemale(voice)
    );
    if(familyFemale) return familyFemale;

    if(preferFemale) {
      return getYoungEnglishFemaleVoice();
    }

    const exact = voices.find((voice) => String(voice.lang || "").toLowerCase() === wanted);
    if(exact) return exact;

    const family = voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(wanted.split("-")[0]));
    return family || getYoungEnglishFemaleVoice();
  }

  function speak(text, options){
    if(!window.speechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoiceForLang(options?.lang, options);
    utterance.rate = 0.92;
    utterance.pitch = 1.32;
    utterance.volume = 1;
    utterance.lang = options?.lang || voice?.lang || "en-US";
    if(voice) utterance.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if(window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = getYoungEnglishFemaleVoice;
  }

  function installButtonSounds(){
    if(buttonSoundInstalled || typeof document === "undefined") return;
    buttonSoundInstalled = true;

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if(!target) return;

      const clickable = target.closest(
        'button, .continue-swipe, .part-card, .section-card, .part-choice, .student-mini-card, .social-student-card, .social-stat-button, .account-link, .password-toggle, .logout-button'
      );
      if(!clickable) return;
      if(clickable.disabled || clickable.getAttribute("aria-disabled") === "true") return;
      if(clickable.classList.contains("speaker")) return;

      const now = Date.now();
      if(now - lastTapAt < 70) return;
      lastTapAt = now;
      playButtonTap();
    }, true);
  }

  if(typeof document !== "undefined"){
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", installButtonSounds, { once:true });
    } else {
      installButtonSounds();
    }
  }

  return {
    canPlayEffects,
    playButtonTap,
    playCorrect,
    playWrong,
    playLessonComplete,
    playStudyAlarm,
    playWoodpeckerAlarm,
    playPartAnimal,
    speak,
    getYoungEnglishFemaleVoice,
    getVoiceForLang,
    installButtonSounds
  };
})();

window.PilingoAudio = PilingoAudio;
