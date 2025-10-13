// Virtual Pet v2 — animated, sleep/wake, local save

let hunger = 0;
let happiness = 100;
let isAsleep = false;
let animFrame = 0;
let lastUpdate = Date.now();

// Load from localStorage
if(localStorage.getItem('petData')) {
  const data = JSON.parse(localStorage.getItem('petData'));
  hunger = data.hunger || 0;
  happiness = data.happiness || 100;
  lastUpdate = data.lastUpdate || Date.now();
}

// Apply time decay since last visit
const elapsedMinutes = (Date.now() - lastUpdate) / 60000;
hunger = Math.min(100, hunger + Math.floor(elapsedMinutes / 3)); // +1 hunger every 3 minutes
happiness = Math.max(0, happiness - Math.floor(elapsedMinutes / 5)); // -1 happiness every 5 minutes
save();

const petImg = document.getElementById('pet');
const hungerDisplay = document.getElementById('hunger');
const happinessDisplay = document.getElementById('happiness');
const statusDisplay = document.getElementById('status');
const timeDisplay = document.getElementById('timeDisplay');

function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2,'0');
  timeDisplay.textContent = `${hours}:${minutes}`;
  
  // Sleep/wake based on time (10 PM - 7 AM)
  isAsleep = (hours >= 22 || hours < 7);
}

// Main loop: update stats + animation
setInterval(() => {
  updateTime();
  
  if (!isAsleep) {
    hunger = Math.min(100, hunger + 0.1);
    happiness = Math.max(0, happiness - 0.05);
  }
  
  save();
  updateDisplay();
}, 1000);

function updateDisplay() {
  hungerDisplay.textContent = Math.floor(hunger);
  happinessDisplay.textContent = Math.floor(happiness);
  
  let mood = "happy";
  if (isAsleep) mood = "sleepy";
  else if (happiness < 40 || hunger > 70) mood = "sad";
  
  statusDisplay.textContent = isAsleep ? "💤 Sleeping..." :
    hunger > 70 ? "🍴 Hungry!" :
    happiness < 40 ? "😢 Needs attention" : "😊 Happy!";
  
  animFrame = (animFrame + 1) % 2;
  petImg.src = `${mood}${animFrame+1}.png`;
  
  document.body.style.background = isAsleep
    ? "linear-gradient(#1e293b, #475569)"
    : "linear-gradient(#ffe8d6, #fcd5ce)";
}

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

function save() {
  localStorage.setItem('petData', JSON.stringify({
    hunger, happiness, lastUpdate: Date.now()
  }));
}
