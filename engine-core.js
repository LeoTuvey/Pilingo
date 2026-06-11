<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Owl-Lingo Path</title>

<style>

/* =========================
   🧠 BASE UI
========================= */

body{
  font-family: Arial;
  margin:0;
  padding:30px;
  text-align:center;
  background: linear-gradient(135deg,#e3f2fd,#fce4ec);
}

/* TITLE */
h1{
  margin-bottom:10px;
}

/* XP */
#xp{
  position:fixed;
  top:15px;
  right:15px;
  background:#58cc02;
  color:white;
  padding:10px 14px;
  border-radius:20px;
  font-weight:bold;
}

/* =========================
   PATH LAYOUT
========================= */

.path{
  max-width:420px;
  margin:auto;
  position:relative;
}

/* LINE */
.line{
  position:absolute;
  left:50%;
  top:0;
  width:4px;
  height:100%;
  background:#cfd8dc;
  transform:translateX(-50%);
}

/* OWL GUIDE */
#owlGuide{
  position:absolute;
  left:50%;
  transform:translate(-50%,0);
  font-size:34px;
  transition:0.6s ease;
  z-index:5;
}

/* =========================
   SKILL NODES
========================= */

.node{
  width:160px;
  margin:30px auto;
  padding:16px;
  border-radius:50%;
  background:white;
  box-shadow:0 4px 10px rgba(0,0,0,0.1);
  cursor:pointer;
  transition:0.25s;
  position:relative;
  z-index:2;
}

.node:hover{
  transform:scale(1.07);
}

/* STATES */
.locked{
  opacity:0.25;
  pointer-events:none;
}

.unlocked{
  border:3px solid #58cc02;
}

.completed{
  border:3px solid gold;
}

/* TEXT */
.icon{
  font-size:28px;
}

.small{
  font-size:12px;
  opacity:0.7;
}

/* =========================
   SKILL BAR
========================= */

.bar{
  height:6px;
  background:#eee;
  border-radius:10px;
  margin-top:8px;
  overflow:hidden;
}

.bar-fill{
  height:100%;
  width:0%;
  background:#58cc02;
  transition:0.4s ease;
}

/* LEVEL COLORS */
.level-0 .bar-fill{ background:#ddd; }
.level-1 .bar-fill{ background:#ffca28; }
.level-2 .bar-fill{ background:#ffb300; }
.level-3 .bar-fill{ background:#66bb6a; }
.level-4 .bar-fill{ background:#2e7d32; }

</style>
</head>

<body>

<h1>🦉 Your Learning Path</h1>

<div id="xp">XP: 0</div>

<div class="path">

<div class="line"></div>
<div id="owlGuide">🦉</div>

<div id="map"></div>

</div>

<script src="engine-core.js"></script>
<script src="vocab_a1.js"></script>

<script>

/* =========================
   DATA
========================= */

const skills = [
  { name:"Animals 🐶", id:"animals" },
  { name:"Actions 🏃", id:"verbs" },
  { name:"People 👤", id:"people" },
  { name:"Food 🍎", id:"food" },
  { name:"Objects 📦", id:"objects" },
  { name:"Places 🏙️", id:"places" },
  { name:"Adjectives 🎯", id:"adjectives" }
];

/* =========================
   STATE
========================= */

let xp = Engine.getXP();

document.getElementById("xp").innerText = "XP: " + xp;

/* =========================
   SKILL LEVEL BAR
========================= */

function getSkillLevel(i){
  return Engine.getSkillState(i);
}

function getBar(level){

  if(level === 0) return 0;
  if(level === 1) return 25;
  if(level === 2) return 50;
  if(level === 3) return 75;
  return 100;
}

/* =========================
   RENDER PATH
========================= */

function render(){

  let html = "";

  skills.forEach((s,i)=>{

    let level = getSkillLevel(i);
    let progress = getBar(level);

    let stateClass = level > 0 ? "unlocked" : "locked";

    html += `
      <div class="node ${stateClass} level-${level}" onclick="openSkill(${i})">

        <div class="icon">
          ${level === 4 ? "👑" : "🦉"}
        </div>

        <div>${s.name}</div>

        <div class="small">Level ${level}/4</div>

        <div class="bar">
          <div class="bar-fill" style="width:${progress}%"></div>
        </div>

      </div>
    `;
  });

  document.getElementById("map").innerHTML = html;

  setTimeout(placeOwl, 300);
}

/* =========================
   OWL FOLLOW PATH
========================= */

function placeOwl(){

  let owl = document.getElementById("owlGuide");
  let nodes = document.querySelectorAll(".node");

  if(nodes.length > 0){
    let first = nodes[0].getBoundingClientRect();
    let container = document.querySelector(".path").getBoundingClientRect();

    owl.style.top = (first.top - container.top + 10) + "px";
  }
}

/* =========================
   MOVE OWL
========================= */

function openSkill(i){

  let owl = document.getElementById("owlGuide");
  let nodes = document.querySelectorAll(".node");

  let node = nodes[i];
  let container = document.querySelector(".path").getBoundingClientRect();
  let rect = node.getBoundingClientRect();

  owl.style.top = (rect.top - container.top + 10) + "px";

  setTimeout(()=>{
    window.location.href = "lesson.html?s=" + i;
  },400);
}

/* =========================
   INIT
========================= */

render();

</script>

</body>
</html>
