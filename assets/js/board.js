/* ============================================
   board.js — رسم رقعة الشطرنج وعرض القطع
   ============================================ */

const Board = (() => {
  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // رموز القطع (Unicode)
  const PIECE_SYMBOLS = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  };

  let boardEl = null;
  let currentFen = null;

  /**
   * تحويل FEN إلى مصفوفة 8×8 (صفوف)
   * @param {string} fen
   * @returns {string[][]}
   */
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

  /**
   * تحويل إحداثيات (file, rank) إلى اسم مربع
   * @param {number} row — صف (0-7)
   * @param {number} col — عمود (0-7)
   * @returns {string} مثل "e4"
   */
  function coordsToSquare(row, col) {
    return FILES[col] + RANKS[row];
  }

  /**
   * رسم الرقعة كاملة من FEN
   * @param {string} fen
   */
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

        if (pieceChar) {
          const pieceEl = document.createElement('span');
          pieceEl.className = 'piece';
          pieceEl.textContent = PIECE_SYMBOLS[pieceChar] || '';
          pieceEl.dataset.piece = pieceChar;
          square.appendChild(pieceEl);
        }

        boardEl.appendChild(square);
      });
    });
  }

  /**
   * إزالة كل التحديدات من الرقعة
   */
  function clearSelection() {
    boardEl.querySelectorAll('.square').forEach((sq) => {
      sq.classList.remove('selected', 'target', 'wrong', 'move-hint', 'capture');
    });
  }

  /**
   * تمييز مربع محدد
   * @param {string} squareName
   */
  function selectSquare(squareName) {
    clearSelection();
    const sq = boardEl.querySelector(`[data-square="${squareName}"]`);
    if (sq) sq.classList.add('selected');
  }

  /**
   * تمييز مربع كهدف صحيح أو خاطئ
   * @param {string} squareName
   * @param {boolean} correct
   */
  function markTarget(squareName, correct) {
    const sq = boardEl.querySelector(`[data-square="${squareName}"]`);
    if (sq) sq.classList.add(correct ? 'target' : 'wrong');
  }

  /**
   * جلب القطعة في مربع معين
   * @param {string} squareName
   * @returns {string|null}
   */
  function getPieceAt(squareName) {
    const sq = boardEl.querySelector(`[data-square="${squareName}"] .piece`);
    return sq ? sq.dataset.piece : null;
  }

  /**
   * نقل قطعة بصرياً (بدون قواعد الشطرنج)
   * @param {string} from
   * @param {string} to
   */
  function movePiece(from, to) {
    const fromSq = boardEl.querySelector(`[data-square="${from}"]`);
    const toSq = boardEl.querySelector(`[data-square="${to}"]`);
    if (!fromSq || !toSq) return;

    const piece = fromSq.querySelector('.piece');
    if (!piece) return;

    // احذف أي قطعة في الهدف
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

