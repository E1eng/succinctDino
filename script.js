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

// Update permainan setiap frame
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

// Cek apakah permainan kalah
function checkLose() {
  const dinoRect = getDinoRect();
  return getCactusRects().some(rect => isCollision(rect, dinoRect));
}

// Fungsi untuk memeriksa tabrakan
function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

// Menangani keadaan kalah
function handleLose() {
  gameRunning = false;
  setDinoLose();
  gameOverElem.classList.remove("hide");
  finalScoreElem.textContent = `High Score: ${Math.floor(highScore)}`;
  gameOver();

  // Reset game state dan pasang event listener untuk memulai ulang game
  document.removeEventListener('click', handleStart); // Menghapus event listener lama
  document.removeEventListener('keydown', handleStart); // Menghapus event listener lama
  document.addEventListener('click', handleStart); // Menambahkan listener baru untuk memulai ulang game
  document.addEventListener('keydown', handleStart); // Menambahkan listener baru untuk memulai ulang game
}

// Mengatur kecepatan permainan
function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE;
}

// Memperbarui skor permainan
function updateScore(delta) {
  score += delta * 0.01;
  scoreElem.textContent = Math.floor(score);
  checkHighScore();
}

// Memeriksa dan memperbarui highscore
function checkHighScore() {
  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem('highScore', highScore);
    highScoreElem.textContent = `High Score: ${highScore}`;
  }
}

// Menangani mulai permainan
function handleStart() {
  if (gameRunning) return; // Jika permainan sudah berjalan, tidak perlu apa-apa

  gameRunning = true;
  lastTime = null; // Reset lastTime untuk memulai permainan
  speedScale = 1;
  score = 0;

  setupGround();
  setupDino();
  setupCactus();
  startScreenElem.classList.add("hide");
  gameOverElem.classList.add("hide");
  highScoreElem.textContent = `H: ${highScore}`;

  window.requestAnimationFrame(update); // Pastikan frame animasi dimulai
}

// Menangani lompat
function handleJump() {
  if (!gameRunning) return;
  jumpSound.play();
}

// Mengatur ukuran dunia permainan berdasarkan layar
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

// Mengatur suara lompat
function jump() {
  jumpSound.play();
}

// Mengatur suara game over
function gameOver() {
  gameoverSound.play();
}

// Event listener untuk memulai permainan (klik atau spasi)
document.addEventListener('click', () => {
  if (!gameRunning) {
    handleStart(); // Mulai permainan jika belum dimulai
  } else {
    handleJump(); // Jika permainan sudah dimulai, lompat
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === ' ' && gameRunning) { // Hanya lompat jika permainan sedang berjalan
    handleJump(); // Memicu lompat jika permainan berjalan
  }
});

// Update waktu dan tanggal di layar
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
