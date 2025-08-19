const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverBanner = document.getElementById("gameOverBanner");

let frames = 0;
let score = 0;
let gameStarted = false;
let gameOver = false;

// Load assets
const coinImg = new Image();
coinImg.src = "xioncoin.png";

const flapSound = new Audio("flap.wav");
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Bird (coin)
let coin = {
  x: 50,
  y: 150,
  width: 30,
  height: 30,
  gravity: 0.25,
  lift: -4.6,
  velocity: 0,
  draw() {
    ctx.drawImage(coinImg, this.x, this.y, this.width, this.height);
  },
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    if (this.y + this.height >= canvas.height) {
      endGame();
    }
  },
  flap() {
    this.velocity = this.lift;
    flapSound.play();
  }
};

// Pipes
let pipes = [];
function spawnPipe() {
  let gap = 120;
  let topHeight = Math.random() * (canvas.height - gap - 100) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    width: 50
  });
}

// Reset
function resetGame() {
  frames = 0;
  score = 0;
  coin.y = 150;
  coin.velocity = 0;
  pipes = [];
  gameOverBanner.style.display = "none";
}

// Game loop
function gameLoop() {
  if (!gameStarted || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background (sky + clouds + sun)
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(80, 80, 30, 0, Math.PI * 2); // Sun
  ctx.fill();

  ctx.beginPath(); // Cloud
  ctx.arc(200, 100, 20, 0, Math.PI * 2);
  ctx.arc(220, 100, 25, 0, Math.PI * 2);
  ctx.arc(240, 100, 20, 0, Math.PI * 2);
  ctx.fill();

  // Pipes
  if (frames % 90 === 0) spawnPipe();
  pipes.forEach((p, i) => {
    p.x -= 2;
    ctx.fillStyle = "#228B22";
    ctx.fillRect(p.x, 0, p.width, p.top);
    ctx.fillRect(p.x, p.bottom, p.width, canvas.height - p.bottom);

    // Collision
    if (
      coin.x < p.x + p.width &&
      coin.x + coin.width > p.x &&
      (coin.y < p.top || coin.y + coin.height > p.bottom)
    ) {
      endGame();
    }

    // Passed pipe
    if (p.x + p.width === coin.x) {
      score++;
      pointSound.play();
    }

    // Remove old pipes
    if (p.x + p.width < 0) pipes.splice(i, 1);
  });

  // Bird
  coin.update();
  coin.draw();

  // Score
  ctx.fillStyle = "#333";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  frames++;
  requestAnimationFrame(gameLoop);
}

// Game Over
function endGame() {
  if (!gameOver) {
    hitSound.play();
    dieSound.play();
  }
  gameOver = true;
  gameOverBanner.style.display = "block";
  restartBtn.style.display = "block";
}

// Controls
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (gameStarted && !gameOver) coin.flap();
  }
});
canvas.addEventListener("click", () => {
  if (gameStarted && !gameOver) coin.flap();
});

// Start button
startBtn.addEventListener("click", () => {
  swooshSound.play();
  gameStarted = true;
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
  resetGame();
  gameLoop();
});

// Restart button
restartBtn.addEventListener("click", () => {
  swooshSound.play();
  gameOver = false;
  restartBtn.style.display = "none";
  resetGame();
  gameLoop();
});
