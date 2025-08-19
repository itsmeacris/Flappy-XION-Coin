const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const birdImg = new Image();
birdImg.src = "xioncoin.png";

// --- Sounds ---
const flapSound = new Audio("flap.wav");
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Game variables
let bird = { x: 50, y: 150, width: 40, height: 40, gravity: 0.25, lift: -5, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;

// --- Button elements
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// Reset function
function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
}

// Pipe generator
function createPipe() {
  let gap = 120;
  let topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    width: 50
  });
}

// Draw pipes
function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);

    // Pipe edges (to mimic real flappy pipes)
    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x, pipe.top - 20, pipe.width, 20); // cap top
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, 20);   // cap bottom
    ctx.fillStyle = "green";
  });
}

// Draw bird
function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Draw score
function drawScore() {
  ctx.fillStyle = "#333";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Draw Game Over Banner
function drawGameOver() {
  const bannerWidth = 260;
  const bannerHeight = 80;
  const x = (canvas.width - bannerWidth) / 2;
  const y = canvas.height / 3;

  ctx.fillStyle = "#FFD700"; // yellow banner
  ctx.fillRect(x, y, bannerWidth, bannerHeight);

  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, bannerWidth, bannerHeight);

  ctx.fillStyle = "red";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, y + 50);
}

// Update game loop
function update() {
  if (!gameStarted) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE or TAP Start", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Click/Tap to flap!", canvas.width / 2, canvas.height / 2 + 30);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height) {
    bird.y = canvas.height - bird.height;
    endGame();
  }
