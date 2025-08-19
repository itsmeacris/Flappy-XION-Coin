const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const logoImg = new Image();
logoImg.src = "xioncoin.png";

let bird, pipes, score, gravity, jump, pipeWidth, pipeGap, gameInterval;
let gameRunning = false;

document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("menu").style.display = "none"; // hide menu
  startGame();
});

document.getElementById("restartBtn").addEventListener("click", () => {
  location.reload();
});

function startGame() {
  bird = { x: 50, y: 150, width: 40, height: 40, velocity: 0 };
  pipes = [];
  score = 0;
  gravity = 0.5;
  jump = -8;
  pipeWidth = 60;
  pipeGap = 150;

  document.addEventListener("keydown", flap);
  document.addEventListener("click", flap);

  gameRunning = true;
  gameInterval = setInterval(update, 20);
}

function flap(e) {
  if (e.code === "Space" || e.type === "click") {
    bird.velocity = jump;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird
  bird.velocity += gravity;
  bird.y += bird.velocity;
  ctx.drawImage(logoImg, bird.x, bird.y, bird.width, bird.height);

  // Pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    let pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({ x: canvas.width, y: pipeY });
  }

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, pipeWidth, p.y);
    ctx.fillRect(p.x, p.y + pipeGap, pipeWidth, canvas.height - (p.y + pipeGap));

    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.width > p.x &&
      (bird.y < p.y || bird.y + bird.height > p.y + pipeGap)
    ) {
      gameOver();
    }

    if (p.x + pipeWidth === bird.x) {
      score++;
    }
  }

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver();
  }

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

function gameOver() {
  clearInterval(gameInterval);
  ctx.fillStyle = "red";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
  document.getElementById("restartBtn").style.display = "block";
}
