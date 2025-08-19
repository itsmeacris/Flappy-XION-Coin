const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Load images
const birdImg = new Image();
birdImg.src = "https://i.ibb.co/4fwkPzM/flappy-bird.png"; // placeholder bird

const logoImg = new Image();
logoImg.src = "xioncoin.png"; // your flame logo

// Bird properties
let bird = {
  x: 50,
  y: 150,
  width: 34,
  height: 24,
  gravity: 0.6,
  lift: -10,
  velocity: 0
};

let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Controls
document.addEventListener("keydown", () => {
  if (!gameOver) bird.velocity = bird.lift;
});
document.addEventListener("click", () => {
  if (!gameOver) bird.velocity = bird.lift;
});

// Spawn new pipes
function spawnPipe() {
  let gap = 120;
  let topHeight = Math.random() * (canvas.height / 2);
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    width: 50
  });
}

// Game loop
function update() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over!", 120, 300);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Draw bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Pipes
  if (frame % 90 === 0) spawnPipe();

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2; // move left

    // Draw top pipe
    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, p.width, p.top);

    // Draw bottom pipe
    ctx.fillRect(p.x, p.bottom, p.width, canvas.height - p.bottom);

    // Collision
    if (
      bird.x < p.x + p.width &&
      bird.x + bird.width > p.x &&
      (bird.y < p.top || bird.y + bird.height > p.bottom)
    ) {
      gameOver = true;
    }

    // Passed pipe → increase score
    if (p.x + p.width === bird.x) {
      score++;
    }
  }

  // Logo = score icon
  ctx.drawImage(logoImg, 10, 10, 30, 30);

  // Score text
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText(" x " + score, 45, 35);

  // Ground collision
  if (bird.y + bird.height >= canvas.height) {
    gameOver = true;
  }

  frame++;
  requestAnimationFrame(update);
}

update();
