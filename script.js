const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const birdImg = new Image();
birdImg.src = "xioncoin.png";

// Sounds
const flapSound = new Audio("flap.wav");
const pointSound = new Audio("point.wav");
const hitSound = new Audio("hit.wav");
const dieSound = new Audio("die.wav");
const swooshSound = new Audio("swoosh.wav");

// Game state
let bird, pipes, frame, score, gameOver, gameStarted;

// Buttons
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

function resetGame() {
  bird = { x: 50, y: 150, width: 40, height: 40, gravity: 0.25, lift: -5, velocity: 0 };
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
}

// Pipe generator
function createPipe() {
  const gap = 120;
  const topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
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
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);

    ctx.fillStyle = "#006400";
    ctx.fillRect(pipe.x, pipe.top - 20, pipe.width, 20);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, 20);
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
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Draw Game Over banner
function drawGameOver() {
  const bannerWidth = 260;
  const bannerHeight = 80;
  const x = (canvas.width - bannerWidth) / 2;
  const y = canvas.height / 3;

  ctx.fillStyle = "#FFD700";
  ctx.fillRect(x, y, bannerWidth, bannerHeight);

  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, bannerWidth, bannerHeight);

  ctx.fillStyle = "red";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, y + 50);
}

// Update loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    return; // idle until start
  }

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height) {
    bird.y = canvas.height - bird.height;
    endGame();
  }

  if (frame % 90 === 0) createPipe();
  pipes.forEach(pipe => { pipe.x -= 2; });

  pipes.forEach(pipe => {
    if (bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) {
      endGame();
    }

    if (pipe.x + pipe.width === bird.x) {
      score++;
      pointSound.play();
    }
  });

  drawPipes();
  drawBird();
  drawScore();

  if (gameOver) {
    drawGameOver();
    restartBtn.style.display = "block"; // show restart overlay
  }

  frame++;
  requestAnimationFrame(update);
}

// End Game
function endGame() {
  if (!gameOver) {
    hitSound.play();
    dieSound.play();
  }
  gameOver = true;
}

// Button Events
startBtn.addEventListener("click", () => {
  resetGame();
  gameStarted = true;
  swooshSound.play();
  startBtn.style.display = "none";  // hide start
  restartBtn.style.display = "none"; // just in case
});

restartBtn.addEventListener("click", () => {
  resetGame();
  gameStarted = true;
  swooshSound.play();
  restartBtn.style.display = "none"; // hide restart
});

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      startBtn.click(); // simulate start
    } else if (gameOver) {
      restartBtn.click();
    } else {
      bird.velocity = bird.lift;
      flapSound.play();
    }
  }
});

// Mouse/Tap flap
canvas.addEventListener("click", () => {
  if (gameStarted && !gameOver) {
    bird.velocity = bird.lift;
    flapSound.play();
  }
});

// Init
function init() {
  resetGame();
  gameStarted = false;
  startBtn.style.display = "block";  // show start at first load
  restartBtn.style.display = "none"; // hidden initially
  update();
}
init();
