# Minesweeper TypeScript Implementation

## Overview

This project is a browser-based Minesweeper game written in TypeScript. It uses HTML5 Canvas for rendering and provides classic Minesweeper gameplay, including marking cells, chording, win/loss detection, a timer, and a mine counter.

---

## Classes

### Cell

Represents a single cell in the grid.

**Properties:**
- `revealed: boolean` — Whether the cell is revealed.
- `marked: boolean` — Whether the cell is flagged.
- `adjacentMines: number` — Number of adjacent mines.
- `isMine: boolean` — Whether the cell contains a mine.

**Methods:**
- `setMine(): boolean` — Sets the cell as a mine if not already.
- `incrementAdjacentMines(): void` — Increments the adjacent mine count.
- `toggleMark(): void` — Toggles the flagged state if not revealed.
- `reveal(): boolean` — Reveals the cell; returns `true` if a mine is hit.
- `toString(): string` — Returns a string for display (mine, number, flag, or empty).

---

### Mines

Manages the grid and game logic.

**Properties:**
- `cells: Cell[]` — Flat array of all cells.
- `width: number` — Grid width.
- `height: number` — Grid height.
- `mineCount: number` — Number of mines.

**Methods:**
- `constructor(width, height, mineCount)` — Initializes the grid and places mines.
- `getCell(x, y): Cell | null` — Returns the cell at `(x, y)` or `null` if out of bounds.
- `getNeighbors(x, y): [number, number][]` — Returns coordinates of all adjacent cells.
- `isInBounds(x, y): boolean` — Checks if `(x, y)` is within grid bounds.
- `revealCell(x, y): void` — Reveals a cell; reveals all if a mine, or recursively reveals if no adjacent mines.
- `toggleCell(x, y): void` — Toggles the flagged state of a cell.
- `chordCell(x, y): void` — Reveals all surrounding unmarked cells if adjacent marks match adjacent mines.

---

## UI & Controls

- **Canvas:** Renders the game grid.
- **Start Button:** Begins a new game.
- **Timer:** Shows elapsed time.
- **Mine Counter:** Displays the number of unmarked mines left.
- **Messages:** Shows win/loss messages and a button for a new game.

### Mouse Controls

- **Left Click:** Reveals a cell.
- **Right Click:** Toggles a cell between hidden and flagged.
- **Both Buttons (Chording):** Reveals all surrounding unmarked cells of a revealed cell if adjacent marks match adjacent mines.

---

## Game Flow

1. **Start Game:** Click "Start" to begin.
2. **Play:** Reveal cells and mark suspected mines.
3. **Win Condition:** All non-mine cells are revealed. Mines are shown with a green background.
4. **Loss Condition:** Revealing a mine ends the game. All cells are revealed; mines are shown with a red background.
5. **Restart:** After win/loss, click "New Game" to play again.

---

## Rendering

- **Revealed Cells:** Gray background; numbers indicate adjacent mines.
- **Flagged Cells:** Flag icon.
- **Mines:** Bomb icon; green background if won, red if lost.
- **Hidden Cells:** Light gray background.

---

## Utility Functions

- `getUnmarkedMines()` — Returns the number of mines left to mark.
- `checkWin()` — Returns `true` if all non-mine cells are revealed.
- `startGame()` — Initializes a new game and starts the timer.
- `endGame(win: boolean)` — Ends the game, reveals mines if won, and displays messages.
- `draw()` — Renders the game state and UI elements.

---

## Usage

1. Bundle the TypeScript code for browser use.
2. Open `index.html` in a browser.
3. Use the mouse and UI controls to play Minesweeper.

---

## Notes

- Designed for browser environments.
- DOM types are required for TypeScript IntelliSense and type checking.
- Game logic is separated from UI for clarity and maintainability.

---

**Enjoy playing Minesweeper!**