class Cell {
    revealed: boolean = false;
    marked: boolean = false;
    adjacentMines: number = 0;
    isMine: boolean = false;
    
    setMine(): boolean {
        if (this.isMine === true) return false; // Already a mine
        this.isMine = true;
        return true;
    }

    incrementAdjacentMines(): void {
        if (!this.isMine) this.adjacentMines++;
    }

    toggleMark(): void {
        if (!this.revealed) {
            this.marked = !this.marked;
        }
    }

    reveal(): boolean {
        if (this.revealed) return false; // Already revealed
        this.revealed = true;
        if (this.isMine) {
            return true; // Hit a mine
        }
        return false; // Safe
    }

    toString(): string {
        if (this.revealed) {
            return this.isMine ? '💣' : (this.adjacentMines > 0 ? this.adjacentMines.toString() : ' ');
        } else if (this.marked) {
            return '🚩';
        } else {
            return '';
        }
    }
}

class Mines {
    cells: Cell[] = [];

    constructor(public width: number, public height: number, public mineCount: number) {
        if (mineCount > width * height) {
            throw new Error("Mine count exceeds grid size");
        }
        this.initializeGrid();
        this.placeMines();
    }

    getCell(x: number, y: number): Cell | null {
        if (this.isInBounds(x, y)) {
            return this.cells[x + y * this.width];
        }
        return null;
   }

    /**
     * Returns an array of surrounding cells for the given (x, y) position.
     */
    public getNeighbors(x: number, y: number): [number, number][] {
        const neighbors: [number, number][] = [];
        for (let nx = x === 0 ? 0 : x - 1; nx <= x + 1 && nx < this.width; nx++) {
            for (let ny = y === 0 ? 0 : y - 1; ny <= y + 1 && ny < this.height; ny++) {
                neighbors.push([nx, ny]);
            }
        }
        return neighbors.filter(([nx, ny]) => !(nx === x && ny === y));
    }

    private initializeGrid() {
        this.cells = Array(this.width * this.height).fill(null).map(() => new Cell());
    }

    private placeMines(): void {
        let placedMines = 0;
        while (placedMines < this.mineCount) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (this.getCell(x, y)?.setMine()) {
                placedMines++;
                this.getNeighbors(x, y).forEach(neighbor => this.getCell(neighbor[0], neighbor[1])?.incrementAdjacentMines());
            }
        }
    }

    public isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    public revealCell(x: number, y: number): void {
        const cell = this.getCell(x, y);
        if (!cell || cell.revealed || cell.marked) return;
        if (cell.isMine) {
            // Hit a mine, game over logic can be handled here
            for (const cell of this.cells) {
                cell.revealed = true; // Reveal all cells
            }
        } else {
            cell.reveal();
            if (cell.adjacentMines === 0) {
                this.getNeighbors(x, y).forEach(neighbor => this.revealCell(neighbor[0], neighbor[1]));
            }
        }
    }

    public toggleCell(x: number, y: number): void {
        this.getCell(x, y)?.toggleMark();
    }

    /**
     * Reveals all surrounding unmarked cells of a revealed cell if adjacent marks match adjacent mines.
     */
    public chordCell(x: number, y: number): void {
        const cell = this.getCell(x, y);
        if (!cell || !cell.revealed || cell.isMine) return;

        // Count marked cells around
        let markedCount = 0;
        this.getNeighbors(x, y).forEach(([nx, ny]) => {
            this.getCell(nx, ny)?.marked && markedCount++;
        });

        // Only chord if marked count matches adjacentMines
        if (markedCount === cell.adjacentMines) {
            this.getNeighbors(x, y).forEach(([nx, ny]) => {
                const neighbor = this.getCell(nx, ny);
                if (neighbor && !neighbor.revealed && !neighbor.marked) {
                    this.revealCell(nx, ny);
                }
            });
        }
    }
}
// --- Add this code below your Mines class ---

const CELL_SIZE = 32;
const WIDTH = 10;
const HEIGHT = 10;
const MINES = 10;

let mines = new Mines(WIDTH, HEIGHT, MINES);

const canvas = document.createElement('canvas');
canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d')!;

let gameRunning = false;
let gameOver = false;
let gameWon = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval: number | undefined;

// Helper to count unmarked mines
function getUnmarkedMines() {
    const marked = mines.cells.filter(cell => cell.marked).length;
    return MINES - marked;
}

// Helper to check win condition
function checkWin(): boolean {
    // All non-mine cells revealed
    return mines.cells.every(cell => cell.isMine || cell.revealed);
}

// Start a new game
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
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            draw();
        }
    }, 1000);
    draw();
}

// End the game (win or lose)
function endGame(win: boolean) {
    gameRunning = false;
    gameOver = !win;
    gameWon = win;
    if (timerInterval) clearInterval(timerInterval);

    if (win) {
        // Reveal all mines when the game is won
        for (const cell of mines.cells) {
            if (cell.isMine) cell.revealed = true;
        }
    }

    draw();
}

// UI Elements
const uiDiv = document.createElement('div');
uiDiv.style.marginBottom = '10px';
document.body.insertBefore(uiDiv, canvas);

const newGameBtn = document.createElement('button');
newGameBtn.textContent = 'New Game';
newGameBtn.onclick = startGame;
uiDiv.appendChild(newGameBtn);

const infoSpan = document.createElement('span');
infoSpan.style.marginLeft = '20px';
uiDiv.appendChild(infoSpan);

const messageDiv = document.createElement('div');
messageDiv.style.marginTop = '10px';
document.body.appendChild(messageDiv);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = mines.getCell(x, y)!;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            if (cell.revealed) {
                if (cell.isMine && gameWon) {
                    ctx.fillStyle = '#6f6'; // Green for mines when won
                } else if (cell.isMine) {
                    ctx.fillStyle = '#f88'; // Red for mines when lost
                } else {
                    ctx.fillStyle = '#888';
                }
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.fillStyle = 'black';
                const text = cell.toString();
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
            } else {
                ctx.fillStyle = '#bbb';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.fillStyle = 'red';
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.toString(), x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
            }
        }
    }

    // Show/hide New Game button and info
    if (gameRunning) {
        newGameBtn.style.display = 'none';
        infoSpan.textContent = `Time: ${elapsedTime}s | Mines left: ${getUnmarkedMines()}`;
    } else {
        newGameBtn.style.display = '';
        infoSpan.textContent = `Time: ${elapsedTime}s`;
    }

    // Message
    messageDiv.innerHTML = '';
    if (gameWon) {
        const msg = document.createElement('div');
        msg.textContent = `Congratulations! You won in ${elapsedTime} seconds.`;
        messageDiv.appendChild(msg);
    } else if (gameOver) {
        const msg = document.createElement('div');
        msg.textContent = `Game Over!`;
        messageDiv.appendChild(msg);
    }
}

canvas.addEventListener('contextmenu', e => e.preventDefault());

let leftDown = false;
let rightDown = false;

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || gameOver || gameWon) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (e.button === 0) leftDown = true;
    if (e.button === 2) rightDown = true;

    // Chording: both buttons pressed
    if (leftDown && rightDown) {
        mines.chordCell(x, y);
    } else if (e.button === 0) {
        // Left click: reveal
        const cell = mines.getCell(x, y);
        if (cell && !cell.revealed && !cell.marked) {
            mines.revealCell(x, y);
            if (cell.isMine) {
                endGame(false); // Game over if mine is revealed
                draw();
                return;
            }
        }
    } else if (e.button === 2) {
        // Right click: toggle mark
        mines.toggleCell(x, y);
    }

    // Only check win if game is still running
    if (gameRunning && checkWin()) {
        endGame(true);
    }
    draw();
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) leftDown = false;
    if (e.button === 2) rightDown = false;
});

draw();