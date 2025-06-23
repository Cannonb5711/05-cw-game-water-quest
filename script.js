// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timer = 30;              // Countdown timer in seconds
let timerInterval;           // Holds the interval for the timer
let difficulty = 'Medium'; // Default difficulty
let spawnSpeeds = {
  'Easy': 1200,
  'Medium': 900,
  'Hard': 600
};

// Preload water sound
const waterSound = new Audio('water.mp3');

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Achievements milestones
const milestones = [5, 10, 15];
const milestoneMessages = {
  5: "You've collected enough water for a child for a day!",
  10: "You've collected enough water for a family for a day!",
  15: "You've collected enough water for a classroom for a day!"
};

function showMilestone(milestone) {
  const achievementDiv = document.getElementById('achievements');
  const msg = milestoneMessages[milestone];
  if (msg) {
    achievementDiv.innerHTML = `<div style='font-size:1.2rem;color:#2E9DF7;font-weight:bold;margin:10px 0;'>🏅 ${msg}</div>`;
    setTimeout(() => { achievementDiv.innerHTML = ''; }, 2000);
  }
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive || paused) return; // Stop if the game is not active or paused
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  // Add click event to the water can
  const can = randomCell.querySelector('.water-can');
  if (can) {
    can.addEventListener('click', function(e) {
      if (!gameActive || paused) return;
      currentCans++;
      document.getElementById('current-cans').textContent = currentCans;
      // Play water sound reliably
      const clickSound = new Audio('water.mp3');
      clickSound.currentTime = 0;
      clickSound.play();
      // Add a can icon to the can-visuals div
      const canVisuals = document.getElementById('can-visuals');
      const canIcon = document.createElement('img');
      canIcon.src = 'img/water-can.png';
      canIcon.alt = 'Collected Can';
      canIcon.style.width = '32px';
      canIcon.style.height = '32px';
      canIcon.style.margin = '2px';
      canVisuals.appendChild(canIcon);
      // Show milestone if reached
      if (milestones.includes(currentCans)) {
        showMilestone(currentCans);
      }
      // Visual feedback: pop and +1
      can.classList.add('pop-animate');
      const plusOne = document.createElement('div');
      plusOne.textContent = '+1';
      plusOne.style.position = 'absolute';
      plusOne.style.left = '50%';
      plusOne.style.top = '10%';
      plusOne.style.transform = 'translate(-50%, 0)';
      plusOne.style.fontWeight = 'bold';
      plusOne.style.fontSize = '1.3rem';
      plusOne.style.color = '#2E9DF7';
      plusOne.style.pointerEvents = 'none';
      plusOne.style.animation = 'floatUp 0.7s ease-out forwards';
      can.parentElement.appendChild(plusOne);
      setTimeout(() => plusOne.remove(), 700);
      setTimeout(() => can.classList.remove('pop-animate'), 500);
      // Optionally, remove the can after click
      can.parentElement.remove();
    });
  }
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  paused = false;
  currentCans = 0;
  timer = 30;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timer;
  document.getElementById('can-visuals').innerHTML = '';
  document.getElementById('achievements').innerHTML = '';
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, spawnSpeeds[difficulty]); // Spawn water cans based on difficulty
  timerInterval = setInterval(updateTimer, 1000); // Start countdown timer
  // Disable difficulty button
  difficultyBtn.disabled = true;
  // Show pause button
  document.getElementById('pause-btn').style.display = '';
  document.getElementById('pause-btn').textContent = 'Pause';
}

function updateTimer() {
  if (!gameActive || paused) return;
  timer--;
  document.getElementById('timer').textContent = timer;
  if (timer <= 0) {
    endGame();
  }
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop timer
  showEndMessage();
  // Enable difficulty button
  difficultyBtn.disabled = false;
  // Hide pause button
  document.getElementById('pause-btn').style.display = 'none';
}

function showEndMessage() {
  const achievementDiv = document.getElementById('achievements');
  const gallons = (currentCans * 5.3).toFixed(1);
  let impact = '';
  if (currentCans >= 20) {
    impact = '<br><span style="color:#4FCB53;font-size:1.1rem;">20 cans = clean water for 1 person for a week!</span>';
    achievementDiv.innerHTML = `<div style=\"font-size:2.5rem;font-weight:bold;color:#4FCB53;margin:20px 0;\">You Win!</div><div style=\"font-size:1.3rem;\">You collected ${currentCans} jerry can${currentCans === 1 ? '' : 's'} of water, that's ${gallons} gallons of total water collected!</div>${impact}`;
    startWaterRain();
  } else {
    if (currentCans >= 10) {
      impact = '<br><span style="color:#F5402C;font-size:1.1rem;">10 cans = clean water for a family for a day!</span>';
    } else if (currentCans >= 5) {
      impact = '<br><span style="color:#F5402C;font-size:1.1rem;">5 cans = clean water for a child for a day!</span>';
    }
    achievementDiv.innerHTML = `<div style=\"font-size:2.5rem;font-weight:bold;color:#F5402C;margin:20px 0;\">You Lose!</div><div style=\"font-size:1.3rem;\">You collected ${currentCans} jerry can${currentCans === 1 ? '' : 's'} of water, that's ${gallons} gallons of total water collected!</div>${impact}`;
    alert('You Lose!');
  }
}

function startWaterRain() {
  // Drop 30 water drops at random positions
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      drop.style.left = Math.random() * 100 + 'vw';
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 1300);
    }, i * 80);
  }
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Difficulty button logic
const difficultyBtn = document.getElementById('difficulty-btn');
const difficulties = ['Easy', 'Medium', 'Hard'];
difficultyBtn.addEventListener('click', function() {
  let idx = difficulties.indexOf(difficulty);
  difficulty = difficulties[(idx + 1) % difficulties.length];
  difficultyBtn.textContent = `Difficulty: ${difficulty}`;
  if (gameActive) {
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnWaterCan, spawnSpeeds[difficulty]);
  }
});

// Pause/Resume button logic
const pauseBtn = document.getElementById('pause-btn');
pauseBtn.addEventListener('click', function() {
  if (!gameActive) return;
  paused = !paused;
  if (paused) {
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    pauseBtn.textContent = 'Resume';
  } else {
    spawnInterval = setInterval(spawnWaterCan, spawnSpeeds[difficulty]);
    timerInterval = setInterval(updateTimer, 1000);
    pauseBtn.textContent = 'Pause';
  }
});

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUp {
    0% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -40px); }
  }
  .pop-animate {
    animation: pop 0.5s ease;
  }
  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
