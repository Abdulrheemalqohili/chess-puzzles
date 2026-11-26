/* ============================================
   board.js — رسم رقعة الشطرنج وعرض القطع (صور SVG)
   + إضافة إحداثيات الحواف
   ============================================ */

const Board = (() => {
  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const PIECE_MAP = {
    'K': 'wK', 'Q': 'wQ', 'R': 'wR', 'B': 'wB', 'N': 'wN', 'P': 'wP',
    'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP'
  };

  let boardEl = null;
  let currentFen = null;

  function fenToGrid(fen) {
    const rows = fen.split(' ')[0].split('/');
    return rows.map((row) => {
      const cells = [];
      for (const ch of row) {
        if (/\d/.test(ch)) {
          for (let i = 0; i < parseInt(ch, 10); i++) cells.push('');
        } else {
          cells.push(ch);
        }
      }
      return cells;
    });
  }

  function coordsToSquare(row, col) {
    return FILES[col] + RANKS[row];
  }

  function render(fen) {
    currentFen = fen;
    const grid = fenToGrid(fen);
    boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    grid.forEach((rowArr, rowIdx) => {
      rowArr.forEach((pieceChar, colIdx) => {
        const square = document.createElement('div');
        const isLight = (rowIdx + colIdx) % 2 === 0;
        square.className = `square ${isLight ? 'light' : 'dark'}`;
        square.dataset.square = coordsToSquare(rowIdx, colIdx);
        square.dataset.row = rowIdx;
        square.dataset.col = colIdx;

        // إضافة إحداثيات الحواف
        // الأحرف (a-h) على الصف السفلي (rowIdx === 7)
        if (rowIdx === 7) {
          square.dataset.file = FILES[colIdx];
        }
        // الأرقام (1-8) على العمود الأيسر (colIdx === 0)
        if (colIdx === 0) {
          square.dataset.rank = RANKS[rowIdx];
        }

        if (pieceChar) {
          const pieceEl = document.createElement('span');
          pieceEl.className = 'piece';
          pieceEl.dataset.piece = pieceChar;
          
          const imgName = PIECE_MAP[pieceChar];
          if (imgName) {
            pieceEl.innerHTML = `<img src="assets/img/pieces/${imgName}.svg" alt="${pieceChar}" class="piece-img" />`;
          }
          
          square.appendChild(pieceEl);
        }

        boardEl.appendChild(square);
      });
    });
  }

  function clearSelection() {
    boardEl.querySelectorAll('.square').forEach((sq) => {
      sq.classList.remove('selected', 'target', 'wrong', 'move-hint', 'capture');
    });
  }

  function selectSquare(squareName) {
    clearSelection();
    const sq = boardEl.querySelector(`[data-square="${squareName}"]`);
    if (sq) sq.classList.add('selected');
  }

  function markTarget(squareName, correct) {
    const sq = boardEl.querySelector(`[data-square="${squareName}"]`);
    if (sq) sq.classList.add(correct ? 'target' : 'wrong');
  }

  function getPieceAt(squareName) {
    const sq = boardEl.querySelector(`[data-square="${squareName}"] .piece`);
    return sq ? sq.dataset.piece : null;
  }

  function movePiece(from, to) {
    const fromSq = boardEl.querySelector(`[data-square="${from}"]`);
    const toSq = boardEl.querySelector(`[data-square="${to}"]`);
    if (!fromSq || !toSq) return;

    const piece = fromSq.querySelector('.piece');
    if (!piece) return;

    const capturedPiece = toSq.querySelector('.piece');
    if (capturedPiece) capturedPiece.remove();

    toSq.appendChild(piece);
  }

  return {
    render,
    clearSelection,
    selectSquare,
    markTarget,
    getPieceAt,
    movePiece,
    coordsToSquare,
  };
})();
