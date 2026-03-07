import { SIZE } from './grid.js';
import { tileClass } from './tiles.js';

// Build the SIZE×SIZE cell grid inside `container`.
export function buildGrid(container) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const div = document.createElement('div');
      div.className = 'cell';
      div.dataset.row = r;
      div.dataset.col = c;
      frag.appendChild(div);
    }
  }
  container.appendChild(frag);
}

// Sync all cell classes to the current grid state.
export function renderGrid(container, grid) {
  container.querySelectorAll('.cell').forEach((cell) => {
    const r = +cell.dataset.row;
    const c = +cell.dataset.col;
    const tile = grid[r][c];

    // Remove all state classes
    cell.classList.remove(
      'tile-slash',
      'tile-backslash',
      'tile-cross',
      'occupied',
      'beam',
      'beam-entry',
      'clearing',
      'hover',
    );

    if (tile !== null) {
      cell.classList.add(tileClass(tile), 'occupied');
    }
  });
}

// Highlight all cells along the beam path.
// The first cell (entry) gets a stronger 'beam-entry' highlight.
export function renderBeam(container, path) {
  clearBeam(container);
  if (!path.length) return;

  const visited = new Set();
  path.forEach(([r, c], i) => {
    const key = `${r},${c}`;
    if (visited.has(key)) return;
    visited.add(key);

    const cell = container.querySelector(
      `.cell[data-row="${r}"][data-col="${c}"]`,
    );
    if (!cell) return;

    if (i === 0) {
      cell.classList.add('beam-entry');
    } else {
      cell.classList.add('beam');
    }
  });
}

export function clearBeam(container) {
  container.querySelectorAll('.beam, .beam-entry').forEach((el) => {
    el.classList.remove('beam', 'beam-entry');
  });
}

// Show a large preview of the next tile type in the tray element.
export function renderNextTile(trayEl, type) {
  trayEl.innerHTML = '';
  if (!type) return;

  const div = document.createElement('div');
  div.className = `lc-next-tile ${tileClass(type)}`;
  trayEl.appendChild(div);
}

// Flash the cleared cells, then resolve after the animation completes.
export function animateClear(container, cells) {
  return new Promise((resolve) => {
    clearBeam(container); // avoid animation conflict with beam classes
    cells.forEach(([r, c]) => {
      const cell = container.querySelector(
        `.cell[data-row="${r}"][data-col="${c}"]`,
      );
      if (cell) cell.classList.add('clearing');
    });
    setTimeout(resolve, 440);
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
  el.getBoundingClientRect(); // force reflow so animation restarts cleanly
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
