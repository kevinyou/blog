export type Piece = {
	id: string;
	top: number | null;
	bottom: number | null;
	left: number | null;
	right: number | null;
}

export const generatePieces = (N: number) => {
  // Original pieces before scrambling
  const originalPieces: Piece[][] = [];

  // Initialize pieces
  for (let i = 0; i < N; i++) {
    const row: Piece[] = [];
    for (let j = 0; j < N; j++) {
      const piece: Piece = {
        id: `${i}-${j}`,
        top: null,
        bottom: null,
        left: null,
        right: null,
      };

      row.push(piece);
    }
    originalPieces.push(row);
  }

  // How many pair of edges in a 2x2 grid? 4
  // How many pair of edges in a 3x3 grid? 6 horizontal, so wlog 6 vertical, so 12 total
  // How many pair of edges in a 4x4 grid? 12 horizontal, so wlog 12 vertical, so 24 total
  // How many pair of edges in a 5x5 grid? 20 horizontal, so wlog 40 vertical, so 40 total
  // How many pair of edges in a 6x6 grid? 30 horizontal, so wlog 30 vertical, so 60 total
  // How many pair of edges in a nxn grid? n(n-1) horizontal, so 2n(n-1) total
  // Need 2 * N * ( N - 1) unique edge names
  const edgeNames: number[] = new Array(2 * N * (N - 1))
    .fill(0)
    .map((_, i) => i);
  let edgeIndex = 0;

  // Initialize horizontal edges
  for (let row of originalPieces) {
    for (let leftPieceIndex = 0; leftPieceIndex < N - 1; leftPieceIndex++) {
      const rightPieceIndex = leftPieceIndex + 1;

      const edgeName = edgeNames[edgeIndex];

      row[leftPieceIndex].right = edgeName;
      row[rightPieceIndex].left = edgeName;

      edgeIndex++;
    }
  }

  // Initialize vertical edges
  for (let colIndex = 0; colIndex < N; colIndex++) {
    for (let topPieceIndex = 0; topPieceIndex < N - 1; topPieceIndex++) {
      const bottomPieceIndex = topPieceIndex + 1;
      const edgeName = edgeNames[edgeIndex];

      originalPieces[topPieceIndex][colIndex].bottom = edgeName;
      originalPieces[bottomPieceIndex][colIndex].top = edgeName;

      edgeIndex++;
    }
  }

  return expand1dTo2d(
    shuffleArray(
      flatten2dTo1d(
        originalPieces
      )
    ),
    N
  )
};

export const flatten2dTo1d = <T>(grid: T[][]): T[] => {
  return grid.flatMap(row => [...row]);
}

export const expand1dTo2d = <T>(elements: T[], n: number): T[][] => {
  const grid: T[][] = [];

  for (let i = 0; i < elements.length; i += n) {
    grid.push(elements.slice(i, i + n));
  }
  return grid;
}

const shuffleArray = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
