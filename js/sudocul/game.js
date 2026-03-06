import { canPieceFit, clearLines, createGrid, placePiece } from './grid.js';
import { initInput } from './input.js';
import { getRandomPiece } from './pieces.js';
import {
  animateClear,
  buildGrid,
  hideGameOver,
  renderGrid,
  renderPiece,
  setScore,
  showGameOver,
  showPopup,
} from './renderer.js';
import { calcPoints, getBest, updateBest } from './scoring.js';

const els = {
  app: document.getElementById('app-sudocul'),
  grid: document.getElementById('grid'),
  tray: document.getElementById('current-piece'),
  score: document.getElementById('score-sudocul'),
  best: document.getElementById('best-sudocul'),
  overlay: document.getElementById('game-over-sudocul'),
  popup: document.getElementById('score-popup-sudocul'),
  restart: document.getElementById('restart-sudocul'),
  gotoMenu: document.getElementById('goto-menu-sudocul'),
};

const state = {
  grid: null,
  score: 0,
  piece: null,
  busy: false,
};

// ── COLOURS ───────────────────────────────────────────────────────────────────
const PALETTES = [
  { color: '#E8441A', glow: 'rgba(232,68,26,0.55)', light: '#FF6B42' }, // orangey-red (default)
  { color: '#3B9EFF', glow: 'rgba(59,158,255,0.55)', light: '#70BAFF' }, // electric blue
  { color: '#28D97C', glow: 'rgba(40,217,124,0.55)', light: '#5AEAA0' }, // emerald green
  { color: '#C744FF', glow: 'rgba(199,68,255,0.55)', light: '#DC80FF' }, // violet
  { color: '#FFD600', glow: 'rgba(255,214,0,0.55)', light: '#FFE55C' }, // golden yellow
  { color: '#FF4499', glow: 'rgba(255,68,153,0.55)', light: '#FF77BB' }, // hot pink
  { color: '#00D4D8', glow: 'rgba(0,212,216,0.55)', light: '#4DECEF' }, // cyan
];

function applyRandomPalette() {
  const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const root = document.documentElement.style;
  root.setProperty('--piece-color', p.color);
  root.setProperty('--piece-glow', p.glow);
  root.setProperty('--piece-light', p.light);
}

// ── INIT / RESTART ────────────────────────────────────────────────────────────
function init() {
  applyRandomPalette();
  state.grid = createGrid();
  state.score = 0;
  state.piece = getRandomPiece();
  state.busy = false;

  buildGrid(els.grid);
  renderGrid(els.grid, state.grid);
  renderPiece(els.tray, state.piece);
  setScore(els.score, 0);
  setScore(els.best, getBest());
  hideGameOver(els.overlay);
}

// ── PLACEMENT HANDLER ─────────────────────────────────────────────────────────
async function onPlace(piece, row, col) {
  if (state.busy) return;
  state.busy = true;

  // Place the piece on the grid.
  state.grid = placePiece(state.grid, piece, row, col);
  renderGrid(els.grid, state.grid);

  // Check for completed rows / columns / boxes.
  const { newGrid, clearedCells, combo } = clearLines(state.grid);

  if (clearedCells.length > 0) {
    // Play clear animation, then commit the cleared grid.
    await animateClear(els.grid, clearedCells);

    state.grid = newGrid;
    renderGrid(els.grid, state.grid);

    // Update score.
    const pts = calcPoints(combo, clearedCells.length);
    state.score += pts;
    updateBest(state.score);
    setScore(els.score, state.score);
    setScore(els.best, getBest());

    // Show floating points popup at the centre of the grid.
    const rect = els.grid.getBoundingClientRect();
    showPopup(
      els.popup,
      pts,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  }

  // Draw the next piece and check for game over.
  state.piece = getRandomPiece();

  if (!canPieceFit(state.grid, state.piece)) {
    updateBest(state.score);
    showGameOver(els.overlay, state.score);
    // Keep busy = true so the overlay blocks further play until restart.
    return;
  }

  renderPiece(els.tray, state.piece);
  state.busy = false;
}

// ── BOOTSTRAP (runs once on first import) ────────────────────────────────────
let inputBound = false;

function bindOnce() {
  if (inputBound) return;
  inputBound = true;
  initInput(els.tray, els.grid, () => state.grid, onPlace);
  els.restart.addEventListener('click', init);
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function start() {
  bindOnce();
  init();
}

export function stop() {
  hideGameOver(els.overlay);
}
