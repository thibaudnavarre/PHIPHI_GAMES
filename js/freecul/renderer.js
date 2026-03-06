import { isRed } from './deck.js';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const SUIT_SYMBOLS = ['\u2660', '\u2665', '\u2666', '\u2663'];
const HIDDEN_OFFSET = 14; // px between face-down cards in a column
const FACEUP_OFFSET = 26; // px between face-up cards in a column
const CARD_HEIGHT = 70; // approximate px card height for min-height calculation

// ── CARD FACTORIES ────────────────────────────────────────────────────────────
export function makeCardEl(card) {
  const el = document.createElement('div');
  el.className = 'fc-card' + (isRed(card) ? ' red' : '');
  el.dataset.suit = card.suit;
  el.dataset.rank = card.rank;
  el.dataset.value = card.value;
  el.innerHTML =
    `<span class="fc-rank-tl">${card.rank}</span>` +
    `<span class="fc-suit-center">${card.suit}</span>` +
    `<span class="fc-rank-br">${card.rank}</span>`;
  return el;
}

export function makeCardBack() {
  const el = document.createElement('div');
  el.className = 'fc-card face-down';
  return el;
}

// ── BUILD BOARD ───────────────────────────────────────────────────────────────
// Top row: [fd0][fd1][fd2][fd3][spacer][waste][stock]  (7 equal-flex slots)
// Columns: [col0][col1][col2][col3][col4][col5][col6]  (7 equal-flex columns)
export function buildBoard(container) {
  container.innerHTML = `
    <div id="fc-top-row">
      ${[0, 1, 2, 3]
        .map(
          (i) =>
            `<div class="fc-slot fc-foundation" data-fd="${i}">${SUIT_SYMBOLS[i]}</div>`,
        )
        .join('')}
      <div class="fc-spacer"></div>
      <div id="fc-waste"  class="fc-slot"></div>
      <div id="fc-stock"  class="fc-slot"></div>
    </div>
    <div id="fc-columns">
      ${[0, 1, 2, 3, 4, 5, 6]
        .map((i) => `<div class="fc-column" data-col="${i}"></div>`)
        .join('')}
    </div>
  `;
}

// ── SYNC STATE → DOM ──────────────────────────────────────────────────────────
export function renderState(container, state) {
  // Foundations
  container.querySelectorAll('.fc-foundation').forEach((slot, i) => {
    slot.innerHTML = '';
    if (state.foundations[i]) {
      slot.appendChild(makeCardEl(state.foundations[i]));
    } else {
      slot.textContent = SUIT_SYMBOLS[i];
    }
  });

  // Waste — show only the top card
  const wasteEl = container.querySelector('#fc-waste');
  wasteEl.innerHTML = '';
  if (state.waste.length) {
    const el = makeCardEl(state.waste[state.waste.length - 1]);
    el.dataset.src = 'waste';
    wasteEl.appendChild(el);
  }

  // Stock — card-back when has cards, reset icon when empty
  const stockEl = container.querySelector('#fc-stock');
  stockEl.innerHTML = '';
  stockEl.classList.toggle('fc-stock-empty', state.stock.length === 0);
  if (state.stock.length) {
    const back = makeCardBack();
    back.dataset.src = 'stock';
    stockEl.appendChild(back);
  } else {
    stockEl.textContent = '\u21ba';
  }

  // Columns — absolutely-positioned cards with staggered offsets
  container.querySelectorAll('.fc-column').forEach((colEl, i) => {
    colEl.innerHTML = '';
    const col = state.tableau[i];
    let top = 0;
    col.forEach((entry, j) => {
      const el = entry.faceUp ? makeCardEl(entry.card) : makeCardBack();
      el.style.top = `${top}px`;
      el.style.left = '0';
      el.style.width = '100%';
      el.dataset.col = i;
      el.dataset.index = j;
      colEl.appendChild(el);
      if (j < col.length - 1) {
        top += entry.faceUp ? FACEUP_OFFSET : HIDDEN_OFFSET;
      }
    });
    colEl.style.minHeight = `${top + CARD_HEIGHT}px`;
  });
}

// ── MOVE COUNTER ──────────────────────────────────────────────────────────────
export function setMoves(el, n) {
  if (el) el.textContent = n;
}

export function setBest(el, n) {
  if (el) el.textContent = n !== null ? n : '-';
}
