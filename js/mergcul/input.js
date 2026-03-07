const SWIPE_MIN = 30; // px

export function initInput(el, onMove) {
  let touchStart = null;

  // ── KEYBOARD ────────────────────────────────────────────────
  const KEY_MAP = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  };

  function onKeyDown(e) {
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      onMove(dir);
    }
  }

  // ── TOUCH SWIPE ─────────────────────────────────────────────
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (Math.max(adx, ady) < SWIPE_MIN) return;
    if (adx > ady) onMove(dx > 0 ? 'right' : 'left');
    else onMove(dy > 0 ? 'down' : 'up');
  }

  window.addEventListener('keydown', onKeyDown);
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchend', onTouchEnd);

  return function destroy() {
    window.removeEventListener('keydown', onKeyDown);
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchend', onTouchEnd);
  };
}
