export const SIZE = 7;
export const ENTRY_ROW = 3; // beam enters from the left at this row (0-based)

// Direction constants
const RIGHT = 0,
  DOWN = 1,
  LEFT = 2,
  UP = 3;
const DR = [0, 1, 0, -1]; // delta row for RIGHT, DOWN, LEFT, UP
const DC = [1, 0, -1, 0]; // delta col for RIGHT, DOWN, LEFT, UP

export function createGrid() {
  return Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));
}

// Returns a new grid with the given tile placed at (row, col).
export function placeTile(grid, row, col, type) {
  const next = grid.map((r) => [...r]);
  next[row][col] = type;
  return next;
}

// Apply the correct reflection for a mirror tile.
// '/'  : right→up, up→right, left→down,  down→left
// '\\' : right→down, down→right, left→up, up→left
// '+'  : no deflection (pass-through)
function reflect(type, dir) {
  if (type === '+') return dir;
  if (type === '/') return [UP, LEFT, DOWN, RIGHT][dir];
  // backslash: right→down, down→right, left→up, up→left
  return [DOWN, RIGHT, UP, LEFT][dir];
}

// Trace the beam from the left edge (ENTRY_ROW, -1) going right.
// Returns { path: [r, c][], bounces: number }.
// Loop detection via a Set of "r,c,dir" keys prevents infinite loops.
export function traceBeam(grid) {
  const path = [];
  const seen = new Set(); // visited (r, c, dir) triples

  let r = ENTRY_ROW;
  let c = -1; // starts just outside the left edge
  let dir = RIGHT;
  let bounces = 0;

  // Upper bound: each cell can be entered from at most 4 directions
  const MAX_STEPS = SIZE * SIZE * 4 + 4;

  for (let step = 0; step < MAX_STEPS; step++) {
    r += DR[dir];
    c += DC[dir];

    // Beam exited the grid
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;

    // Loop detection
    const key = `${r},${c},${dir}`;
    if (seen.has(key)) break;
    seen.add(key);

    path.push([r, c]);

    // Reflect off a mirror if present
    const tile = grid[r][c];
    if (tile !== null) {
      const newDir = reflect(tile, dir);
      if (newDir !== dir) bounces++;
      dir = newDir;
    }
  }

  return { path, bounces };
}

function isRowFullyCovered(covered, r) {
  for (let c = 0; c < SIZE; c++) {
    if (!covered.has(`${r},${c}`)) return false;
  }
  return true;
}

function isColFullyCovered(covered, c) {
  for (let r = 0; r < SIZE; r++) {
    if (!covered.has(`${r},${c}`)) return false;
  }
  return true;
}

function isRowFullyOccupied(grid, r) {
  for (let c = 0; c < SIZE; c++) {
    if (grid[r][c] === null) return false;
  }
  return true;
}

function isColFullyOccupied(grid, c) {
  for (let r = 0; r < SIZE; r++) {
    if (grid[r][c] === null) return false;
  }
  return true;
}

// Check whether the beam path covers every cell in any complete row or column
// that is also fully occupied with mirrors.
// Returns { clearedCells: [r, c][], linesCleared: number }.
export function checkClearLines(grid, path) {
  const covered = new Set(path.map(([r, c]) => `${r},${c}`));

  const rowsToClear = [];
  const colsToClear = [];

  for (let r = 0; r < SIZE; r++) {
    if (isRowFullyCovered(covered, r) && isRowFullyOccupied(grid, r))
      rowsToClear.push(r);
  }
  for (let c = 0; c < SIZE; c++) {
    if (isColFullyCovered(covered, c) && isColFullyOccupied(grid, c))
      colsToClear.push(c);
  }

  const linesCleared = rowsToClear.length + colsToClear.length;
  if (linesCleared === 0) return { clearedCells: [], linesCleared: 0 };

  const cellSet = new Set();
  rowsToClear.forEach((r) => {
    for (let c = 0; c < SIZE; c++) cellSet.add(`${r},${c}`);
  });
  colsToClear.forEach((c) => {
    for (let r = 0; r < SIZE; r++) cellSet.add(`${r},${c}`);
  });

  const clearedCells = [...cellSet].map((key) => key.split(',').map(Number));
  return { clearedCells, linesCleared };
}

// Returns a new grid with the given cells emptied (mirrors removed).
export function applyClears(grid, cells) {
  const next = grid.map((r) => [...r]);
  cells.forEach(([r, c]) => {
    next[r][c] = null;
  });
  return next;
}

// True when every cell in the grid is occupied.
export function isFull(grid) {
  return grid.every((row) => row.every((cell) => cell !== null));
}
