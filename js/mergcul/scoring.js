const KEY = 'mergcul_best';

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
