const KEY = 'freecul_best';

export function getBest() {
  const v = localStorage.getItem(KEY);
  return v !== null ? parseInt(v, 10) : null;
}

export function updateBest(moves) {
  const prev = getBest();
  if (prev === null || moves < prev) {
    localStorage.setItem(KEY, String(moves));
    return true;
  }
  return false;
}
