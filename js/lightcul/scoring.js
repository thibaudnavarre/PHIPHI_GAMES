const KEY = 'lightcul_best';

// Score per turn: unique beam-path cells × (bounces + 1).
export function calcPoints(pathLen, bounces) {
  return pathLen * (bounces + 1);
}

// Bonus for clearing a full row/column entirely covered by the beam.
// 140 pts per line (7 cells × 20).
export function calcClearBonus(linesCleared) {
  return linesCleared * 7 * 20;
}

export function getBest() {
  return Number.parseInt(localStorage.getItem(KEY) ?? '0', 10);
}

// Saves score if it beats the current best. Returns true when a new record is set.
export function updateBest(score) {
  if (score > getBest()) {
    localStorage.setItem(KEY, String(score));
    return true;
  }
  return false;
}
