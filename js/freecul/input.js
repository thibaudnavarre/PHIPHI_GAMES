// ── FREECUL INPUT (Klondike Solitaire) ───────────────────────────────────────
// Stock tap  → onDraw()
// Card drag  → onMove(src, dst)
//   src: { type:'waste' } | { type:'tableau', col, index }
//   dst: { type:'foundation' } | { type:'tableau', col }

import { isRed } from './deck.js';

const DRAG_THRESHOLD = 8; // px of movement before drag starts

// ── GHOST ─────────────────────────────────────────────────────────────────────
let ghost = null;

function buildGhost(cards, refEl) {
  const rect = refEl.getBoundingClientRect();
  ghost = document.createElement('div');
  ghost.className = 'fc-ghost';
  ghost.style.width = `${rect.width}px`;
  cards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'fc-ghost-card' + (isRed(card) ? ' red' : '');
    el.style.setProperty('--ghost-offset', `${i * 26}px`);
    el.innerHTML =
      `<span class="fc-rank-tl">${card.rank}</span>` +
      `<span class="fc-suit-center">${card.suit}</span>` +
      `<span class="fc-rank-br">${card.rank}</span>`;
    ghost.appendChild(el);
  });
  const totalH = Math.max(
    (cards.length - 1) * 26 + rect.width * 1.4,
    rect.height,
  );
  ghost.style.height = `${totalH}px`;
  document.body.appendChild(ghost);
}

function moveGhost(x, y) {
  if (!ghost) return;
  ghost.style.left = `${x - ghost.offsetWidth / 2}px`;
  ghost.style.top = `${y - 24}px`;
}

function removeGhost() {
  ghost?.remove();
  ghost = null;
}

// ── HIT TEST ──────────────────────────────────────────────────────────────────
function findDropTarget(x, y, board) {
  const candidates = board.querySelectorAll('.fc-foundation, .fc-column');
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return el;
    }
  }
  return null;
}

// ── POINTER HELPERS ───────────────────────────────────────────────────────────
function getPoint(e) {
  return e.touches
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY };
}

function getEndPoint(e) {
  return e.changedTouches
    ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    : { x: e.clientX, y: e.clientY };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function initInput(board, getState, { onDraw, onMove, onAutoMove }) {
  let startPt = null;
  let dragging = false;
  let startEl = null; // the card element the touch/mouse started on
  let tapSrc = null; // src resolved eagerly for tap/double-tap
  let dragSrc = null;
  let dragCards = []; // card objects being dragged
  let dimmedEls = []; // elements whose opacity has been lowered

  // ── DOUBLE-TAP STATE ───────────────────────────────────────────────────────
  let lastTapEl = null;
  let lastTapTime = 0;

  // ── STOCK TAP ──────────────────────────────────────────────────────────────
  // Use touchend for instant response on iOS; fall back to click for desktop.
  let lastDrawTime = 0;
  function triggerDraw() {
    const now = Date.now();
    if (now - lastDrawTime < 300) return; // guard double-fire (touch + click)
    lastDrawTime = now;
    onDraw();
  }
  const stockEl = board.querySelector('#fc-stock');
  stockEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    triggerDraw();
  });
  stockEl.addEventListener('click', triggerDraw);

  // ── DRAG START ─────────────────────────────────────────────────────────────
  function onStart(e) {
    // Don't intercept stock touches here — handled above
    if (e.target.closest('#fc-stock')) return;

    const cardEl = e.target.closest('.fc-card');
    if (!cardEl || cardEl.classList.contains('face-down')) return;

    e.preventDefault();
    startEl = cardEl;
    startPt = getPoint(e);
    dragging = false;
    dragSrc = null;
    dragCards = [];
    dimmedEls = [];

    // Resolve tap source eagerly (needed for double-tap without a drag)
    tapSrc = null;
    const wasteEl_ = cardEl.closest('#fc-waste');
    const colEl_ = cardEl.closest('.fc-column');
    if (wasteEl_) {
      tapSrc = { type: 'waste' };
    } else if (colEl_) {
      tapSrc = {
        type: 'tableau',
        col: +colEl_.dataset.col,
        index: +cardEl.dataset.index,
      };
    }
  }

  // ── DRAG MOVE ──────────────────────────────────────────────────────────────
  function onMove_(e) {
    if (!startEl) return;

    const pt = getPoint(e);
    const dx = pt.x - startPt.x;
    const dy = pt.y - startPt.y;

    if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      const state = getState();
      const wasteEl = startEl.closest('#fc-waste');
      const colEl = startEl.closest('.fc-column');

      if (wasteEl) {
        if (!state.waste.length) {
          startEl = null;
          return;
        }
        dragSrc = { type: 'waste' };
        dragCards = [state.waste[state.waste.length - 1]];
        startEl.style.opacity = '0.2';
        dimmedEls = [startEl];
      } else if (colEl) {
        const col = +colEl.dataset.col;
        const index = +startEl.dataset.index;
        const entry = state.tableau[col][index];
        if (!entry?.faceUp) {
          startEl = null;
          return;
        }
        dragSrc = { type: 'tableau', col, index };
        dragCards = state.tableau[col].slice(index).map((e) => e.card);
        // Dim all cards from index onwards
        dimmedEls = Array.from(colEl.querySelectorAll('.fc-card')).filter(
          (el) => +el.dataset.index >= index,
        );
        dimmedEls.forEach((el) => (el.style.opacity = '0.2'));
      } else {
        startEl = null;
        return;
      }

      dragging = true;
      buildGhost(dragCards, startEl);
    }

    if (dragging) {
      e.preventDefault();
      moveGhost(pt.x, pt.y);
    }
  }

  // ── DRAG END ───────────────────────────────────────────────────────────────
  function onEnd(e) {
    if (!startEl) return;

    const pt = getEndPoint(e);
    const el = startEl; // capture before reset
    const src = tapSrc;

    if (dragging && dragSrc) {
      removeGhost();
      dimmedEls.forEach((el) => (el.style.opacity = ''));

      const target = findDropTarget(pt.x, pt.y, board);
      if (target) {
        let dst = null;
        if (target.classList.contains('fc-foundation')) {
          dst = { type: 'foundation' };
        } else if (target.classList.contains('fc-column')) {
          dst = { type: 'tableau', col: +target.dataset.col };
        }
        if (dst) onMove(dragSrc, dst);
      }
    } else if (src) {
      // Tap (no drag) — detect double-tap
      const now = Date.now();
      if (lastTapEl === el && now - lastTapTime < 350) {
        onAutoMove(src);
        lastTapEl = null;
        lastTapTime = 0;
      } else {
        lastTapEl = el;
        lastTapTime = now;
      }
    }

    startEl = null;
    startPt = null;
    tapSrc = null;
    dragging = false;
    dragSrc = null;
    dragCards = [];
    dimmedEls = [];
  }

  board.addEventListener('mousedown', onStart, { passive: false });
  board.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove_, { passive: false });
  document.addEventListener('touchmove', onMove_, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}
