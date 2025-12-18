const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 15;
let count = 0;

// Game state
let snake, dx, dy, food, score, speed;
let gameRunning = false;

// AI state
let nearMissCount = 0;
const NEAR_MISS_LIMIT = 3;
let dangerNearWall = false;

// High score
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = `High Score: ${highScore}`;
document.getElementById("overlayHighScore").innerText = `High Score: ${highScore}`;

document.addEventListener("keydown", moveSnake);

/* ---------------- UTILITY: ROUNDED RECT ---------------- */
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/* ---------------- START / RESTART ---------------- */
function startGame() {
  initGame();
  gameRunning = true;

  document.getElementById("overlayTitle").innerText = "AI Retro Snake";
  document.getElementById("overlayScore").innerText = "";
  document.getElementById("overlayHighScore").innerText =
    `High Score: ${highScore}`;
  document.querySelector("#overlay button").innerText = "Start";

  document.getElementById("overlay").style.display = "none";
}

function initGame() {
  snake = [{ x: 150, y: 150 }];
  dx = grid;
  dy = 0;
  food = generateFood();
  score = 0;
  speed = 5;
  count = 0;
  nearMissCount = 0;
  dangerNearWall = false;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("aiHint").innerText =
    "AI: Adaptive difficulty enabled";
}

/* ---------------- CONTROLS ---------------- */
function moveSnake(e) {
  if (!gameRunning) return;

  if (e.key === "ArrowUp" && dy === 0) {
    dx = 0; dy = -grid;
  }
  if (e.key === "ArrowDown" && dy === 0) {
    dx = 0; dy = grid;
  }
  if (e.key === "ArrowLeft" && dx === 0) {
    dx = -grid; dy = 0;
  }
  if (e.key === "ArrowRight" && dx === 0) {
    dx = grid; dy = 0;
  }
}

/* ---------------- FOOD ---------------- */
function generateFood() {
  const maxCells = canvas.width / grid;
  return {
    x: Math.floor(Math.random() * maxCells) * grid,
    y: Math.floor(Math.random() * maxCells) * grid
  };
}

/* ---------------- AI: DIFFICULTY ---------------- */
function aiAdjustDifficulty() {
  if (score >= 15) speed = 8;
  else if (score >= 10) speed = 7;
  else if (score >= 5) speed = 6;

  document.getElementById("aiHint").innerText =
    `AI: Adaptive difficulty | Speed level: ${speed}`;
}

/* ---------------- AI: NEAR MISS ---------------- */
function aiDetectNearMiss(head) {
  const dxFood = Math.abs(head.x - food.x);
  const dyFood = Math.abs(head.y - food.y);

  if (
    dxFood <= grid &&
    dyFood <= grid &&
    !(head.x === food.x && head.y === food.y)
  ) {
    nearMissCount++;

    if (nearMissCount >= NEAR_MISS_LIMIT) {
      speed = Math.max(5, speed - 1);
      nearMissCount = 0;
      document.getElementById("aiHint").innerText =
        "AI Assist: Speed reduced to help!";
    }
  }
}

/* ---------------- AI: WALL DANGER ---------------- */
function aiDetectWallDanger(head) {
  const warningDistance = grid * 2;

  if (
    head.x < warningDistance ||
    head.y < warningDistance ||
    head.x > canvas.width - warningDistance - grid ||
    head.y > canvas.height - warningDistance - grid
  ) {
    dangerNearWall = true;
    document.getElementById("aiHint").innerText =
      "AI Warning: Too close to wall!";
  } else {
    dangerNearWall = false;
  }
}

/* ---------------- GAME OVER ---------------- */
function endGame() {
  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText =
      `High Score: ${highScore}`;
  }

  document.getElementById("overlayTitle").innerText = "Game Over";
  document.getElementById("overlayScore").innerText =
    `Score: ${score}`;
  document.getElementById("overlayHighScore").innerText =
    `High Score: ${highScore}`;
  document.querySelector("#overlay button").innerText = "Try Again";

  document.getElementById("overlay").style.display = "flex";
}

/* ---------------- GAME LOOP ---------------- */
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!gameRunning) return;

  if (++count < 60 / speed) return;
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  aiDetectNearMiss(head);
  aiDetectWallDanger(head);

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x > canvas.width - grid ||
    head.y > canvas.height - grid
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    nearMissCount = 0;
    document.getElementById("score").innerText = `Score: ${score}`;
    food = generateFood();
    aiAdjustDifficulty();
  } else {
    snake.pop();
  }

  /* ---- DRAW FOOD (ORANGE CIRCLE) ---- */
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.arc(
    food.x + grid / 2,
    food.y + grid / 2,
    grid / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  /* ---- DRAW SNAKE (ROUNDED SQUARES) ---- */
  snake.forEach((part, index) => {
    if (index === 0 && dangerNearWall) {
      ctx.fillStyle = "red"; // AI danger head
    } else {
      ctx.fillStyle = "#00ff00";
    }

    drawRoundedRect(
      part.x,
      part.y,
      grid,
      grid,
      4 // corner radius
    );
  });
}

/* ---------------- INIT LOOP ---------------- */
gameLoop();
