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
let petName = localStorage.getItem('petName');
let lastUpdate = Date.now();
let gameStarted = false;
let birthTime = Number(localStorage.getItem("birthTime")) || null;
let age = Number(localStorage.getItem("age")) || 0;
let firstLoad = true;

let poops = [];
let poopTimer = 0;
const poopInterval = 60000;

// DOM elements
const chooseScreen = document.getElementById('choose-screen');
const petContainer = document.getElementById('pet-container');
const petImg = document.getElementById('pet');
const hungerDisplay = document.getElementById('hunger');
const happinessDisplay = document.getElementById('happiness');
const statusDisplay = document.getElementById('status');
const agesDisplay = document.getElementById('age');
const timeDisplay = document.getElementById('timeDisplay');

// Start logic based on whether pet is already chosen
window.addEventListener('DOMContentLoaded', () => {
   
  if (localStorage.length > 0) {
    firstLoad =  false;
    console.log("Not first load");
  } else {
    firstLoad =  true;
    console.log("First load");
  }

  if (firstLoad) {
      chooseScreen.classList.remove('hidden');
      petContainer.classList.add('hidden');
  } else {
      chooseScreen.classList.add('hidden');
      petContainer.classList.remove('hidden');
    localStorage.setItem('loaded', 'true');
    firstLoad = false;
    startGame();
  }
 

});


// ----------------------------
//  PET SELECTION
// ----------------------------
function choosePet(name) {
  console.log("Pet chosen:", name);
  types = ["cat", "dog", "dragon", "alien", "dove"];
  petName = name || "My Pet";
  petType = types[Math.floor(Math.random() * types.length)];
  localStorage.setItem('petType', petType);
  localStorage.setItem('petName', name);
  chooseScreen.classList.add('hidden');
  petContainer.classList.remove('hidden');
  if (!gameStarted) startGame();
}

// ----------------------------
//  MAIN GAME START
// ----------------------------
function startGame() {
  if (gameStarted) return;
 
      
  gameStarted = true;
  // localStorage.clear(); // uncomment to reset all data
  console.log("Game Start")

  if (petName) {
    document.getElementById('pet-name').textContent = petName;
  }

  // Load saved data
  if (localStorage.getItem('petData')) {
    const data = JSON.parse(localStorage.getItem('petData'));
    hunger = data.hunger || 0;
    happiness = data.happiness || 100;
    lastUpdate = data.lastUpdate || Date.now();
    // load persistent birthTime and age if present
    if (data.birthTime) birthTime = data.birthTime;
    else birthTime = birthTime || Number(localStorage.getItem('birthTime')) || null;
    age = data.age || age || 0;
  } else {
    // still attempt to read any standalone storage keys
    birthTime = birthTime || Number(localStorage.getItem('birthTime')) || null;
    age = age || Number(localStorage.getItem('age')) || 0;
  }
  // If birthTime still missing, set it now (first run / first choose)
  if (!birthTime) {
    birthTime = Date.now();
    localStorage.setItem("birthTime", birthTime);
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
    //console.log("internal loop")
    updateTime();
    if (!isAsleep) {
      hunger = Math.min(100, hunger + 0.05);
      happiness = Math.max(0, happiness - 0.03);
    }

  // Poop generation
    poopTimer += 1000;
    console.log("trying to poop");
    if (poopTimer >= poopInterval) {
      if(Math.random() < 0.34) { // 1/3 chance to poop
      console.log("pooping");
      poopTimer = 0;
      spawnPoop();
      }
    }
    // Update age (in days) based on birthTime
    if (birthTime) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const totalDays = Math.floor((Date.now() - birthTime) / msPerDay);
      if (totalDays > age) {
        age = totalDays;
        // persist age key as well (kept both in petData and standalone for compatibility)
        localStorage.setItem('age', String(age));
      }
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
  else if (happiness < 60 || hunger > 50) mood = "neutral";

  statusDisplay.textContent = isAsleep
    ? "Sleeping..."
    : hunger > 70
    ? "Hungry!"
    : hunger > 50 || happiness < 5
    ? "Needs attention"
    : happiness < 60
    ? "Needs attention"
    : "Happy!";

  agesDisplay.textContent = `Age: ${age} day${age !== 1 ? 's' : ''}`;
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
  if (hunger <= 0) return; 
  else {// no overfeeding, TODO play no_eat_anim
    playPetAnimation(petType, "eat_anim", 5, 400, () => {
      hunger = Math.max(0, hunger - 15);
      happiness = Math.min(100, happiness + 5);
      save();
      updateDisplay();
    });
  }
}

function play() {
  if (isAsleep) return;
  happiness = Math.min(100, happiness + 1);
  hunger = Math.min(100, hunger + 5);
  startMiniGame();
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
      birthTime,
      age,
    })
  );
}

// ----------------------------
// MINI GAME — Jump to avoid obstacles
// ----------------------------

const gameScreen = document.getElementById('game-screen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameActive = false;
let player, obstacle, gravity, jumpPower, score, speed;
let petSprite = new Image();

// Start mini game
function startMiniGame() {
  if (isAsleep) return;

   petSprite.src = petImg.src;

  petContainer.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initGame();

  document.addEventListener('keydown', handleJump);
  canvas.addEventListener('touchstart', handleJump);
}

// Initialize game state
function initGame() {
  gameActive = true;
  player = { x: 40, y: 120, size: 20, vy: 0, onGround: true };
  obstacle = { x: 300, y: 130, width: 10, height: 20 };
  gravity = 0.6;
  jumpPower = -10;
  speed = 3;
  score = 0;
  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
  if (!gameActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Move obstacle
  obstacle.x -= speed;
  if (obstacle.x < -10) {
    obstacle.x = 300 + Math.random() * 100;
    score++;
     if (score % 3 === 0) {
      speed += 0.9 * Math.random(); // obstacle moves faster
      if (speed > 10) speed = 10; // max cap
    }
  }

  // Apply gravity
  player.vy += gravity;
  player.y += player.vy;

  // Floor collision
  if (player.y >= 120) {
    player.y = 120;
    player.vy = 0;
    player.onGround = true;
  }

  // Collision detection
  if (
    obstacle.x < player.x + player.size &&
    obstacle.x + obstacle.width > player.x &&
    player.y + player.size > obstacle.y
  ) {
    endMiniGame(false);
    return;
  }

  // Draw player and obstacle
  ctx.fillStyle = "black";// dark gray or any color you like
  //ctx.fillRect(player.x, player.y, 4, 4);
  //ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.drawImage(petSprite, player.x, player.y - 5, player.size + 10, player.size + 10);
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  // Draw score
  ctx.font = "12px monospace";
  ctx.fillText(`Score: ${score}`, 10, 20);

  requestAnimationFrame(gameLoop);
}

// Jump
function handleJump(e) {
  if (!gameActive) return;
  if (player.onGround) {
    player.vy = jumpPower;
    player.onGround = false;
  }
}

// Stop game manually
function stopMiniGame() {
  if (!gameActive) return;
  endMiniGame(true, true); // force stop
}

// End game
function endMiniGame(won = true, manualStop = false) {
  gameActive = false;
  document.removeEventListener('keydown', handleJump);
  canvas.removeEventListener('touchstart', handleJump);

  let bonus = 0;
  if (!manualStop) {
    bonus = Math.min(20, score * 2);
  }

  happiness = Math.min(100, happiness + bonus);
  hunger = Math.min(100, hunger + (bonus));
  save();

  setTimeout(() => {
    gameScreen.classList.add('hidden');
    petContainer.classList.remove('hidden');
    updateDisplay();
  }, 500);
}

// ----------------------------
// GENERIC ANIMATION PLAYER
// ----------------------------

const animBox = document.getElementById('animation-box');
const animatFrame = document.getElementById('anim-frame');

/**
 * Play a short frame-based animation overlay
 * @param {string} petType - e.g. "cat", "dog", "dragon"
 * @param {string} animatName - e.g. "eat_anim"
 * @param {number} frameCount - number of frames (e.g. 5)
 * @param {number} frameDelay - ms between frames (e.g. 200)
 * @param {function} callback - what to run after the animation
 */
function playPetAnimation(petType, animatName, frameCount, frameDelay, callback) {
  animBox.classList.remove('hidden');
  let frame = 1;

  function nextFrame() {
    animatFrame.src = `pets/${petType}/${animatName}${frame}.png`;
    frame++;
    if (frame <= frameCount) {
      setTimeout(nextFrame, frameDelay);
    } else {
      // End animation
      setTimeout(() => {
        animBox.classList.add('hidden');
        if (callback) callback();
      }, frameDelay);
    }
  }

  nextFrame();
}

function spawnPoop() {
  const poopContainer = document.getElementById("poop-container");
  const poop = document.createElement("img");
  poop.src = "assets/poop.png"; // adjust path
  poop.classList.add("poop");
  
  // random position inside container
  //poop.style.left = Math.floor(Math.random() * 80 + 20) + "px";
  //poop.style.top = Math.floor(Math.random() * 40 + 10) + "px";


  const rect = poopContainer.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const offsetX = (Math.random() - 0.5) * 60;
  const offsetY = (Math.random() - 0.5) * 100;

  // Apply position
  poop.style.left = `${centerX + offsetX - 10}px`; // -10 to center the image
  poop.style.top = `${centerY + offsetY - 10}px`;

  poop.onclick = () => cleanPoop(poop);

  poopContainer.appendChild(poop);
  poops.push(poop);

  // affect stats
  //happiness = Math.max(0, happiness - 5);
  updateDisplay();
  save();
}

function cleanPoop(poop) {
  poop.remove();
  poops = poops.filter(p => p !== poop);
  happiness = Math.min(100, happiness + 10);
/* //TODO clean animation
  playPetAnimation(petType, "clean_anim", 4, 200, () => {
    save();
    updateDisplay();
  });
  */
}
