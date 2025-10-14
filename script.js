/* 
  Virtual Pet v4 — Random pet, animation, sleep cycle, and local save
  Folder structure:
  pets/{cat|dog|dragon}/happy1.png, happy2.png, sad1.png, sad2.png, sleepy1.png, sleepy2.png
*/

let petType = localStorage.getItem('petType');
let hunger = 0;
let happiness = 100;
let isAsleep = false;
let animFrame = 0;
let lastUpdate = Date.now();

// If no pet saved, randomly pick one and save
if (!petType) {
  const pets = ['cat', 'dog', 'dragon'];
  petType = pets[Math.floor(Math.random() * pets.length)];
  localStorage.setItem('petType', petType);
  console.log(`🎲 Random pet chosen: ${petType}`);
}

// DOM references
const petContainer = document.getElementById('pet-container');
const petImg = document.getElementById('pet');
const hungerDisplay = document.getElementById('hunger');
const happinessDisplay = document.getElementById('happiness');
const statusDisplay = document.getElementById('status');
const timeDisplay = document.getElementById('timeDisplay');

// ----------------------------
//  GAME INITIALIZATION
// ----------------------------
function startGame() {
  // Load stats
  if (localStorage.getItem('petData')) {
    const data = JSON.parse(localStorage.getItem('petData'));
    hunger = data.hunger || 0;
    happiness = data.happiness || 100;
    lastUpdate = data.lastUpdate || Date.now();
  }

  // Apply decay since last visit
  const elapsedMinutes = (Date.now() - lastUpdate) / 60000;
  hunger = Math.min(100, hunger + Math.floor(elapsedMinutes / 3));
  happiness = Math.max(0, happiness - Math.floor(elapsedMinutes / 5));
  save();

  updateDisplay();
  updateTime();

  // Main loop
  setInterval(() => {
    updateTime();
    if (!isAsleep) {
      hunger = Math.min(100, hunger + 0.05);
      happiness = Math.max(0, happiness - 0.03);
    }
    save();
    updateDisplay();
  }, 1000);
}

// ----------------------------
//  MAIN LOGIC
// ----------------------------
function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeDisplay.textContent = `${hours}:${minutes}`;
  isAsleep = (hours >= 22 || hours < 7);
}

function updateDisplay() {
  hungerDisplay.textContent = Math.floor(hunger);
  happinessDisplay.textContent = Math.floor(happiness);

  let mood = "happy";
  if (isAsleep) mood = "sleepy";
  else if (happiness < 40 || hunger > 70) mood = "sad";

  statusDisplay.textContent = isAsleep
    ? "💤 Sleeping..."
    : hunger > 70
    ? "🍴 Hungry!"
    : happiness < 40
    ? "😢 Needs attention"
    : "😊 Happy!";

  animFrame = (animFrame + 1) % 2;
  petImg.src = `pets/${petType}/${mood}${animFrame + 1}.png`;

  document.body.style.background = isAsleep
    ? "linear-gradient(#1e293b, #475569)"
    : "linear-gradient(#ffe8d6, #fcd5ce)";
}

// ----------------------------
//  BUTTON ACTIONS
// ----------------------------
function feed() {
  if (isAsleep) return;
  hunger = Math.max(0, hunger - 15);
  happiness = Math.min(100, happiness + 5);
  save();
  updateDisplay();
}

function play() {
  if (isAsleep) return;
  happiness = Math.min(100, happiness + 10);
  hunger = Math.min(100, hunger + 5);
  save();
  updateDisplay();
}

// ----------------------------
//  SAVE FUNCTION
// ----------------------------
function save() {
  localStorage.setItem('petData', JSON.stringify({
    hunger,
    happiness,
    lastUpdate: Date.now(),
  }));
}

// ----------------------------
//  START GAME
// ----------------------------
startGame();
