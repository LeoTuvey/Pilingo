const PilingoAudio = (() => {
  let audioContext = null;

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
    tone(520, offset, 0.18, { type:"sine", slideTo:760, volume:0.045, filter:2800 });
    tone(760, offset + 0.16, 0.24, { type:"sine", slideTo:430, volume:0.04, filter:2600 });
  }

  function quack(offset){
    tone(330, offset, 0.11, { type:"square", slideTo:230, volume:0.035, filter:900 });
    tone(290, offset + 0.14, 0.11, { type:"square", slideTo:210, volume:0.03, filter:900 });
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

  function getYoungEnglishFemaleVoice(){
    if(!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    const savedVoiceName = localStorage.getItem("pilingo_voice_name");
    const savedVoice = savedVoiceName
      ? voices.find((voice) => voice.name === savedVoiceName)
      : null;

    if(savedVoice) return savedVoice;

    const englishVoices = voices.filter((voice) => {
      const lang = (voice.lang || "").toLowerCase();
      const name = (voice.name || "").toLowerCase();

      if(!lang.startsWith("en")) return false;
      if(lang.startsWith("sv")) return false;
      if(name.includes("swedish") || name.includes("svenska")) return false;
      return true;
    });

    const preferredNames = [
      "ivy",
      "aria",
      "ava",
      "allison",
      "samantha",
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

  function speak(text){
    if(!window.speechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getYoungEnglishFemaleVoice();
    utterance.rate = 0.92;
    utterance.pitch = 1.32;
    utterance.volume = 1;
    utterance.lang = voice?.lang || "en-US";
    if(voice) utterance.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if(window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = getYoungEnglishFemaleVoice;
  }

  return {
    playCorrect,
    playWrong,
    playLessonComplete,
    speak,
    getYoungEnglishFemaleVoice
  };
})();

window.PilingoAudio = PilingoAudio;
