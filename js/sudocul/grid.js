export const SIZE = 9;

export function createGrid() {
  return Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
}

// True if the piece can be placed at (row, col) without going out of bounds or overlapping.
export function isValidPlacement(grid, piece, row, col) {
  for (const [dr, dc] of piece.cells) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
    if (grid[r][c] !== 0) return false;
  }
  return true;
}

// Returns a new grid with the piece placed at (row, col).
export function placePiece(grid, piece, row, col) {
  const next = grid.map((r) => [...r]);
  for (const [dr, dc] of piece.cells) {
    next[row + dr][col + dc] = 1;
  }
  return next;
}

// Detects completed rows, columns and 3x3 boxes. Clears them and returns
// { newGrid, clearedCells: [r,c][], combo: number }.
export function clearLines(grid) {
  const clearedRows = [];
  const clearedCols = [];
  const clearedBoxes = []; // each entry: [boxRow, boxCol] (0-2 each)

  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every((v) => v === 1)) clearedRows.push(r);
  }
  for (let c = 0; c < SIZE; c++) {
    if (grid.every((row) => row[c] === 1)) clearedCols.push(c);
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let full = true;
      outer: for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          if (!grid[r][c]) {
            full = false;
            break outer;
          }
        }
      }
      if (full) clearedBoxes.push([br, bc]);
    }
  }

  const combo = clearedRows.length + clearedCols.length + clearedBoxes.length;
  if (combo === 0) return { newGrid: grid, clearedCells: [], combo: 0 };

  // Collect all unique cells to clear.
  const toKey = (r, c) => r * SIZE + c;
  const cellSet = new Set();

  clearedRows.forEach((r) => {
    for (let c = 0; c < SIZE; c++) cellSet.add(toKey(r, c));
  });
  clearedCols.forEach((c) => {
    for (let r = 0; r < SIZE; r++) cellSet.add(toKey(r, c));
  });
  clearedBoxes.forEach(([br, bc]) => {
    for (let r = br * 3; r < br * 3 + 3; r++) {
      for (let c = bc * 3; c < bc * 3 + 3; c++) {
        cellSet.add(toKey(r, c));
      }
    }
  });

  const newGrid = grid.map((r) => [...r]);
  const clearedCells = [];
  for (const key of cellSet) {
    const r = Math.floor(key / SIZE);
    const c = key % SIZE;
    newGrid[r][c] = 0;
    clearedCells.push([r, c]);
  }

  return { newGrid, clearedCells, combo };
}

// True if the piece fits anywhere on the grid in its current orientation.
export function canPieceFit(grid, piece) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isValidPlacement(grid, piece, r, c)) return true;
    }
  }
  return false;
}
