export const SIZE = 5;

export function createGrid() {
  return Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));
}

// Place a random tile (1 with 90%, 2 with 10%) in a random empty cell.
export function addRandomTile(grid) {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (grid[r][c] === null) empty.push([r, c]);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 1 : 2;
  return next;
}

// Slide one line (array of SIZE values) toward index 0, merging equal adjacent pairs.
// reverse=true → slide toward index SIZE-1 instead.
// Returns { result, mergedIndices, rowScore }.
function slideRow(row, reverse) {
  const indices = Array.from({ length: SIZE }, (_, i) => i);
  if (reverse) indices.reverse();

  // Collect non-null values in slide order.
  const tiles = [];
  for (const i of indices) {
    if (row[i] !== null) tiles.push(row[i]);
  }

  const result = new Array(SIZE).fill(null);
  const mergedIndices = []; // destination indices that received a merge
  let rowScore = 0;
  let skip = false;
  let ri = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    const destIdx = indices[ri];
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      result[destIdx] = merged;
      mergedIndices.push(destIdx);
      rowScore += merged;
      skip = true;
    } else {
      result[destIdx] = tiles[i];
    }
    ri++;
  }

  return { result, mergedIndices, rowScore };
}

// Slide all tiles in `direction` ('left' | 'right' | 'up' | 'down').
// Returns { newGrid, score, moved, mergedCells: [[r, c], ...] }.
export function move(grid, direction) {
  const g = grid.map((r) => [...r]);
  let score = 0;
  let moved = false;
  const mergedCells = [];

  const isRow = direction === 'left' || direction === 'right';
  const reverse = direction === 'right' || direction === 'down';

  for (let i = 0; i < SIZE; i++) {
    const line = isRow
      ? g[i].slice()
      : Array.from({ length: SIZE }, (_, j) => g[j][i]);

    const { result, mergedIndices, rowScore } = slideRow(line, reverse);

    if (line.some((v, j) => v !== result[j])) moved = true;
    score += rowScore;

    for (let j = 0; j < SIZE; j++) {
      if (isRow) g[i][j] = result[j];
      else g[j][i] = result[j];
    }
    for (const j of mergedIndices) {
      mergedCells.push(isRow ? [i, j] : [j, i]);
    }
  }

  return { newGrid: g, score, moved, mergedCells };
}

// True when there is at least one valid move remaining.
export function hasValidMove(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === null) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}
