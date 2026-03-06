import { isValidPlacement } from './grid.js';
import { clearHighlights, highlightCells } from './renderer.js';

// Read the live CSS variable so the ghost always matches the current palette.
function getPieceColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--piece-color')
    .trim();
}
function getPieceGlow() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--piece-glow')
    .trim();
}

let drag = null;

/**
 * Attach all drag / touch input handling.
 * @param {HTMLElement} trayEl   - The tray element (event delegation root).
 * @param {HTMLElement} gridEl   - The 9×9 grid element.
 * @param {() => number[][]} getGrid - Returns the live grid state.
 * @param {Function} onPlace     - Called with (piece, row, col) on valid drop.
 */
export function initInput(trayEl, gridEl, getGrid, onPlace, isBusy) {
  trayEl.addEventListener('mousedown', onStart);
  trayEl.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);

  function pointer(e) {
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
  }

  function onStart(e) {
    const pieceEl = e.target.closest('.piece-preview');
    if (!pieceEl) return;
    // Don't start a drag while the game is animating a placement.
    if (isBusy && isBusy()) return;
    e.preventDefault();

    const isTouch = !!e.touches;
    const { x, y } = pointer(e);
    const piece = JSON.parse(pieceEl.dataset.piece);

    const gridRect = gridEl.getBoundingClientRect();
    const cellSize = gridRect.width / 9;
    const maxCol = Math.max(...piece.cells.map(([, c]) => c));

    // On mouse: remember exactly where inside the preview the user grabbed.
    // On touch: grabX/grabY are unused — position is derived from finger on grid.
    let grabX = 0,
      grabY = 0;
    if (!isTouch) {
      const rect = pieceEl.getBoundingClientRect();
      grabX = x - rect.left;
      grabY = y - rect.top;
    }

    const ghost = buildGhost(piece, cellSize);
    document.body.appendChild(ghost);
    pieceEl.classList.add('dragging');

    drag = {
      piece,
      ghost,
      pieceEl,
      gridEl,
      cellSize,
      grabX,
      grabY,
      isTouch,
      getGrid,
      onPlace,
      row: null,
      col: null,
      valid: false,
    };
    updateDrag(x, y);
  }

  function onMove(e) {
    if (!drag) return;
    // Mouse button released outside the browser window: no mouseup fires on
    // the document, so we detect the stale drag here and cancel it cleanly.
    if (!drag.isTouch && e.buttons === 0) {
      onEnd();
      return;
    }
    e.preventDefault();
    const { x, y } = pointer(e);
    updateDrag(x, y);
  }

  function onEnd() {
    if (!drag) return;
    const { ghost, pieceEl, valid, row, col, piece, onPlace, gridEl } = drag;

    ghost.remove();
    clearHighlights(gridEl);
    pieceEl.classList.remove('dragging'); // always restore full opacity

    if (valid && row !== null && col !== null) {
      onPlace(piece, row, col);
    }

    drag = null;
  }

  function updateDrag(x, y) {
    const { ghost, grabX, grabY, cellSize, piece, gridEl, getGrid, isTouch } =
      drag;
    const rect = gridEl.getBoundingClientRect();

    const maxRow = Math.max(...piece.cells.map(([r]) => r));
    const maxCol = Math.max(...piece.cells.map(([, c]) => c));

    let row, col, ghostLeft, ghostTop;

    if (isTouch) {
      // Map finger directly to a grid cell.
      const fingerCol = Math.floor((x - rect.left) / cellSize);
      const fingerRow = Math.floor((y - rect.top) / cellSize);

      // Centre piece horizontally on finger; place piece 1 row above finger
      // so it stays fully visible and not obscured by the finger.
      col = Math.max(
        0,
        Math.min(fingerCol - Math.round(maxCol / 2), 8 - maxCol),
      );
      row = Math.max(0, Math.min(fingerRow - maxRow - 1, 8 - maxRow));

      // Ghost snapped to exact grid pixel coordinates.
      ghostLeft = rect.left + col * cellSize;
      ghostTop = rect.top + row * cellSize;
    } else {
      // Mouse: top-left of ghost follows the grab offset.
      ghostLeft = x - grabX;
      ghostTop = y - grabY;
      col = Math.floor((ghostLeft - rect.left) / cellSize);
      row = Math.floor((ghostTop - rect.top) / cellSize);
    }

    ghost.style.left = `${ghostLeft}px`;
    ghost.style.top = `${ghostTop}px`;

    drag.row = row;
    drag.col = col;

    const fullyInside =
      row >= 0 && col >= 0 && row + maxRow < 9 && col + maxCol < 9;
    if (fullyInside) {
      const cells = piece.cells.map(([dr, dc]) => [row + dr, col + dc]);
      const valid = isValidPlacement(getGrid(), piece, row, col);
      drag.valid = valid;
      highlightCells(gridEl, cells, valid);
    } else {
      drag.valid = false;
      clearHighlights(gridEl);
    }
  }
}

// Build the floating ghost element that follows the pointer during drag.
function buildGhost(piece, cellSize) {
  const maxRow = Math.max(...piece.cells.map(([r]) => r));
  const maxCol = Math.max(...piece.cells.map(([, c]) => c));

  const ghost = document.createElement('div');
  ghost.className = 'piece-ghost';
  ghost.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:1000',
    'opacity:0.84',
    'display:grid',
    `grid-template-columns:repeat(${maxCol + 1},${cellSize}px)`,
    `grid-template-rows:repeat(${maxRow + 1},${cellSize}px)`,
    'gap:1px',
  ].join(';');

  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const cell = document.createElement('div');
      const filled = piece.cells.some(([pr, pc]) => pr === r && pc === c);
      cell.style.cssText = [
        `width:${cellSize}px`,
        `height:${cellSize}px`,
        'border-radius:3px',
        `background:${filled ? getPieceColor() : 'transparent'}`,
        filled ? `box-shadow:0 2px 8px ${getPieceGlow()}` : '',
      ].join(';');
      ghost.appendChild(cell);
    }
  }

  return ghost;
}
