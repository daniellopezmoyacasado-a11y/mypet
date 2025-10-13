let hunger = 0;
let happiness = 100;

// Load saved stats
if(localStorage.getItem('hunger')) hunger = parseInt(localStorage.getItem('hunger'));
if(localStorage.getItem('happiness')) happiness = parseInt(localStorage.getItem('happiness'));

updateDisplay();

// Timed decay
setInterval(() => {
  hunger = Math.min(100, hunger + 1);
  happiness = Math.max(0, happiness - 1);
  save();
  updateDisplay();
}, 30000); // every 30 sec (tweak for real time)

// Button actions
function feed() {
  hunger = Math.max(0, hunger - 10);
  happiness = Math.min(100, happiness + 2);
  save();
  updateDisplay();
}

function play() {
  happiness = Math.min(100, happiness + 10);
  hunger = Math.min(100, hunger + 5);
  save();
  updateDisplay();
}

// Save state to browser
function save() {
  localStorage.setItem('hunger', hunger);
  localStorage.setItem('happiness', happiness);
}

function updateDisplay() {
  document.getElementById('hunger').textContent = hunger;
  document.getElementById('happiness').textContent = happiness;
  
  const img = document.getElementById('pet');
  if (happiness > 70) img.src = "happy.png";
  else if (happiness > 30) img.src = "neutral.png";
  else img.src = "sad.png";
}
