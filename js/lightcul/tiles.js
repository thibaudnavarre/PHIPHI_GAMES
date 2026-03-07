export const TILE_SLASH = '/';
export const TILE_BACKSLASH = '\\';
export const TILE_CROSS = '+';

// Weighted random draw: 45% /, 45% \, 10% +
export function getRandomTile() {
  const r = Math.random();
  if (r < 0.45) return TILE_SLASH;
  if (r < 0.9) return TILE_BACKSLASH;
  return TILE_CROSS;
}

// CSS class name for a given tile type.
export function tileClass(type) {
  if (type === TILE_SLASH) return 'tile-slash';
  if (type === TILE_BACKSLASH) return 'tile-backslash';
  if (type === TILE_CROSS) return 'tile-cross';
  return '';
}
