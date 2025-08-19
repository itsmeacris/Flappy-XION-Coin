// ==================== GAME VARIABLES ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bird = { x: 50, y: 150, width: 30, height: 30, dy: 0 };
let gravity = 0.5;
let jump = -8;
let pipes = [];
let pipeWidth = 50;
let pipeGap = 120;
let frame = 0;
let score = 0;
let gameInterval = null;
let gameStarted = false;
let backgroundMode = "day"; // can toggle day/night

// ==================== SOUNDS ====================
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");
const flapSound = new Audio("flap.wav");

// ==================== IMAGE (XION Coin) ====================
const birdImg = new Image();
birdImg.src = "xioncoin.png";

// ==================== START / RESTART ====================
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

function startGame() {
  swooshSound.play();
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("howToPlay").style.display = "none";
  resetGame();
  gameInterval = setInterval(update, 20);
}

function restartGame() {
  dieSound.play();
  document.getElementById("restartBtn").style.display = "none";
  resetGame();
  gameInterval = setInterval(update, 20);
}

function resetGame() {
  bird.y = 150;
  bird.dy = 0;
  pipes = [];
  frame = 0;
  score = 0;
  gameStarted = true;
}

// ==================== INPUT (Flap) ====================
function flap() {
  if (!gameStarted) return;
  bird.dy = jump;
  flapSound.currentTime = 0;
  flapSound.play();
}
document.addEventListener("keydown", e => { if (e.code === "Space") flap(); });
canvas.addEventListener("click", flap);

// ==================== DRAW BACKGROUND ====================
function drawBackground() {
  if (backgroundMode === "day") {
    // sky
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#87CEEB"); // light blue sky
    grad.addColorStop(1, "#E0F7FA");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // sun
    ctx.beginPath();
    ctx.arc(50, 50, 25, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();

  } else {
    // night sky
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0D1B2A");
    grad.addColorStop(1, "#1B263B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // moon
    ctx.beginPath();
    ctx.arc(50, 50, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#F5F3CE";
    ctx.fill();
  }

  // clouds
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(120, 80, 20, 0, Math.PI * 2);
  ctx.arc(140, 80, 25, 0, Math.PI * 2);
  ctx.arc(160, 80, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(300, 50, 15, 0, Math.PI * 2);
  ctx.arc(320, 50, 20, 0, Math.PI * 2);
  ctx.arc(340, 50, 15, 0, Math.PI * 2);
  ctx.fill();
}

// ==================== DRAW PIPES ====================
function drawPipes() {
  ctx.fillStyle = "#228B22"; // pipe body

  pipes.forEach(p => {
    // top pipe
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    // top pipe head
    ctx.fillStyle = "#006400";
    ctx.fillRect(p.x - 5, p.top - 20, pipeWidth + 10, 20);

    ctx.fillStyle = "#228B22"; // reset for bottom
    // bottom pipe
    ctx.fillRect(p.x, p.top + pipeGap, pipeWidth, canvas.height - p.top - pipeGap);
    // bottom pipe head
    ctx.fillStyle = "#006400";
    ctx.fillRect(p.x - 5, p.top + pipeGap, pipeWidth + 10, 20);

    ctx.fillStyle = "#228B22"; // restore
  });
}

// ==================== DRAW BIRD ====================
function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// ==================== GAME UPDATE ====================
function update() {
  drawBackground();

  // pipes logic
  if (frame % 90 === 0) {
    let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 60)) + 20;
    pipes.push({ x: canvas.width, top: topHeight });
  }
  frame++;

  pipes.forEach(p => { p.x -= 2; });

  // collision detection
  pipes.forEach(p => {
    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.width > p.x &&
      (bird.y < p.top || bird.y + bird.height > p.top + pipeGap)
    ) {
      gameOver();
    }
  });

  // floor / ceiling
  if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
    gameOver();
  }

  // score
  pipes.forEach(p => {
    if (p.x + pipeWidth === bird.x) {
      score++;
      pointSound.play();
    }
  });

  // move bird
  bird.dy += gravity;
  bird.y += bird.dy;

  // draw pipes & bird
  drawPipes();
  drawBird();

  // score text
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// ==================== GAME OVER ====================
function gameOver() {
  clearInterval(gameInterval);
  hitSound.play();
  setTimeout(() => dieSound.play(), 200);

  ctx.fillStyle = "red";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);

  document.getElementById("restartBtn").style.display = "block";
}
