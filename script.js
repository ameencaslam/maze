const mazeContainer = document.getElementById("maze-container");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const difficultySelect = document.getElementById("difficulty");
const loadingScreen = document.getElementById("loading-screen");
const endPopup = document.getElementById("end-popup");
const endMessage = document.getElementById("end-message");
const restartButton = document.createElement("button");
restartButton.textContent = "Restart";
restartButton.onclick = initMaze;
document.body.appendChild(restartButton);
restartButton.classList.add("hidden");

let playerPosition = { x: 0, y: 0 };
let timer = 0;
let interval;
let mazeSize = 10;

// Initialize the maze
function initMaze() {
  mazeSize = parseInt(difficultySelect.value);
  const maze = generateMaze(mazeSize, mazeSize);
  renderMaze(maze);
  placePlayer();
  startTimer();
  messageElement.textContent = "";
  loadingScreen.classList.add("hidden");
  mazeContainer.classList.remove("hidden");
  timerElement.classList.remove("hidden");
  messageElement.classList.remove("hidden");
  restartButton.classList.remove("hidden");
}

// Generate a maze ensuring there's always a path from start to end
function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill("wall"));
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function carvePath(x, y) {
    maze[y][x] = "path";
    shuffle(directions);
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        ny >= 0 &&
        ny < rows &&
        nx >= 0 &&
        nx < cols &&
        maze[ny][nx] === "wall"
      ) {
        maze[ny][nx] = "path";
        carvePath(nx, ny);
      }
    }
  }

  // Carve the initial path
  carvePath(0, 0);

  // Ensure the end is reachable
  maze[rows - 1][cols - 1] = "path";

  // Randomly add walls while keeping the path
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (
        maze[y][x] === "path" &&
        Math.random() < 0.3 &&
        !(x === 0 && y === 0) &&
        !(x === cols - 1 && y === rows - 1)
      ) {
        maze[y][x] = "wall";
      }
    }
  }

  maze[0][0] = "start";
  maze[rows - 1][cols - 1] = "end";
  return maze;
}

// Render the maze
function renderMaze(maze) {
  mazeContainer.innerHTML = "";
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 20px)`;
  mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, 20px)`;
  maze.forEach((row) => {
    row.forEach((cell) => {
      const div = document.createElement("div");
      div.className = `cell ${cell}`;
      mazeContainer.appendChild(div);
    });
  });
}

// Place the player at the start position
function placePlayer() {
  const startCell = mazeContainer.children[0];
  startCell.classList.add("player");
  playerPosition = { x: 0, y: 0 };
}

// Handle player movement
document.addEventListener("keydown", (e) => {
  const key = e.key;
  const { x, y } = playerPosition;
  let newX = x,
    newY = y;

  if (key === "ArrowUp" && y > 0) newY--;
  if (key === "ArrowDown" && y < mazeSize - 1) newY++;
  if (key === "ArrowLeft" && x > 0) newX--;
  if (key === "ArrowRight" && x < mazeSize - 1) newX++;

  movePlayer(newX, newY);
});

function movePlayer(newX, newY) {
  const newIndex = newY * mazeSize + newX;
  const newCell = mazeContainer.children[newIndex];

  if (!newCell.classList.contains("wall")) {
    const oldIndex = playerPosition.y * mazeSize + playerPosition.x;
    mazeContainer.children[oldIndex].classList.remove("player");
    newCell.classList.add("player");
    playerPosition = { x: newX, y: newY };

    if (newCell.classList.contains("end")) {
      clearInterval(interval);
      endMessage.textContent = `You win! Time: ${timer} seconds`;
      endPopup.classList.remove("hidden");
      mazeContainer.classList.add("hidden");
      timerElement.classList.add("hidden");
      messageElement.classList.add("hidden");
      restartButton.classList.add("hidden");
    }
  }
}

// Start the timer
function startTimer() {
  timer = 0;
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    timerElement.textContent = `Time: ${timer}`;
  }, 1000);
}

// Show loading screen
function showLoadingScreen() {
  endPopup.classList.add("hidden");
  loadingScreen.classList.remove("hidden");
  mazeContainer.classList.add("hidden");
  timerElement.classList.add("hidden");
  messageElement.classList.add("hidden");
  restartButton.classList.add("hidden");
}

// Initialize the game
showLoadingScreen();
