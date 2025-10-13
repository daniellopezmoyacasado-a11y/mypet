/* 
  Virtual Pet v3 — Multi-pet, animation, sleep cycle, and local save
  Works with folder structure:
  pets/{cat|dog|dragon}/happy1.png, happy2.png, sad1.png, sad2.png, sleepy1.png, sleepy2.png
*/

let petType = localStorage.getItem('petType');
let hunger = 0;
let happiness = 100;
let isAsleep = false;
let animFrame = 0;
let lastUpdate = Date.now();

// DOM elements
const chooseScreen = document.getElementById('choose-screen');
const petContainer = document.getElementById('pet-container');
const petImg = document.getElementById('pet');
const hungerDisplay = document.getElementById('hunger');
const happinessDisplay = document.getElementById('happiness');
const statusDisplay = document.getElementById('status');
const timeDisplay = document.getElementById('timeDisplay');

// Start logic based on whether pet is already chosen
window.addEventListener('DOMContentLoaded', () => {
if (!petType) {
  chooseScreen.classList.remove('hidden');
  petContainer.classList.add('hidden');
} else {
  startGame();
}
});


// ----------------------------
//  PET SELECTION
// ----------------------------
function choosePet(type) {
  petType = type;
  localStorage.setItem('petType', type);
  chooseScreen.classList.add('hidden');
  petContainer.classList.remove('hidden');
  startGame();
}

// ----------------------------
//  MAIN GAME START
// ----------------------------
function startGame() {
  // localStorage.clear(); // uncomment to reset all data

  // Load saved data
  if (localStorage.getItem('petData')) {
    const data = JSON.parse(localStorage.getItem('petData'));
    hunger = data.hunger || 0;
    happiness = data.happiness || 100;
    lastUpdate = data.lastUpdate || Date.now();
  }

  // Apply decay based on time elapsed since last visit
  const elapsedMinutes = (Date.now() - lastUpdate) / 60000;
  hunger = Math.min(100, hunger + Math.floor(elapsedMinutes / 3)); // +1 hunger every 3 mins
  happiness = Math.max(0, happiness - Math.floor(elapsedMinutes / 5)); // -1 happiness every 5 mins
  save();

  updateDisplay();
  updateTime();

  // Run update loop
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
//  GAME LOGIC
// ----------------------------
function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeDisplay.textContent = `${hours}:${minutes}`;

  // Sleep from 22:00 to 7:00
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
  localStorage.setItem(
    'petData',
    JSON.stringify({
      hunger,
      happiness,
      lastUpdate: Date.now(),
    })
  );
}
