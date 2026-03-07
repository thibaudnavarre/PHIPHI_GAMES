// Tap/click to place a tile on any empty cell.
// Hover (mouse) and touch-drag show a highlight on the targeted cell.
//
// @param {HTMLElement} gridEl  - The 7×7 grid container.
// @param {Function}    onPlace - Called with (row, col) on a valid tap/click.
// @param {Function}    isBusy  - Returns true while the game is animating.
function cellAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el?.closest('.cell') ?? null;
}

export function initInput(gridEl, onPlace, isBusy) {
  let lastHovered = null;

  function setHover(cell) {
    if (cell === lastHovered) return;
    lastHovered?.classList.remove('hover');
    lastHovered = null;
    if (cell && gridEl.contains(cell) && !cell.classList.contains('occupied')) {
      cell.classList.add('hover');
      lastHovered = cell;
    }
  }

  function clearHover() {
    lastHovered?.classList.remove('hover');
    lastHovered = null;
  }

  // ── MOUSE ────────────────────────────────────────────────
  gridEl.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return; // handled separately
    setHover(cellAt(e.clientX, e.clientY));
  });

  gridEl.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    clearHover();
  });

  gridEl.addEventListener('click', (e) => {
    if (isBusy?.()) return;
    const cell = e.target.closest('.cell');
    if (!cell || cell.classList.contains('occupied')) return;
    clearHover();
    onPlace(+cell.dataset.row, +cell.dataset.col);
  });

  // ── TOUCH ────────────────────────────────────────────────
  // touchmove: track finger position and show a placement preview.
  // touchend:  place the tile at the last hovered cell.
  let touchTarget = null;

  gridEl.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      const t = e.touches[0];
      touchTarget = cellAt(t.clientX, t.clientY);
      setHover(touchTarget);
    },
    { passive: false },
  );

  gridEl.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
      const t = e.touches[0];
      touchTarget = cellAt(t.clientX, t.clientY);
      setHover(touchTarget);
    },
    { passive: false },
  );

  gridEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    const cell = touchTarget;
    touchTarget = null;
    clearHover();

    if (!cell || cell.classList.contains('occupied')) return;
    if (isBusy?.()) return;
    onPlace(+cell.dataset.row, +cell.dataset.col);
  });

  gridEl.addEventListener('touchcancel', () => {
    touchTarget = null;
    clearHover();
  });
}
