const mazeContainer = document.getElementById("maze-container");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const difficultySelect = document.getElementById("difficulty");
const loadingScreen = document.getElementById("loading-screen");
const endPopup = document.getElementById("end-popup");
const endMessage = document.getElementById("end-message");

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
  document.getElementById("game-container").classList.remove("hidden");
  mazeContainer.classList.remove("hidden");
  timerElement.classList.remove("hidden");
  messageElement.classList.remove("hidden");
  document.getElementById("restart-button").classList.remove("hidden");
  document.getElementById("show-path-button").classList.remove("hidden");
  removeNeonBoxes();
}

// Generate a maze ensuring there's always a path from start to end
function generateMaze(rows, cols) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill("wall"));

  function carvePath(x, y) {
    maze[y][x] = "path";
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    shuffle(directions);
    for (const [dx, dy] of directions) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (
        ny >= 0 &&
        ny < rows &&
        nx >= 0 &&
        nx < cols &&
        maze[ny][nx] === "wall"
      ) {
        maze[y + dy][x + dx] = "path";
        maze[ny][nx] = "path";
        carvePath(nx, ny);
      }
    }
  }

  function clearAroundCell(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
          maze[ny][nx] = "path";
        }
      }
    }
  }

  carvePath(1, 1);

  // Clear areas around start and end
  clearAroundCell(0, 0);
  clearAroundCell(cols - 1, rows - 1);

  // Set start and end
  maze[0][0] = "start";
  maze[rows - 1][cols - 1] = "end";

  return maze;
}

function findPath(maze, startX, startY, endX, endY) {
  const rows = maze.length;
  const cols = maze[0].length;
  const queue = [[startX, startY]];
  const visited = new Set();
  const parent = new Map();

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x === endX && y === endY) {
      return reconstructPath(parent, startX, startY, endX, endY);
    }

    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    shuffle(directions);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        ny >= 0 &&
        ny < rows &&
        nx >= 0 &&
        nx < cols &&
        maze[ny][nx] !== "wall"
      ) {
        const newKey = `${nx},${ny}`;
        if (!visited.has(newKey)) {
          queue.push([nx, ny]);
          parent.set(newKey, key);
        }
      }
    }
  }

  return []; // No path found
}

function reconstructPath(parent, startX, startY, endX, endY) {
  const path = [];
  let current = `${endX},${endY}`;
  const start = `${startX},${startY}`;

  while (current !== start) {
    const [x, y] = current.split(",").map(Number);
    path.unshift([x, y]);
    current = parent.get(current);
  }

  path.unshift([startX, startY]);
  return path;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyUp);

function handleKeyPress(e) {
  movePlayerByKey(e.key);
  highlightKey(e.key, true);
}

function handleKeyUp(e) {
  highlightKey(e.key, false);
}

function movePlayerByKey(key) {
  const { x, y } = playerPosition;
  let newX = x,
    newY = y;

  if (key === "ArrowUp" && y > 0) newY--;
  if (key === "ArrowDown" && y < mazeSize - 1) newY++;
  if (key === "ArrowLeft" && x > 0) newX--;
  if (key === "ArrowRight" && x < mazeSize - 1) newX++;

  movePlayer(newX, newY);
}

function highlightKey(key, isActive) {
  const keyElement = document.querySelector(`.arrow-key[data-key="${key}"]`);
  if (keyElement) {
    if (isActive) {
      keyElement.classList.add("active");
    } else {
      keyElement.classList.remove("active");
    }
  }
}

// Set up virtual keyboard
const virtualKeyboard = document.getElementById("virtual-keyboard");
virtualKeyboard.addEventListener("touchstart", handleVirtualKeyPress);
virtualKeyboard.addEventListener("touchend", handleVirtualKeyUp);
virtualKeyboard.addEventListener("mousedown", handleVirtualKeyPress);
virtualKeyboard.addEventListener("mouseup", handleVirtualKeyUp);

function handleVirtualKeyPress(e) {
  e.preventDefault();
  const key = e.target.getAttribute("data-key");
  if (key) {
    movePlayerByKey(key);
    highlightKey(key, true);
  }
}

function handleVirtualKeyUp(e) {
  e.preventDefault();
  const key = e.target.getAttribute("data-key");
  if (key) {
    highlightKey(key, false);
  }
}

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
  document.getElementById("game-container").classList.add("hidden");
  mazeContainer.classList.add("hidden");
  timerElement.classList.add("hidden");
  messageElement.classList.add("hidden");
  document.getElementById("restart-button").classList.add("hidden");
  createNeonBoxes();
}

function createNeonBoxes() {
  const container = document.getElementById("neon-box-container");
  const colors = [
    "#ff00ff",
    "#00ffff",
    "#ffff00",
    "#ff0000",
    "#00ff00",
    "#0000ff",
  ];
  const numBoxes = 20;

  container.innerHTML = ""; // Clear existing boxes

  for (let i = 0; i < numBoxes; i++) {
    const box = document.createElement("div");
    box.classList.add("neon-box");
    const color = colors[Math.floor(Math.random() * colors.length)];
    box.style.borderColor = color;
    box.style.backgroundColor = color;
    box.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;

    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const endX = Math.random() * 100;
    const endY = Math.random() * 100;

    box.style.setProperty("--start-x", `${startX}vw`);
    box.style.setProperty("--start-y", `${startY}vh`);
    box.style.setProperty("--end-x", `${endX}vw`);
    box.style.setProperty("--end-y", `${endY}vh`);

    box.style.animationDuration = `${5 + Math.random() * 5}s`;
    box.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(box);
  }
}

function removeNeonBoxes() {
  const container = document.getElementById("neon-box-container");
  container.innerHTML = "";
}

// Initialize the game
showLoadingScreen();
createNeonBoxes();

function showPath() {
  const maze = Array.from({ length: mazeSize }, (_, y) =>
    Array.from({ length: mazeSize }, (_, x) => {
      const cell = mazeContainer.children[y * mazeSize + x];
      return cell.classList.contains("wall") ? "wall" : "path";
    })
  );

  const path = findPath(maze, 0, 0, mazeSize - 1, mazeSize - 1);

  path.forEach(([x, y]) => {
    const cell = mazeContainer.children[y * mazeSize + x];
    cell.classList.add("path-highlight");
  });

  setTimeout(() => {
    path.forEach(([x, y]) => {
      const cell = mazeContainer.children[y * mazeSize + x];
      cell.classList.remove("path-highlight");
    });
  }, 1000);
}

function checkOrientation() {
  const rotationMessage = document.getElementById("rotation-message");
  const gameContainer = document.getElementById("game-container");
  const loadingScreen = document.getElementById("loading-screen");
  const endPopup = document.getElementById("end-popup");

  if (window.innerWidth <= 768) {
    if (window.orientation === 0 || window.orientation === 180) {
      // Portrait mode
      rotationMessage.classList.remove("hidden");
      gameContainer.classList.add("hidden");
      loadingScreen.classList.add("hidden");
      endPopup.classList.add("hidden");
    } else {
      // Landscape mode
      rotationMessage.classList.add("hidden");
      loadingScreen.classList.remove("hidden");
      if (!gameContainer.classList.contains("hidden")) {
        gameContainer.classList.remove("hidden");
      }
      if (!endPopup.classList.contains("hidden")) {
        endPopup.classList.remove("hidden");
      }
    }
  } else {
    // Desktop view
    rotationMessage.classList.add("hidden");
    loadingScreen.classList.remove("hidden");
  }
}

// Call checkOrientation on page load and when the window is resized or orientation changes
window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
