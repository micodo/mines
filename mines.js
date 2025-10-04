// mines.ts
var Cell = class {
  revealed = false;
  marked = false;
  adjacentMines = 0;
  isMine = false;
  setMine() {
    if (this.isMine === true) return false;
    this.isMine = true;
    return true;
  }
  incrementAdjacentMines() {
    if (!this.isMine) this.adjacentMines++;
  }
  toggleMark() {
    if (!this.revealed) {
      this.marked = !this.marked;
    }
  }
  reveal() {
    if (this.revealed) return false;
    this.revealed = true;
    if (this.isMine) {
      return true;
    }
    return false;
  }
  toString() {
    if (this.revealed) {
      return this.isMine ? "\u{1F4A3}" : this.adjacentMines > 0 ? this.adjacentMines.toString() : " ";
    } else if (this.marked) {
      return "\u{1F6A9}";
    } else {
      return "";
    }
  }
};
var Mines = class {
  width;
  height;
  mineCount;
  cells;
  constructor(width, height, mineCount) {
    this.width = width;
    this.height = height;
    this.mineCount = mineCount;
    this.cells = [];
    if (mineCount > width * height) {
      throw new Error("Mine count exceeds grid size");
    }
    this.initializeGrid();
    this.placeMines();
  }
  getCell(x, y) {
    if (this.isInBounds(x, y)) {
      return this.cells[x + y * this.width];
    }
    return null;
  }
  /**
     * Returns an array of surrounding cells for the given (x, y) position.
     */
  getNeighbors(x, y) {
    const neighbors = [];
    for (let nx = x === 0 ? 0 : x - 1; nx <= x + 1 && nx < this.width; nx++) {
      for (let ny = y === 0 ? 0 : y - 1; ny <= y + 1 && ny < this.height; ny++) {
        neighbors.push([
          nx,
          ny
        ]);
      }
    }
    return neighbors.filter(([nx, ny]) => !(nx === x && ny === y));
  }
  initializeGrid() {
    this.cells = Array(this.width * this.height).fill(null).map(() => new Cell());
  }
  placeMines() {
    let placedMines = 0;
    while (placedMines < this.mineCount) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      if (this.getCell(x, y)?.setMine()) {
        placedMines++;
        this.getNeighbors(x, y).forEach((neighbor) => this.getCell(neighbor[0], neighbor[1])?.incrementAdjacentMines());
      }
    }
  }
  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  revealCell(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || cell.revealed || cell.marked) return;
    if (cell.isMine) {
      for (const cell2 of this.cells) {
        cell2.revealed = true;
      }
    } else {
      cell.reveal();
      if (cell.adjacentMines === 0) {
        this.getNeighbors(x, y).forEach((neighbor) => this.revealCell(neighbor[0], neighbor[1]));
      }
    }
  }
  toggleCell(x, y) {
    this.getCell(x, y)?.toggleMark();
  }
  /**
     * Reveals all surrounding unmarked cells of a revealed cell if adjacent marks match adjacent mines.
     */
  chordCell(x, y) {
    const cell = this.getCell(x, y);
    if (!cell || !cell.revealed || cell.isMine) return;
    let markedCount = 0;
    this.getNeighbors(x, y).forEach(([nx, ny]) => {
      this.getCell(nx, ny)?.marked && markedCount++;
    });
    if (markedCount === cell.adjacentMines) {
      this.getNeighbors(x, y).forEach(([nx, ny]) => {
        const neighbor = this.getCell(nx, ny);
        if (neighbor && !neighbor.revealed && !neighbor.marked) {
          this.revealCell(nx, ny);
        }
      });
    }
  }
};
var CELL_SIZE = 32;
var WIDTH = 10;
var HEIGHT = 10;
var MINES = 10;
var mines = new Mines(WIDTH, HEIGHT, MINES);
var canvas = document.createElement("canvas");
canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;
document.body.appendChild(canvas);
var ctx = canvas.getContext("2d");
var gameRunning = false;
var gameOver = false;
var gameWon = false;
var startTime = 0;
var elapsedTime = 0;
var timerInterval;
function getUnmarkedMines() {
  const marked = mines.cells.filter((cell) => cell.marked).length;
  return MINES - marked;
}
function checkWin() {
  return mines.cells.every((cell) => cell.isMine || cell.revealed);
}
function startGame() {
  gameRunning = true;
  gameOver = false;
  gameWon = false;
  startTime = Date.now();
  elapsedTime = 0;
  mines = new Mines(WIDTH, HEIGHT, MINES);
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameRunning) {
      elapsedTime = Math.floor((Date.now() - startTime) / 1e3);
      draw();
    }
  }, 1e3);
  draw();
}
function endGame(win) {
  gameRunning = false;
  gameOver = !win;
  gameWon = win;
  if (timerInterval) clearInterval(timerInterval);
  if (win) {
    for (const cell of mines.cells) {
      if (cell.isMine) cell.revealed = true;
    }
  }
  draw();
}
var uiDiv = document.createElement("div");
uiDiv.style.marginBottom = "10px";
document.body.insertBefore(uiDiv, canvas);
var newGameBtn = document.createElement("button");
newGameBtn.textContent = "New Game";
newGameBtn.onclick = startGame;
uiDiv.appendChild(newGameBtn);
var infoSpan = document.createElement("span");
infoSpan.style.marginLeft = "20px";
uiDiv.appendChild(infoSpan);
var messageDiv = document.createElement("div");
messageDiv.style.marginTop = "10px";
document.body.appendChild(messageDiv);
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cell = mines.getCell(x, y);
      ctx.strokeStyle = "black";
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      if (cell.revealed) {
        if (cell.isMine && gameWon) {
          ctx.fillStyle = "#6f6";
        } else if (cell.isMine) {
          ctx.fillStyle = "#f88";
        } else {
          ctx.fillStyle = "#888";
        }
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = "black";
        const text = cell.toString();
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
      } else {
        ctx.fillStyle = "#bbb";
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "blue";
        ctx.fillText(cell.toString(), x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
      }
    }
  }
  if (gameRunning) {
    newGameBtn.style.display = "none";
    infoSpan.textContent = `Time: ${elapsedTime}s | Mines left: ${getUnmarkedMines()}`;
  } else {
    newGameBtn.style.display = "";
    infoSpan.textContent = `Time: ${elapsedTime}s`;
  }
  messageDiv.innerHTML = "";
  if (gameWon) {
    const msg = document.createElement("div");
    msg.textContent = `Congratulations! You won in ${elapsedTime} seconds.`;
    messageDiv.appendChild(msg);
  } else if (gameOver) {
    const msg = document.createElement("div");
    msg.textContent = `Game Over!`;
    messageDiv.appendChild(msg);
  }
}
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
var leftDown = false;
var rightDown = false;
canvas.addEventListener("mousedown", (e) => {
  if (!gameRunning || gameOver || gameWon) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  if (e.button === 0) leftDown = true;
  if (e.button === 2) rightDown = true;
  if (leftDown && rightDown) {
    mines.chordCell(x, y);
  } else if (e.button === 0) {
    const cell = mines.getCell(x, y);
    if (cell && !cell.revealed && !cell.marked) {
      mines.revealCell(x, y);
      if (cell.isMine) {
        endGame(false);
        draw();
        return;
      }
    }
  } else if (e.button === 2) {
    mines.toggleCell(x, y);
  }
  if (gameRunning && checkWin()) {
    endGame(true);
  }
  draw();
});
canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) leftDown = false;
  if (e.button === 2) rightDown = false;
});
draw();
