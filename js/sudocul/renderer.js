import { SIZE } from './grid.js';

// Build the 81-cell grid DOM inside `container`.
export function buildGrid(container) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const div = document.createElement('div');
      const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      div.className = 'cell';
      div.dataset.row = r;
      div.dataset.col = c;
      div.dataset.box = boxIndex % 2; // 0 = primary, 1 = alternate
      frag.appendChild(div);
    }
  }
  container.appendChild(frag);
}

// Sync all cell classes with the current grid state. Clears animation classes.
export function renderGrid(container, grid) {
  container.querySelectorAll('.cell').forEach((cell) => {
    const r = +cell.dataset.row;
    const c = +cell.dataset.col;
    cell.classList.toggle('filled', grid[r][c] === 1);
    cell.classList.remove('highlight-valid', 'highlight-invalid', 'clearing');
  });
}

// Render the piece preview inside the tray element.
// Pass `null` to clear the tray (e.g. while animating).
export function renderPiece(trayEl, piece) {
  trayEl.innerHTML = '';
  if (!piece) return;

  const maxRow = Math.max(...piece.cells.map(([r]) => r));
  const maxCol = Math.max(...piece.cells.map(([, c]) => c));

  const el = document.createElement('div');
  el.className = 'piece-preview';
  el.style.setProperty('--cols', maxCol + 1);
  el.style.setProperty('--rows', maxRow + 1);
  el.dataset.piece = JSON.stringify(piece);

  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const cell = document.createElement('div');
      const filled = piece.cells.some(([pr, pc]) => pr === r && pc === c);
      cell.className = filled ? 'mini-cell filled' : 'mini-cell';
      el.appendChild(cell);
    }
  }

  trayEl.appendChild(el);
}

// Highlight `cells` in the grid as valid or invalid drop targets.
export function highlightCells(container, cells, valid) {
  clearHighlights(container);
  const cls = valid ? 'highlight-valid' : 'highlight-invalid';
  cells.forEach(([r, c]) => {
    const cell = container.querySelector(
      `.cell[data-row="${r}"][data-col="${c}"]`,
    );
    if (cell) cell.classList.add(cls);
  });
}

export function clearHighlights(container) {
  container
    .querySelectorAll('.highlight-valid, .highlight-invalid')
    .forEach((el) => {
      el.classList.remove('highlight-valid', 'highlight-invalid');
    });
}

// Flash the cleared cells, then resolve after the animation completes.
export function animateClear(container, cells) {
  return new Promise((resolve) => {
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

// Show a floating score popup at (x, y) in viewport coordinates.
export function showPopup(el, points, x, y) {
  el.textContent = `+${points}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.classList.remove('hidden', 'pop');
  void el.offsetWidth; // force reflow so animation restarts
  el.classList.add('pop');
  el.addEventListener('animationend', () => el.classList.add('hidden'), {
    once: true,
  });
}

export function showGameOver(overlayEl, score) {
  overlayEl.querySelector('#final-score').textContent = score;
  overlayEl.classList.remove('hidden');
}

export function hideGameOver(overlayEl) {
  overlayEl.classList.add('hidden');
}
