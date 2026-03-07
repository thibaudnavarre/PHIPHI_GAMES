import {
  applyClears,
  checkClearLines,
  createGrid,
  isFull,
  placeTile,
  traceBeam,
} from './grid.js';
import { initInput } from './input.js';
import {
  animateClear,
  buildGrid,
  clearBeam,
  hideGameOver,
  renderBeam,
  renderGrid,
  renderNextTile,
  setScore,
  showGameOver,
  showPopup,
} from './renderer.js';
import { calcClearBonus, calcPoints, updateBest } from './scoring.js';
import { getRandomTile } from './tiles.js';

const els = {
  app: document.getElementById('app-lightcul'),
  grid: document.getElementById('grid-lightcul'),
  tray: document.getElementById('current-tile-lightcul'),
  score: document.getElementById('score-lightcul'),
  turns: document.getElementById('turns-lightcul'),
  overlay: document.getElementById('game-over-lightcul'),
  popup: document.getElementById('score-popup-lightcul'),
  restart: document.getElementById('restart-lightcul'),
  gotoMenu: document.getElementById('goto-menu-lightcul'),
};

const state = {
  grid: null,
  score: 0,
  tile: null,
  turns: 0,
  busy: false,
};

const MAX_TURNS = 49;

// ── PALETTES ──────────────────────────────────────────────────────────────────
const PALETTES = [
  {
    color: '#FFD600',
    glow: 'rgba(255,214,0,0.55)',
    light: '#FFE55C',
    bg: 'rgba(255,214,0,0.18)',
    bgStrong: 'rgba(255,214,0,0.38)',
  }, // golden yellow
  {
    color: '#00D4D8',
    glow: 'rgba(0,212,216,0.55)',
    light: '#4DECEF',
    bg: 'rgba(0,212,216,0.18)',
    bgStrong: 'rgba(0,212,216,0.38)',
  }, // cyan
  {
    color: '#FF4499',
    glow: 'rgba(255,68,153,0.55)',
    light: '#FF77BB',
    bg: 'rgba(255,68,153,0.18)',
    bgStrong: 'rgba(255,68,153,0.38)',
  }, // hot pink
  {
    color: '#28D97C',
    glow: 'rgba(40,217,124,0.55)',
    light: '#5AEAA0',
    bg: 'rgba(40,217,124,0.18)',
    bgStrong: 'rgba(40,217,124,0.38)',
  }, // emerald
  {
    color: '#C744FF',
    glow: 'rgba(199,68,255,0.55)',
    light: '#DC80FF',
    bg: 'rgba(199,68,255,0.18)',
    bgStrong: 'rgba(199,68,255,0.38)',
  }, // violet
  {
    color: '#3B9EFF',
    glow: 'rgba(59,158,255,0.55)',
    light: '#70BAFF',
    bg: 'rgba(59,158,255,0.18)',
    bgStrong: 'rgba(59,158,255,0.38)',
  }, // electric blue
  {
    color: '#FF8C00',
    glow: 'rgba(255,140,0,0.55)',
    light: '#FFAB40',
    bg: 'rgba(255,140,0,0.18)',
    bgStrong: 'rgba(255,140,0,0.38)',
  }, // amber
];

function applyRandomPalette() {
  const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const s = document.documentElement.style;
  s.setProperty('--beam-color', p.color);
  s.setProperty('--beam-glow', p.glow);
  s.setProperty('--beam-light', p.light);
  s.setProperty('--beam-bg', p.bg);
  s.setProperty('--beam-bg-strong', p.bgStrong);
}

// ── INIT / RESTART ────────────────────────────────────────────────────────────
function init() {
  applyRandomPalette();
  state.grid = createGrid();
  state.score = 0;
  state.turns = 0;
  state.tile = getRandomTile();
  state.busy = false;

  buildGrid(els.grid);
  renderGrid(els.grid, state.grid);

  // Show the initial beam (straight through entry row on an empty grid)
  const { path: initPath } = traceBeam(state.grid);
  renderBeam(els.grid, initPath);

  renderNextTile(els.tray, state.tile);
  setScore(els.score, 0);
  setScore(els.turns, MAX_TURNS);
  hideGameOver(els.overlay);
}

// ── PLACEMENT HANDLER ─────────────────────────────────────────────────────────
async function onPlace(r, c) {
  if (state.busy) return;
  if (state.grid[r][c] !== null) return; // safety: occupied cell
  state.busy = true;

  // 1. Place the tile and re-render.
  state.grid = placeTile(state.grid, r, c, state.tile);
  renderGrid(els.grid, state.grid);

  // 2. Trace beam on the updated grid.
  const { path, bounces } = traceBeam(state.grid);
  renderBeam(els.grid, path);

  // 3. Determine scoring.
  state.turns++;
  setScore(els.turns, MAX_TURNS - state.turns);

  const uniquePathLen = new Set(path.map(([pr, pc]) => `${pr},${pc}`)).size;
  const { clearedCells, linesCleared } = checkClearLines(state.grid, path);
  const pts = calcPoints(uniquePathLen, bounces) + calcClearBonus(linesCleared);

  // 4. Animate clears if any (animateClear also calls clearBeam internally).
  if (clearedCells.length > 0) {
    await animateClear(els.grid, clearedCells);
    state.grid = applyClears(state.grid, clearedCells);
    renderGrid(els.grid, state.grid);

    // Re-trace and render the beam on the cleared grid.
    const { path: newPath } = traceBeam(state.grid);
    renderBeam(els.grid, newPath);
  }

  // 5. Update score.
  state.score += pts;
  updateBest(state.score);
  setScore(els.score, state.score);

  // Show floating score popup.
  const rect = els.grid.getBoundingClientRect();
  showPopup(
    els.popup,
    pts,
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );

  // 6. Check game over: all turns used OR grid completely full.
  if (state.turns >= MAX_TURNS || isFull(state.grid)) {
    updateBest(state.score);
    showGameOver(els.overlay, state.score);
    // Keep busy = true; overlay blocks further interaction until restart.
    return;
  }

  // 7. Draw the next tile.
  state.tile = getRandomTile();
  renderNextTile(els.tray, state.tile);
  state.busy = false;
}

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────
let inputBound = false;

function bindOnce() {
  if (inputBound) return;
  inputBound = true;
  initInput(els.grid, onPlace, () => state.busy);
  els.restart.addEventListener('click', init);
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function start() {
  bindOnce();
  init();
}

export function stop() {
  clearBeam(els.grid);
  hideGameOver(els.overlay);
}
