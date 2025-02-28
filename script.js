import { updateGround, setupGround } from "./ground.js";
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js";
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js";

const WORLD_WIDTH = window.innerWidth / 10;
const WORLD_HEIGHT = window.innerHeight / 10;
const SPEED_SCALE_INCREASE = 0.000005;

const worldElem = document.querySelector("[data-world]");
const scoreElem = document.querySelector("[data-score]");
const highScoreElem = document.querySelector("[data-high-score]");
const startScreenElem = document.querySelector("[data-start-screen]");
const gameOverElem = document.querySelector("[data-game-over]");
const finalScoreElem = document.querySelector("[data-final-score]");
const jumpSound = document.getElementById('jump-sound');
const gameoverSound = document.getElementById('gameover-sound');

let lastTime;
let speedScale;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let gameRunning = false;

setPixelToWorldScale();
window.addEventListener("resize", setPixelToWorldScale);

function update(time) {
  if (!gameRunning) return;

  if (lastTime == null) {
    lastTime = time;
    window.requestAnimationFrame(update);
    return;
  }
  const delta = time - lastTime;

  updateGround(delta, speedScale);
  updateDino(delta, speedScale);
  updateCactus(delta, speedScale);
  updateSpeedScale(delta);
  updateScore(delta);

  if (checkLose()) return handleLose();

  lastTime = time;
  window.requestAnimationFrame(update);
}

function checkLose() {
  const dinoRect = getDinoRect();
  return getCactusRects().some(rect => isCollision(rect, dinoRect));
}


function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

function handleLose() {
  gameRunning = false;
  setDinoLose();
  gameOverElem.classList.remove("hide");
  finalScoreElem.textContent = `High Score: ${Math.floor(highScore)}`;
  gameOver();

  // Reset game state 
  document.removeEventListener('click', handleStart);
  document.removeEventListener('keydown', handleStart); 
  document.addEventListener('click', handleStart);
  document.addEventListener('keydown', handleStart); 
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE;
}

function updateScore(delta) {
  score += delta * 0.01;
  scoreElem.textContent = Math.floor(score);
  checkHighScore();
}

function checkHighScore() {
  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem('highScore', highScore);
    highScoreElem.textContent = `High Score: ${highScore}`;
  }
}

function handleStart() {
  if (gameRunning) return; 

  gameRunning = true;
  lastTime = null;
  speedScale = 1;
  score = 0;

  setupGround();
  setupDino();
  setupCactus();
  startScreenElem.classList.add("hide");
  gameOverElem.classList.add("hide");
  highScoreElem.textContent = `H: ${highScore}`;

  window.requestAnimationFrame(update); 
}

function handleJump() {
  if (!gameRunning) return;
  jumpSound.play();
}

function setPixelToWorldScale() {
  let worldToPixelScale;
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH;
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
  }
  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
}

function jump() {
  jumpSound.play();
}

function gameOver() {
  gameoverSound.play();
}

document.addEventListener('click', () => {
  if (!gameRunning) {
    handleStart(); 
  } else {
    handleJump(); 
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === ' ' && gameRunning) { 
    handleJump(); 
  }
});

function updateDateTime() {
  const dateElement = document.getElementById('date');
  const timeElement = document.getElementById('time');
  const now = new Date();

  const date = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  dateElement.textContent = date;
  timeElement.textContent = time;
}

setInterval(updateDateTime, 1000);
updateDateTime();
