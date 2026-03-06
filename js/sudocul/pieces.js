// All 7 standard tetrominoes in fixed orientation — no rotation.
// Cells are [row, col] offsets from the top-left of the piece's bounding box.
export const PIECES = [
  { name: 'dot', cells: [[0, 0]] }, // █
  {
    name: 'I',
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  }, // ████
  {
    name: 'O',
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  }, // ██
  // ██
  {
    name: 'T',
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
  }, // ███
  //  █
  {
    name: 'S',
    cells: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
  }, //  ██
  // ██
  {
    name: 'Z',
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  }, // ██
  //  ██
  {
    name: 'J',
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  }, // █
  // ███
  {
    name: 'L',
    cells: [
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  }, //   █
  // ███
];

export function getRandomPiece() {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}
