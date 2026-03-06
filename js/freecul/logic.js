import { isBlack, isRed, makeDeck, shuffle } from './deck.js';

// ── STATE SHAPE ───────────────────────────────────────────────────────────────
// tableau    : Array(7) — each entry is { card, faceUp: bool }[]
// stock      : card[]   — face-down draw pile (top = last element)
// waste      : card[]   — drawn cards face-up (top = last element)
// foundations: card|null[4] — top card of each foundation, suit-indexed
// moves      : number

export const SUIT_INDEX = {
  '\u2660': 0,
  '\u2665': 1,
  '\u2666': 2,
  '\u2663': 3,
};

export function newGame() {
  const deck = shuffle(makeDeck());
  const tableau = Array.from({ length: 7 }, () => []);

  // Klondike deal: column i gets i face-down cards + 1 face-up card
  let di = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({ card: deck[di++], faceUp: row === col });
    }
  }

  return {
    tableau,
    stock: deck.slice(di), // remaining 24 cards
    waste: [],
    foundations: [null, null, null, null],
    moves: 0,
  };
}

// ── FOUNDATION ────────────────────────────────────────────────────────────────
export function canSendToFoundation(card, foundations) {
  const top = foundations[SUIT_INDEX[card.suit]];
  return top === null ? card.value === 1 : card.value === top.value + 1;
}

// ── TABLEAU ───────────────────────────────────────────────────────────────────
// In Klondike: only K can go on an empty column; otherwise opposite colour, one lower
export function canStackOn(card, target) {
  if (!target) return card.value === 13;
  const diffColour = isRed(card) ? isBlack(target) : isRed(target);
  return diffColour && card.value === target.value - 1;
}

export function isValidSequence(entries) {
  for (let i = 0; i < entries.length - 1; i++) {
    if (!canStackOn(entries[i + 1].card, entries[i].card)) return false;
  }
  return true;
}

// ── DRAW FROM STOCK ───────────────────────────────────────────────────────────
// Draw one card from stock to waste; if stock is empty, recycl waste back.
export function applyDraw(state) {
  const next = {
    ...state,
    tableau: state.tableau,
    stock: [...state.stock],
    waste: [...state.waste],
    moves: state.moves + 1,
  };
  if (next.stock.length === 0) {
    next.stock = next.waste.slice().reverse();
    next.waste = [];
  } else {
    next.waste.push(next.stock.pop());
  }
  return next;
}

// ── APPLY MOVE ────────────────────────────────────────────────────────────────
// src: { type: 'waste' }
//      { type: 'tableau', col: 0-6, index: 0-N }  (index = first card of stack)
// dst: { type: 'foundation' }
//      { type: 'tableau', col: 0-6 }
// Returns new state or null if illegal.
export function applyMove(state, src, dst) {
  const next = {
    tableau: state.tableau.map((col) => col.map((c) => ({ ...c }))),
    stock: [...state.stock],
    waste: [...state.waste],
    foundations: [...state.foundations],
    moves: state.moves + 1,
  };

  // Extract moving cards
  let moving; // { card, faceUp }[]
  if (src.type === 'waste') {
    if (!next.waste.length) return null;
    moving = [{ card: next.waste[next.waste.length - 1], faceUp: true }];
    next.waste.pop();
  } else if (src.type === 'tableau') {
    const col = next.tableau[src.col];
    if (!col[src.index] || !col[src.index].faceUp) return null;
    moving = col.splice(src.index);
    // Auto-flip newly exposed top card
    if (col.length && !col[col.length - 1].faceUp) {
      col[col.length - 1].faceUp = true;
    }
  } else {
    return null;
  }

  const topCard = moving[0].card;

  // Validate and place at destination
  if (dst.type === 'foundation') {
    if (moving.length !== 1) return null;
    if (!canSendToFoundation(topCard, next.foundations)) return null;
    next.foundations[SUIT_INDEX[topCard.suit]] = topCard;
  } else if (dst.type === 'tableau') {
    const col = next.tableau[dst.col];
    const topTarget = col.length ? col[col.length - 1].card : null;
    if (!canStackOn(topCard, topTarget)) return null;
    // Validate the dragged stack is an alternating sequence
    if (!isValidSequence(moving)) return null;
    col.push(...moving);
  } else {
    return null;
  }

  return next;
}

// ── WIN CHECK ─────────────────────────────────────────────────────────────────
export function isWon(state) {
  return state.foundations.every((f) => f !== null && f.value === 13);
}

// ── STUCK DETECTION ──────────────────────────────────────────────────────────
// Returns true if at least one legal action remains.
export function hasAnyMove(state) {
  const { tableau, stock, waste, foundations } = state;

  // Can still draw from stock
  if (stock.length > 0) return true;

  const colTop = (col) => (col.length ? col[col.length - 1] : null);

  // If stock is empty, all waste cards are reachable via recycling — check them all
  for (const card of waste) {
    if (canSendToFoundation(card, foundations)) return true;
    for (const col of tableau) {
      const top = colTop(col);
      if (top && !top.faceUp) continue;
      if (canStackOn(card, top ? top.card : null)) return true;
    }
  }

  // Check every face-up tableau card
  for (let s = 0; s < 7; s++) {
    const srcCol = tableau[s];
    for (let i = 0; i < srcCol.length; i++) {
      if (!srcCol[i].faceUp) continue;
      const card = srcCol[i].card;

      // Top card of column can go to foundation
      if (i === srcCol.length - 1 && canSendToFoundation(card, foundations))
        return true;

      // Any face-up card (start of a stack) can move to another column
      for (let d = 0; d < 7; d++) {
        if (d === s) continue;
        const dst = tableau[d];
        const top = colTop(dst);
        if (top && !top.faceUp) continue;
        if (canStackOn(card, top ? top.card : null)) return true;
      }
    }
  }

  return false;
}
