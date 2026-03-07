import { initInput } from './input.js';
import { addRandomTile, createGrid, hasValidMove, move } from './logic.js';
import {
  animateMerge,
  buildGrid,
  hideGameOver,
  renderGrid,
  setScore,
  showGameOver,
  showPopup,
} from './renderer.js';
import { getBest, updateBest } from './scoring.js';

const state = {
  grid: null,
  score: 0,
  busy: false,
};

const els = {};
let destroyInput = null;
let started = false;

function bindOnce() {
  if (started) return;
  started = true;
  els.restart.addEventListener('click', () => {
    hideGameOver(els.overlay);
    init();
  });
}

function init() {
  let grid = createGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  state.grid = grid;
  state.score = 0;
  state.busy = false;

  setScore(els.score, 0);
  setScore(els.best, getBest());
  buildGrid(els.grid);
  renderGrid(els.grid, state.grid);
}

async function onMove(direction) {
  if (state.busy) return;

  const { newGrid, score, moved, mergedCells } = move(state.grid, direction);
  if (!moved) return;

  state.busy = true;
  state.grid = newGrid;
  state.score += score;
  renderGrid(els.grid, state.grid);

  if (mergedCells.length > 0) {
    await animateMerge(els.grid, mergedCells);

    const best = updateBest(state.score);
    setScore(els.score, state.score);
    setScore(els.best, best);

    if (score > 0) {
      const [lr, lc] = mergedCells[mergedCells.length - 1];
      const cell = els.grid.querySelector(
        `.mc-cell[data-row="${lr}"][data-col="${lc}"]`,
      );
      if (cell) {
        const rect = cell.getBoundingClientRect();
        showPopup(els.popup, score, rect.left + rect.width / 2, rect.top);
      }
    }
  } else {
    setScore(els.score, state.score);
  }

  // Spawn a new tile.
  state.grid = addRandomTile(state.grid);
  renderGrid(els.grid, state.grid);

  if (!hasValidMove(state.grid)) {
    showGameOver(els.overlay, state.score);
    state.busy = false;
    return;
  }

  state.busy = false;
}

export function start() {
  els.grid = document.getElementById('grid-mergcul');
  els.score = document.getElementById('score-mergcul');
  els.best = document.getElementById('best-mergcul');
  els.overlay = document.getElementById('game-over-mergcul');
  els.restart = document.getElementById('restart-mergcul');
  els.popup = document.getElementById('score-popup-mergcul');

  bindOnce();
  hideGameOver(els.overlay);
  init();
  destroyInput = initInput(els.grid, onMove);
}

export function stop() {
  if (destroyInput) {
    destroyInput();
    destroyInput = null;
  }
  state.busy = false;
}
