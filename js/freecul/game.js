import { initInput } from './input.js';
import { applyDraw, applyMove, hasAnyMove, isWon, newGame } from './logic.js';
import { buildBoard, renderState, setBest, setMoves } from './renderer.js';
import { getBest, updateBest } from './scoring.js';

const els = {
  app: document.getElementById('app-freecul'),
  board: document.getElementById('freecul-board'),
  moves: document.getElementById('moves-freecul'),
  best: document.getElementById('best-freecul'),
  overlay: document.getElementById('game-over-freecul'),
  title: document.getElementById('fc-result-title'),
  finalMoves: document.getElementById('final-moves-freecul'),
  restart: document.getElementById('restart-freecul'),
  gotoMenu: document.getElementById('goto-menu-freecul'),
};

let state = null;

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  clearTimeout(stuckTimer);
  state = newGame();
  hideOverlay();
  renderState(els.board, state);
  setMoves(els.moves, 0);
  setBest(els.best, getBest());
}

function hideOverlay() {
  els.overlay.classList.add('hidden');
}

function showOverlay(won) {
  els.title.textContent = won ? 'You Win! 🎉' : 'Bien joué ! 🃏';
  els.finalMoves.textContent = state.moves;
  if (won) updateBest(state.moves);
  setBest(els.best, getBest());
  els.overlay.classList.remove('hidden');
}

// ── STATE CHECK (win / stuck) ─────────────────────────────────────────────────
let stuckTimer = null;

function checkGameState() {
  if (isWon(state)) {
    showOverlay(true);
    return;
  }
  // Give the player a moment to see the board before declaring no moves
  clearTimeout(stuckTimer);
  stuckTimer = setTimeout(() => {
    if (!hasAnyMove(state)) showOverlay(false);
  }, 600);
}

// ── AUTO-MOVE HANDLER (double-tap) ───────────────────────────────────────────
// Try foundation first, then scan every tableau column.
function onAutoMove(src) {
  let next = applyMove(state, src, { type: 'foundation' });
  if (!next) {
    for (let col = 0; col < 7; col++) {
      if (src.type === 'tableau' && src.col === col) continue;
      next = applyMove(state, src, { type: 'tableau', col });
      if (next) break;
    }
  }
  if (!next) return;
  state = next;
  renderState(els.board, state);
  setMoves(els.moves, state.moves);
  checkGameState();
}

// ── DRAW HANDLER ──────────────────────────────────────────────────────────────
function onDraw() {
  state = applyDraw(state);
  renderState(els.board, state);
  setMoves(els.moves, state.moves);
  checkGameState();
}

// ── MOVE HANDLER ──────────────────────────────────────────────────────────────
function onMove(src, dst) {
  const next = applyMove(state, src, dst);
  if (!next) return; // illegal — do nothing

  state = next;

  renderState(els.board, state);
  setMoves(els.moves, state.moves);
  checkGameState();
}

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────
let inputBound = false;

function bindOnce() {
  if (inputBound) return;
  inputBound = true;
  buildBoard(els.board);
  initInput(els.board, () => state, { onDraw, onMove, onAutoMove });
  els.restart.addEventListener('click', init);
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function start() {
  bindOnce();
  init();
}

export function stop() {
  hideOverlay();
}
