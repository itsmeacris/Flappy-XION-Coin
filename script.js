const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const coinImg = new Image();
coinImg.src = "xioncoin.png";

const sounds = {
  flap: new Audio("flap.wav"),
  swoosh: new Audio("swoosh.wav"),
  hit: new Audio("hit.wav"),
  die: new Audio("die.wav"),
  point: new Audio("point.wav")
};

// Game variables
let frames = 0;
let score = 0;
let bestScore = 0;
let pipes = [];
let gameState = "start"; // start, playing, gameover

// Bird (coin)
const coin = {
  x: 50,
  y: 150,
  w: 30,
  h: 30,
  gravity: 0.25,
  jump: 4.6,
  velocity: 0,
  draw() {
    ctx.drawImage(coinImg, this.x, this.y, this.w, this.h);
  },
  flap() {
    this.velocity = -this.jump;
    sounds.flap.play();
  },
  update() {
    if (gameState === "playing") {
      this.velocity += this.gravity;
      this.y += this.velocity;
      if (this.y + this.h >= canvas.height) {
        gameOver();
      }
    }
  },
  reset() {
    this.y = 150;
    this.velocity = 0;
  }
};

// Pipes
function drawPipe(x, y, h, flip = false) {
  ctx.fillStyle = "#228B22"; // pipe body
  ctx.fillRect(x, y, 50, h);
  ctx.fillStyle = "#32CD32"; // lighter cap
  if (flip) {
    ctx.fillRect(x - 5, y, 60, 15);
  } else {
    ctx.fillRect(x - 5, y + h - 15, 60, 15);
  }
}

function resetGame() {
  pipes = [];
  score = 0;
  coin.reset();
  gameState = "start";
}

function gameOver() {
  gameState = "gameover";
  sounds.hit.play();
  sounds.die.play();
}

// Draw UI overlays
function drawOverlay() {
  if (gameState === "start") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Tap SPACE or Click", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("to Start Flappy XION", canvas.width / 2, canvas.height / 2 + 20);
  }

  if (gameState === "gameover") {
    // Yellow banner
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 - 60, 160, 50);
    ctx.strokeRect(canvas.width / 2 - 80, canvas.height / 2 - 60, 160, 50);

    ctx.fillStyle = "#000";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);

    // Restart button
    ctx.fillStyle = "#f44336";
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 30, 120, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Restart", canvas.width / 2, canvas.height / 2 + 58);
  }
}

// Handle input
canvas.addEventListener("click", function (evt) {
  if (gameState === "start") {
    gameState = "playing";
    sounds.swoosh.play();
  } else if (gameState === "playing") {
    coin.flap();
  } else if (gameState === "gameover") {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;

    // Restart button area
    if (x >= canvas.width / 2 - 60 && x <= canvas.width / 2 + 60 &&
        y >= canvas.height / 2 + 30 && y <= canvas.height / 2 + 70) {
      resetGame();
    }
  }
});
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (gameState === "start") {
      gameState = "playing";
      sounds.swoosh.play();
    } else if (gameState === "playing") {
      coin.flap();
    } else if (gameState === "gameover") {
      resetGame();
    }
  }
});

// Main loop
function loop() {
  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background sky
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw pipes
  if (gameState === "playing") {
    if (frames % 90 === 0) {
      const topHeight = Math.floor(Math.random() * 200) + 50;
      const gap = 100;
      pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - (topHeight + gap),
      });
    }

    pipes.forEach((pipe, i) => {
      pipe.x -= 2;
      drawPipe(pipe.x, 0, pipe.top, true); // top pipe
      drawPipe(pipe.x, canvas.height - pipe.bottom, pipe.bottom, false); // bottom pipe

      // Collision
      if (
        coin.x < pipe.x + 50 &&
        coin.x + coin.w > pipe.x &&
        (coin.y < pipe.top || coin.y + coin.h > canvas.height - pipe.bottom)
      ) {
        gameOver();
      }

      // Score
      if (pipe.x + 50 === coin.x) {
        score++;
        sounds.point.play();
      }

      // Remove offscreen
      if (pipe.x + 50 < 0) {
        pipes.splice(i, 1);
      }
    });
  } else {
    // Draw existing pipes frozen
    pipes.forEach((pipe) => {
      drawPipe(pipe.x, 0, pipe.top, true);
      drawPipe(pipe.x, canvas.height - pipe.bottom, pipe.bottom, false);
    });
  }

  // Draw coin
  coin.update();
  coin.draw();

  // Score display
  if (gameState === "playing") {
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 50, 30);
  }

  // UI overlays
  drawOverlay();

  requestAnimationFrame(loop);
}

resetGame();
loop();
