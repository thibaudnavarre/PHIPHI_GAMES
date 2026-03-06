export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];
export const VALUES = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};

export function isRed(card) {
  return card.suit === '♥' || card.suit === '♦';
}
export function isBlack(card) {
  return card.suit === '♠' || card.suit === '♣';
}

export function makeCard(suit, rank) {
  return { suit, rank, value: VALUES[rank] };
}

export function makeDeck() {
  const deck = [];
  for (const suit of SUITS)
    for (const rank of RANKS) deck.push(makeCard(suit, rank));
  return deck;
}

// Fisher-Yates in-place shuffle
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
