/* ============================================
   game.js — منطق اللعبة والتحقق من الحل
   ============================================ */

const Game = (() => {
  let currentIndex = 0;
  let currentPuzzle = null;
  let selectedSquare = null;

  // عناصر DOM
  const els = {};

  /**
   * تهيئة اللعبة — تُستدعى من main.js
   */
  function init() {
    els.counter = document.getElementById('puzzle-counter');
    els.instruction = document.getElementById('puzzle-instruction');
    els.status = document.getElementById('status-message');
    els.btnHint = document.getElementById('btn-hint');
    els.btnReset = document.getElementById('btn-reset');
    els.btnNext = document.getElementById('btn-next');

    bindEvents();
    loadPuzzle(Storage.getCurrent());
  }

  /**
   * ربط أحداث الأزرار والرقعة
   */
  function bindEvents() {
    document.getElementById('board').addEventListener('click', onBoardClick);
    els.btnHint.addEventListener('click', showHint);
    els.btnReset.addEventListener('click', resetPuzzle);
    els.btnNext.addEventListener('click', nextPuzzle);
  }

  /**
   * تحميل لغز حسب الفهرس
   * @param {number} index
   */
  function loadPuzzle(index) {
    const puzzle = getPuzzle(index);
    if (!puzzle) {
      setStatus('🎉 أكملت كل الألغاز!', 'success');
      els.btnNext.disabled = true;
      return;
    }

    currentIndex = index;
    currentPuzzle = puzzle;
    selectedSquare = null;

    Board.render(puzzle.fen);
    els.counter.textContent = `${index + 1} / ${getPuzzleCount()}`;
    els.instruction.textContent = puzzle.instruction;
    els.btnNext.disabled = true;
    setStatus('', '');
    Storage.saveCurrent(index);
  }

  /**
   * عند النقر على مربع
   * @param {MouseEvent} e
   */
  function onBoardClick(e) {
    const squareEl = e.target.closest('.square');
    if (!squareEl) return;

    const squareName = squareEl.dataset.square;
    const piece = Board.getPieceAt(squareName);

    // إذا لم يكن هناك مربع محدد
    if (!selectedSquare) {
      if (piece) {
        selectedSquare = squareName;
        Board.selectSquare(squareName);
      }
      return;
    }

    // النقر على نفس المربع = إلغاء التحديد
    if (squareName === selectedSquare) {
      selectedSquare = null;
      Board.clearSelection();
      return;
    }

    // محاولة نقل
    attemptMove(selectedSquare, squareName);
  }

  /**
   * محاولة نقل والتحقق من الصحة
   * @param {string} from
   * @param {string} to
   */
  function attemptMove(from, to) {
    const sol = currentPuzzle.solution;

    if (from === sol.from && to === sol.to) {
      // ✅ إجابة صحيحة
      Board.movePiece(from, to);
      Board.clearSelection();
      Board.markTarget(to, true);
      selectedSquare = null;
      setStatus('🎉 أحسنت! نقلة صحيحة', 'success');

      Storage.markSolved(currentIndex);
      els.btnNext.disabled = false;
    } else {
      // ❌ إجابة خاطئة
      Board.markTarget(to, false);
      setStatus('❌ ليست النقلة الصحيحة، حاول مجدداً', 'error');
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
    }
  }

  /**
   * عرض تلميح
   */
  function showHint() {
    setStatus(`💡 ${currentPuzzle.hint}`, '');
  }

  /**
   * إعادة اللغز من البداية
   */
  function resetPuzzle() {
    selectedSquare = null;
    Board.render(currentPuzzle.fen);
    els.btnNext.disabled = true;
    setStatus('', '');
  }

  /**
   * الانتقال للغز التالي
   */
  function nextPuzzle() {
    loadPuzzle(currentIndex + 1);
  }

  /**
   * تعيين رسالة الحالة
   * @param {string} msg
   * @param {string} type — 'success' | 'error' | ''
   */
  function setStatus(msg, type) {
    els.status.textContent = msg;
    els.status.className = 'status-message';
    if (type) els.status.classList.add(type);
  }

  return { init };
})();

