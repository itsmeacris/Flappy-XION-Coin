// ==================== GAME SETUP ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let frames = 0;
let gameOver = false;
let gameStarted = false;

// ==================== SOUNDS ====================
function loadSound(src) {
  const sound = new Audio(src);
  sound.preload = "auto";
  sound.load();
  return sound;
}

const pointSound = loadSound("point.wav");
const hitSound = loadSound("hit.wav");
const dieSound = loadSound("die.wav");
const swooshSound = loadSound("swoosh.wav");
const flapSound = loadSound("flap.wav");

// ==================== BIRD ====================
const birdImg = new Image();
birdImg.src = "xioncoin.png";

let bird = {
  x: 50,
  y: 150,
  w: 40,
  h: 40,
  dy: 0
};

let gravity = 0.25;
let jump = -5;

// ==================== PIPES ====================
let pipes = [];
let pipeWidth = 60;
let pipeGap = 140;

// ==================== SCORE ====================
let score = 0;
let highScore = 0;

// ==================== BACKGROUND ====================
function drawBackground() {
  // Sky gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB"); // light blue
  gradient.addColorStop(1, "#E0F6FF"); // softer blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun
  ctx.beginPath();
  ctx.arc(320, 80, 40, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();

  // Clouds
  drawCloud(100, 100);
  drawCloud(250, 180);
  drawCloud(60, 220);
}

function drawCloud(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 25, y + 10, 25, 0, Math.PI * 2);
  ctx.arc(x + 60, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

// ==================== PIPE RENDER ====================
function drawPipes() {
  ctx.fillStyle = "#228B22"; // dark green
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);

    // Pipe head (top)
    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x - 2, pipe.top - 20, pipeWidth + 4, 20);

    // Reset color
    ctx.fillStyle = "#228B22";

    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height);

    // Pipe head (bottom)
    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x - 2, pipe.top + pipeGap, pipeWidth + 4, 20);

    // Reset
    ctx.fillStyle = "#228B22";
  });
}

// ==================== GAME FUNCTIONS ====================
function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("High: " + highScore, 10, 60);
}

function update() {
  if (!gameStarted || gameOver) return;

  frames++;

  bird.dy += gravity;
  bird.y += bird.dy;

  if (frames % 90 === 0) {
    let top = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({ x: canvas.width, top: top });
  }

  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.w > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.h > pipe.top + pipeGap)
    ) {
      hitSound.currentTime = 0;
      hitSound.play();
      dieSound.currentTime = 0;
      dieSound.play();
      gameOver = true;
    }

    if (pipe.x + pipeWidth === bird.x) {
      score++;
      pointSound.currentTime = 0;
      pointSound.play();
      if (score > highScore) highScore = score;
    }
  });

  if (bird.y + bird.h >= canvas.height) {
    gameOver = true;
    hitSound.currentTime = 0;
    hitSound.play();
    dieSound.currentTime = 0;
    dieSound.play();
  }
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawScore();

  if (!gameStarted) {
    ctx.fillStyle = "black";
    ctx.font = "28px Arial";
    ctx.fillText("Flappy XION", canvas.width / 2 - 80, 200);
    ctx.fillText("Press Start", canvas.width / 2 - 70, 250);
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE or Click to Flap", canvas.width / 2 - 120, 300);
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "32px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(loop);
}

// ==================== CONTROLS ====================
function flap() {
  if (!gameStarted || gameOver) return;
  bird.dy = jump;
  flapSound.currentTime = 0;
  flapSound.play();
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
});
canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", flap);

// ==================== BUTTONS ====================
function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    gameOver = false;
    bird.y = 150;
    bird.dy = 0;
    pipes = [];
    score = 0;

    // unlock sounds
    [pointSound, hitSound, dieSound, swooshSound, flapSound].forEach(s => {
      s.play().then(() => s.pause()).catch(()=>{});
    });

    swooshSound.currentTime = 0;
    swooshSound.play();
  }
}

function restartGame() {
  if (gameOver) {
    gameOver = false;
    bird.y = 150;
    bird.dy = 0;
    pipes = [];
    score = 0;
    swooshSound.currentTime = 0;
    swooshSound.play();
  }
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

// ==================== START LOOP ====================
loop();
