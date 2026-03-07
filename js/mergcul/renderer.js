import { SIZE } from './logic.js';

// Fixed colour palette indexed by log2(val): 1,2,4,8,16,32,64,128+
const TILE_COLORS = [
  '#4a4a7a', // 1  (2^0)
  '#3B9EFF', // 2  (2^1)
  '#28D97C', // 4  (2^2)
  '#FF8C00', // 8  (2^3)
  '#FF4499', // 16 (2^4)
  '#C744FF', // 32 (2^5)
  '#00D4D8', // 64 (2^6)
];
const TILE_COLOR_HIGH = '#FFD600'; // 128+ — gold

export function tileColor(val) {
  const idx = Math.round(Math.log2(val));
  return idx < TILE_COLORS.length ? TILE_COLORS[idx] : TILE_COLOR_HIGH;
}

// Build the SIZE×SIZE cell grid inside `container`.
export function buildGrid(container) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const div = document.createElement('div');
      div.className = 'mc-cell';
      div.dataset.row = r;
      div.dataset.col = c;
      frag.appendChild(div);
    }
  }
  container.appendChild(frag);
}

function applyCell(cell, val) {
  cell.classList.remove('occupied', 'mc-merge-out', 'mc-merge-in');
  if (val !== null) {
    cell.classList.add('occupied');
    cell.dataset.value = val;
    cell.textContent = val;
    cell.style.setProperty('--tile-color', tileColor(val));
  } else {
    cell.dataset.value = '';
    cell.textContent = '';
    cell.style.removeProperty('--tile-color');
  }
}

// Sync all cells to current grid state.
export function renderGrid(container, grid) {
  container.querySelectorAll('.mc-cell').forEach((cell) => {
    const r = +cell.dataset.row;
    const c = +cell.dataset.col;
    applyCell(cell, grid[r][c]);
  });
}

// Highlight a target cell during drag.
export function highlightDrop(container, r, c, valid) {
  clearHighlights(container);
  const cell = container.querySelector(
    `.mc-cell[data-row="${r}"][data-col="${c}"]`,
  );
  if (cell) cell.classList.add(valid ? 'mc-drop-valid' : 'mc-drop-invalid');
}

export function clearHighlights(container) {
  container
    .querySelectorAll('.mc-drop-valid, .mc-drop-invalid')
    .forEach((el) => {
      el.classList.remove('mc-drop-valid', 'mc-drop-invalid');
    });
}

// Bounce-animate all cells that received a merge this move.
// Returns a Promise that resolves after the animation (~320 ms).
export function animateMerge(container, mergedCells) {
  return new Promise((resolve) => {
    mergedCells.forEach(([r, c]) => {
      const cell = container.querySelector(
        `.mc-cell[data-row="${r}"][data-col="${c}"]`,
      );
      if (cell) {
        cell.classList.remove('mc-merge-in');
        cell.getBoundingClientRect(); // force reflow
        cell.classList.add('mc-merge-in');
      }
    });
    setTimeout(resolve, 320);
  });
}

export function setScore(el, value) {
  el.textContent = value;
}

// Show a floating score popup at viewport coordinates (x, y).
export function showPopup(el, points, x, y) {
  el.textContent = `+${points}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.classList.remove('hidden', 'pop');
  el.getBoundingClientRect(); // force reflow
  el.classList.add('pop');
  el.addEventListener('animationend', () => el.classList.add('hidden'), {
    once: true,
  });
}

export function showGameOver(overlayEl, score) {
  overlayEl.querySelector('.final-value').textContent = score;
  overlayEl.classList.remove('hidden');
}

export function hideGameOver(overlayEl) {
  overlayEl.classList.add('hidden');
}
