const KEY = 'sudotris_best';

// Score formula: 10 pts × unique cells cleared × number of lines/boxes cleared simultaneously.
export function calcPoints(combo, cellCount) {
  return 10 * cellCount * combo;
}

export function getBest() {
  return parseInt(localStorage.getItem(KEY) ?? '0', 10);
}

// Saves score if it beats the current best. Returns true when a new best is set.
export function updateBest(score) {
  if (score > getBest()) {
    localStorage.setItem(KEY, String(score));
    return true;
  }
  return false;
}
