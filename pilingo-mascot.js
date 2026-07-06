(function(){
  const STYLE_ID = "pilingo-mascot-styles";
  const DEFAULT_STATE = "idle";
  const TRANSIENT_STATES = new Set(["wave", "smile", "jump", "laugh", "think", "read", "write", "talk", "listen", "celebrate", "sad"]);
  const INSTANCES = new Map();

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .pilingo-mascot{
        --pilingo-size: 128px;
        --pilingo-drop: 0 10px 22px rgba(27, 52, 18, 0.18);
        --pilingo-speed: 1;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--pilingo-size);
        max-width: 100%;
        filter: drop-shadow(var(--pilingo-drop));
        transform-origin: center bottom;
      }

      .pilingo-mascot svg{
        width: 100%;
        height: auto;
        overflow: visible;
        display: block;
      }

      .pilingo-mascot.is-compact{
        --pilingo-drop: 0 6px 14px rgba(27, 52, 18, 0.14);
      }

      .pilingo-mascot.is-home{
        --pilingo-drop: 0 12px 24px rgba(157, 112, 8, 0.22);
      }

      .pilingo-mascot.is-float{
        animation: pilingoFloat 4s ease-in-out infinite;
      }

      .pilingo-mascot [data-part="pilingo"]{ transform-origin: 200px 235px; }
      .pilingo-mascot [data-part="head"]{ transform-origin: 200px 120px; }
      .pilingo-mascot [data-part="left-arm"]{ transform-origin: 155px 205px; }
      .pilingo-mascot [data-part="right-arm"]{ transform-origin: 245px 205px; }
      .pilingo-mascot [data-part="left-leg"]{ transform-origin: 172px 315px; }
      .pilingo-mascot [data-part="right-leg"]{ transform-origin: 228px 315px; }
      .pilingo-mascot [data-part="tail"]{ transform-origin: 260px 300px; }
      .pilingo-mascot [data-part="brow-left"],
      .pilingo-mascot [data-part="brow-right"]{ transform-origin: center center; }

      .pilingo-mascot [data-face="eyes-smile"],
      .pilingo-mascot [data-face="mouth-open"],
      .pilingo-mascot [data-face="mouth-small"]{
        display: none;
      }

      .pilingo-mascot.is-idle [data-part="pilingo"]{ animation: pilingoIdle calc(2.4s / var(--pilingo-speed)) infinite ease-in-out; }
      .pilingo-mascot.is-idle [data-part="tail"]{ animation: pilingoTail calc(1.6s / var(--pilingo-speed)) infinite ease-in-out; }
      .pilingo-mascot.is-idle [data-face="eye-left"],
      .pilingo-mascot.is-idle [data-face="eye-right"]{ animation: pilingoBlink calc(4.2s / var(--pilingo-speed)) infinite; }

      .pilingo-mascot.is-blink [data-face="eye-left"],
      .pilingo-mascot.is-blink [data-face="eye-right"]{ animation: pilingoBlink 0.45s 1 both; }

      .pilingo-mascot.is-smile [data-face="mouth-happy"]{ display: block; }
      .pilingo-mascot.is-smile [data-part="pilingo"]{ animation: pilingoSmile 0.9s ease-in-out infinite; }
      .pilingo-mascot.is-smile [data-part="tail"]{ animation: pilingoTail 1s ease-in-out infinite; }

      .pilingo-mascot.is-wave [data-part="right-arm"]{ animation: pilingoWave 0.75s infinite ease-in-out; }
      .pilingo-mascot.is-wave [data-part="pilingo"]{ animation: pilingoBounce 0.75s infinite ease-in-out; }

      .pilingo-mascot.is-walk [data-part="pilingo"]{ animation: pilingoWalk 0.65s infinite ease-in-out; }
      .pilingo-mascot.is-walk [data-part="left-leg"]{ animation: pilingoLegForward 0.65s infinite ease-in-out; }
      .pilingo-mascot.is-walk [data-part="right-leg"]{ animation: pilingoLegBack 0.65s infinite ease-in-out; }
      .pilingo-mascot.is-walk [data-part="left-arm"]{ animation: pilingoArmBack 0.65s infinite ease-in-out; }
      .pilingo-mascot.is-walk [data-part="right-arm"]{ animation: pilingoArmForward 0.65s infinite ease-in-out; }
      .pilingo-mascot.is-walk [data-part="tail"]{ animation: pilingoTail 0.65s infinite ease-in-out; }

      .pilingo-mascot.is-run{ --pilingo-speed: 1.35; }
      .pilingo-mascot.is-run [data-part="pilingo"]{ animation: pilingoWalk 0.44s infinite ease-in-out; }
      .pilingo-mascot.is-run [data-part="left-leg"]{ animation: pilingoLegForward 0.44s infinite ease-in-out; }
      .pilingo-mascot.is-run [data-part="right-leg"]{ animation: pilingoLegBack 0.44s infinite ease-in-out; }
      .pilingo-mascot.is-run [data-part="left-arm"]{ animation: pilingoArmBack 0.44s infinite ease-in-out; }
      .pilingo-mascot.is-run [data-part="right-arm"]{ animation: pilingoArmForward 0.44s infinite ease-in-out; }
      .pilingo-mascot.is-run [data-part="tail"]{ animation: pilingoTail 0.42s infinite ease-in-out; }

      .pilingo-mascot.is-jump [data-part="pilingo"]{ animation: pilingoJump 0.9s infinite ease-in-out; }
      .pilingo-mascot.is-jump [data-part="tail"]{ animation: pilingoTail 0.75s infinite ease-in-out; }

      .pilingo-mascot.is-laugh [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-laugh [data-face="mouth-open"]{ display: block; }
      .pilingo-mascot.is-laugh [data-face="eyes-smile"]{ display: block; }
      .pilingo-mascot.is-laugh [data-face="eye-left"],
      .pilingo-mascot.is-laugh [data-face="eye-right"]{ display: none; }
      .pilingo-mascot.is-laugh [data-part="pilingo"]{ animation: pilingoLaugh 0.35s infinite ease-in-out; }

      .pilingo-mascot.is-think [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-think [data-face="mouth-small"]{ display: block; }
      .pilingo-mascot.is-think [data-part="head"]{ animation: pilingoThink 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-think [data-part="brow-left"]{ animation: pilingoBrowLeft 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-think [data-part="brow-right"]{ animation: pilingoBrowRight 1.1s infinite ease-in-out; }

      .pilingo-mascot.is-read [data-face="mouth-small"]{ display: block; }
      .pilingo-mascot.is-read [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-read [data-part="head"]{ animation: pilingoRead 1.3s infinite ease-in-out; }
      .pilingo-mascot.is-read [data-part="left-arm"]{ animation: pilingoReadLeftArm 1.3s infinite ease-in-out; }
      .pilingo-mascot.is-read [data-part="right-arm"]{ animation: pilingoReadRightArm 1.3s infinite ease-in-out; }

      .pilingo-mascot.is-write [data-face="mouth-small"]{ display: block; }
      .pilingo-mascot.is-write [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-write [data-part="left-arm"]{ animation: pilingoWriteLeftArm 0.7s infinite ease-in-out; }
      .pilingo-mascot.is-write [data-part="right-arm"]{ animation: pilingoWriteRightArm 0.7s infinite ease-in-out; }
      .pilingo-mascot.is-write [data-part="head"]{ animation: pilingoRead 1.1s infinite ease-in-out; }

      .pilingo-mascot.is-talk [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-talk [data-face="mouth-open"]{ display: block; }
      .pilingo-mascot.is-talk [data-part="head"]{ animation: pilingoTalk 0.72s infinite ease-in-out; }

      .pilingo-mascot.is-listen [data-face="mouth-small"]{ display: block; }
      .pilingo-mascot.is-listen [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-listen [data-part="head"]{ animation: pilingoListen 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-listen [data-part="right-ear-bob"]{ animation: pilingoEarBob 1.1s infinite ease-in-out; }

      .pilingo-mascot.is-celebrate [data-part="pilingo"]{ animation: pilingoCelebrate 0.8s infinite ease-in-out; }
      .pilingo-mascot.is-celebrate [data-part="left-arm"]{ animation: pilingoArmUpLeft 0.8s infinite ease-in-out; }
      .pilingo-mascot.is-celebrate [data-part="right-arm"]{ animation: pilingoArmUpRight 0.8s infinite ease-in-out; }
      .pilingo-mascot.is-celebrate [data-decor="confetti"]{ display: block; animation: pilingoConfetti 1s infinite ease-in-out; }

      .pilingo-mascot.is-sad [data-face="mouth-happy"]{ display: none; }
      .pilingo-mascot.is-sad [data-face="mouth-small"]{ display: block; }
      .pilingo-mascot.is-sad [data-part="pilingo"]{ animation: pilingoSad 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-sad [data-part="tail"]{ animation: pilingoTailSad 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-sad [data-part="brow-left"]{ animation: pilingoBrowLeftSad 1.1s infinite ease-in-out; }
      .pilingo-mascot.is-sad [data-part="brow-right"]{ animation: pilingoBrowRightSad 1.1s infinite ease-in-out; }

      .pilingo-mascot [data-decor="confetti"]{ display: none; }

      @keyframes pilingoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes pilingoIdle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes pilingoBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes pilingoSmile { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.02)} }
      @keyframes pilingoLaugh { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-7px) rotate(1deg)} }
      @keyframes pilingoCelebrate { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-35px) scale(1.04)} }
      @keyframes pilingoWalk { 0%,100%{transform:translateX(-8px) translateY(0)} 50%{transform:translateX(8px) translateY(-6px)} }
      @keyframes pilingoJump { 0%,100%{transform:translateY(0)} 35%{transform:translateY(-26px) scale(1.03)} 70%{transform:translateY(0) scale(0.98)} }
      @keyframes pilingoWave { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(-70deg)} }
      @keyframes pilingoTail { 0%,100%{transform:rotate(-9deg)} 50%{transform:rotate(16deg)} }
      @keyframes pilingoTailSad { 0%,100%{transform:rotate(-16deg)} 50%{transform:rotate(-24deg)} }
      @keyframes pilingoBlink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(.08)} }
      @keyframes pilingoArmUpLeft { 0%,100%{transform:rotate(0)} 50%{transform:rotate(120deg)} }
      @keyframes pilingoArmUpRight { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-120deg)} }
      @keyframes pilingoLegForward { 0%,100%{transform:rotate(-14deg)} 50%{transform:rotate(16deg)} }
      @keyframes pilingoLegBack { 0%,100%{transform:rotate(16deg)} 50%{transform:rotate(-14deg)} }
      @keyframes pilingoArmForward { 0%,100%{transform:rotate(14deg)} 50%{transform:rotate(-18deg)} }
      @keyframes pilingoArmBack { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(14deg)} }
      @keyframes pilingoConfetti { 0%{transform:translateY(-20px);opacity:1} 100%{transform:translateY(45px);opacity:.25} }
      @keyframes pilingoThink { 0%,100%{transform:rotate(0deg) translateY(0)} 50%{transform:rotate(6deg) translateY(-2px)} }
      @keyframes pilingoBrowLeft { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-2px) rotate(-10deg)} }
      @keyframes pilingoBrowRight { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(1px) rotate(6deg)} }
      @keyframes pilingoRead { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(2px) rotate(-4deg)} }
      @keyframes pilingoReadLeftArm { 0%,100%{transform:rotate(12deg)} 50%{transform:rotate(28deg)} }
      @keyframes pilingoReadRightArm { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(-40deg)} }
      @keyframes pilingoWriteLeftArm { 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(24deg)} }
      @keyframes pilingoWriteRightArm { 0%,100%{transform:rotate(-26deg)} 50%{transform:rotate(-54deg)} }
      @keyframes pilingoTalk { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
      @keyframes pilingoListen { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-5deg)} }
      @keyframes pilingoEarBob { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
      @keyframes pilingoSad { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      @keyframes pilingoBrowLeftSad { 0%,100%{transform:rotate(0)} 50%{transform:rotate(8deg) translateY(2px)} }
      @keyframes pilingoBrowRightSad { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-8deg) translateY(2px)} }
    `;
    document.head.appendChild(style);
  }

  function buildMarkup(label){
    return `
      <svg viewBox="0 0 400 420" class="is-idle" aria-label="${escapeAttr(label || "Pilingo animated mascot")}" role="img">
        <g data-decor="confetti">
          <circle cx="80" cy="65" r="5" fill="#ff6b6b"></circle>
          <rect x="300" y="55" width="10" height="10" fill="#ffd93d" transform="rotate(20 305 60)"></rect>
          <circle cx="335" cy="100" r="5" fill="#2ed573"></circle>
          <rect x="65" y="115" width="10" height="10" fill="#4dabf7" transform="rotate(45 70 120)"></rect>
          <circle cx="290" cy="135" r="4" fill="#ff922b"></circle>
        </g>
        <g data-part="pilingo">
          <g data-part="tail">
            <path d="M260 300 C330 310 335 230 292 225 C270 222 280 250 300 252 C318 255 305 290 260 276" fill="#ffb21a" stroke="#1e1e1e" stroke-width="6" stroke-linecap="round"></path>
            <path d="M304 250 C318 255 305 290 260 276" fill="none" stroke="#1e1e1e" stroke-width="8" stroke-linecap="round"></path>
          </g>
          <g data-part="left-leg">
            <path d="M165 285 C145 330 148 372 178 372 C194 372 194 355 185 328 C179 310 182 295 190 285 Z" fill="#ffb21a" stroke="#1e1e1e" stroke-width="5"></path>
            <ellipse cx="174" cy="373" rx="27" ry="15" fill="#fff1cf" stroke="#1e1e1e" stroke-width="4"></ellipse>
          </g>
          <g data-part="right-leg">
            <path d="M235 285 C255 330 252 372 222 372 C206 372 206 355 215 328 C221 310 218 295 210 285 Z" fill="#ffb21a" stroke="#1e1e1e" stroke-width="5"></path>
            <ellipse cx="226" cy="373" rx="27" ry="15" fill="#fff1cf" stroke="#1e1e1e" stroke-width="4"></ellipse>
          </g>
          <g data-part="body">
            <ellipse cx="200" cy="245" rx="73" ry="98" fill="#ffb21a" stroke="#1e1e1e" stroke-width="6"></ellipse>
            <ellipse cx="200" cy="260" rx="43" ry="70" fill="#fff1cf"></ellipse>
            <circle cx="150" cy="205" r="7" fill="#1e1e1e"></circle>
            <circle cx="250" cy="205" r="7" fill="#1e1e1e"></circle>
            <circle cx="154" cy="250" r="6" fill="#1e1e1e"></circle>
            <circle cx="246" cy="250" r="6" fill="#1e1e1e"></circle>
            <circle cx="168" cy="300" r="5" fill="#1e1e1e"></circle>
            <circle cx="232" cy="300" r="5" fill="#1e1e1e"></circle>
          </g>
          <g data-part="backpack">
            <path d="M105 175 C85 215 85 290 115 315 C130 330 147 315 140 295 C125 250 132 210 150 180 Z" fill="#2e7d32" stroke="#1e1e1e" stroke-width="5"></path>
            <circle cx="118" cy="230" r="18" fill="#43a047" stroke="#1e1e1e" stroke-width="3"></circle>
            <text x="112" y="237" font-size="20" font-weight="bold" fill="white">P</text>
          </g>
          <g data-part="left-arm">
            <path d="M145 200 C105 215 92 250 115 265 C132 276 145 246 167 224 Z" fill="#ffb21a" stroke="#1e1e1e" stroke-width="5"></path>
            <circle cx="112" cy="263" r="17" fill="#fff1cf" stroke="#1e1e1e" stroke-width="4"></circle>
          </g>
          <g data-part="right-arm">
            <path d="M255 200 C303 190 320 151 298 137 C281 126 264 164 236 206 Z" fill="#ffb21a" stroke="#1e1e1e" stroke-width="5"></path>
            <circle cx="299" cy="136" r="17" fill="#fff1cf" stroke="#1e1e1e" stroke-width="4"></circle>
          </g>
          <g data-part="head">
            <g data-part="right-ear-bob">
              <circle cx="145" cy="96" r="33" fill="#ffb21a" stroke="#1e1e1e" stroke-width="6"></circle>
              <circle cx="255" cy="96" r="33" fill="#ffb21a" stroke="#1e1e1e" stroke-width="6"></circle>
            </g>
            <circle cx="145" cy="96" r="17" fill="#ffc9b8"></circle>
            <circle cx="255" cy="96" r="17" fill="#ffc9b8"></circle>
            <ellipse cx="200" cy="128" rx="78" ry="72" fill="#ffb21a" stroke="#1e1e1e" stroke-width="6"></ellipse>
            <ellipse cx="170" cy="150" rx="35" ry="30" fill="#fff1cf"></ellipse>
            <ellipse cx="230" cy="150" rx="35" ry="30" fill="#fff1cf"></ellipse>
            <ellipse cx="200" cy="164" rx="38" ry="30" fill="#fff1cf"></ellipse>
            <ellipse cx="200" cy="145" rx="14" ry="10" fill="#1e1e1e"></ellipse>
            <path d="M200 154 C197 162 192 166 185 166" fill="none" stroke="#1e1e1e" stroke-width="4" stroke-linecap="round"></path>
            <path d="M200 154 C203 162 208 166 215 166" fill="none" stroke="#1e1e1e" stroke-width="4" stroke-linecap="round"></path>

            <path data-part="brow-left" d="M156 98 Q171 88 186 99" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>
            <path data-part="brow-right" d="M214 99 Q229 88 244 98" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>

            <g data-face="eye-left">
              <ellipse cx="171" cy="124" rx="16" ry="21" fill="white" stroke="#1e1e1e" stroke-width="4"></ellipse>
              <circle cx="174" cy="127" r="9" fill="#ffd21f" stroke="#1e1e1e" stroke-width="3"></circle>
              <circle cx="176" cy="128" r="5" fill="#1e1e1e"></circle>
              <circle cx="171" cy="121" r="3" fill="white"></circle>
            </g>
            <g data-face="eye-right">
              <ellipse cx="229" cy="124" rx="16" ry="21" fill="white" stroke="#1e1e1e" stroke-width="4"></ellipse>
              <circle cx="226" cy="127" r="9" fill="#ffd21f" stroke="#1e1e1e" stroke-width="3"></circle>
              <circle cx="224" cy="128" r="5" fill="#1e1e1e"></circle>
              <circle cx="229" cy="121" r="3" fill="white"></circle>
            </g>
            <g data-face="eyes-smile">
              <path d="M156 125 Q171 112 186 125" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>
              <path d="M214 125 Q229 112 244 125" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>
            </g>

            <path data-face="mouth-happy" d="M177 174 Q200 197 223 174" fill="none" stroke="#1e1e1e" stroke-width="6" stroke-linecap="round"></path>
            <path data-face="mouth-open" d="M178 171 Q200 208 222 171 Q200 188 178 171" fill="#ff6b6b" stroke="#1e1e1e" stroke-width="5"></path>
            <path data-face="mouth-small" d="M188 178 Q200 184 212 178" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>

            <circle cx="176" cy="72" r="6" fill="#1e1e1e"></circle>
            <circle cx="200" cy="67" r="5" fill="#1e1e1e"></circle>
            <circle cx="224" cy="72" r="6" fill="#1e1e1e"></circle>
            <circle cx="160" cy="88" r="5" fill="#1e1e1e"></circle>
            <circle cx="240" cy="88" r="5" fill="#1e1e1e"></circle>
            <path d="M180 92 Q200 78 220 92" fill="none" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round"></path>
          </g>
        </g>
      </svg>
    `;
  }

  function escapeAttr(value){
    return String(value || "").replace(/"/g, "&quot;");
  }

  function resolveTarget(target){
    if(!target) return null;
    if(typeof target === "string") return document.querySelector(target);
    return target;
  }

  function setState(instance, state){
    if(!instance?.host) return;
    const safeState = state || DEFAULT_STATE;
    instance.host.classList.remove(...instance.states);
    instance.host.classList.add("is-" + safeState);
    instance.state = safeState;
  }

  function scheduleReturn(instance, nextState, duration){
    if(instance._timer){
      clearTimeout(instance._timer);
      instance._timer = null;
    }

    if(!TRANSIENT_STATES.has(instance.state)) return;

    instance._timer = window.setTimeout(() => {
      setState(instance, nextState || DEFAULT_STATE);
      instance._timer = null;
    }, duration || 1200);
  }

  function createInstance(target, options = {}){
    injectStyles();

    const host = document.createElement("div");
    host.className = [
      "pilingo-mascot",
      options.compact ? "is-compact" : "",
      options.float !== false ? "is-float" : "",
      options.screen ? `is-${options.screen}` : ""
    ].filter(Boolean).join(" ");
    host.style.setProperty("--pilingo-size", `${Number(options.size) || 128}px`);
    host.dataset.renderer = "svg";
    host.dataset.outfit = options.outfit || "default";
    host.innerHTML = buildMarkup(options.label);

    const instance = {
      host,
      screen: options.screen || "generic",
      state: DEFAULT_STATE,
      states: [
        "is-idle", "is-blink", "is-smile", "is-wave", "is-walk", "is-run",
        "is-jump", "is-laugh", "is-think", "is-read", "is-write", "is-talk",
        "is-listen", "is-celebrate", "is-sad"
      ],
      renderer: "svg",
      play(state, playOptions = {}){
        setState(instance, state);
        scheduleReturn(instance, playOptions.returnTo || DEFAULT_STATE, playOptions.duration || stateDurations[state] || 1100);
      },
      setOutfit(outfit){
        host.dataset.outfit = outfit || "default";
      }
    };

    target.innerHTML = "";
    target.appendChild(host);
    INSTANCES.set(target, instance);
    setState(instance, options.state || DEFAULT_STATE);
    return instance;
  }

  const stateDurations = {
    blink: 350,
    smile: 900,
    wave: 1200,
    jump: 1000,
    laugh: 1300,
    think: 1400,
    read: 1500,
    write: 1500,
    talk: 1200,
    listen: 1200,
    celebrate: 1600,
    sad: 1200
  };

  const api = {
    mount(target, options){
      const resolved = resolveTarget(target);
      if(!resolved) return null;
      return INSTANCES.get(resolved) || createInstance(resolved, options);
    },
    play(state, target, options){
      const resolved = resolveTarget(target);
      const instance = resolved ? INSTANCES.get(resolved) : Array.from(INSTANCES.values())[0];
      if(!instance) return null;
      instance.play(state, options || {});
      return instance;
    },
    getInstance(target){
      const resolved = resolveTarget(target);
      return resolved ? INSTANCES.get(resolved) || null : null;
    },
    playForScreen(screen, state, options){
      const instance = Array.from(INSTANCES.values()).find((item) => item.screen === screen);
      if(instance) instance.play(state, options || {});
      return instance || null;
    },
    replaceRenderer(){
      return "svg";
    }
  };

  window.PilingoMascot = api;
  window.playPilingoAnimation = function(state, target, options){
    return api.play(state, target, options);
  };
})();
