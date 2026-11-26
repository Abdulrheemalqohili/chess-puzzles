/* ============================================
   game.js — منطق اللعبة والتحقق الحقيقي
   يستخدم chess.js للتحقق من صحة النقلة وكش المات
   ============================================ */

const Game = (() => {
  let currentIndex = 0;
  let currentPuzzle = null;
  let selectedSquare = null;
  let chess = null; // نسخة chess.js للتحقق

  const els = {};

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

  function bindEvents() {
    document.getElementById('board').addEventListener('click', onBoardClick);
    els.btnHint.addEventListener('click', showHint);
    els.btnReset.addEventListener('click', resetPuzzle);
    els.btnNext.addEventListener('click', nextPuzzle);
    const btnAgain = document.getElementById('btn-play-again');
    if (btnAgain) btnAgain.addEventListener('click', playAgain);
  }

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

    // تهيئة محرك الشطرنج بالوضعية
    chess = new Chess(puzzle.fen);

    Board.render(puzzle.fen);
    els.counter.textContent = `${index + 1} / ${getPuzzleCount()}`;
    els.instruction.textContent = puzzle.instruction;
    els.btnNext.disabled = true;
    setStatus('', '');
    Storage.saveCurrent(index);
    updateProgress();
  }

  function onBoardClick(e) {
    const squareEl = e.target.closest('.square');
    if (!squareEl) return;

    const squareName = squareEl.dataset.square;
    const piece = Board.getPieceAt(squareName);

    if (!selectedSquare) {
      if (piece) {
        selectedSquare = squareName;
        Board.selectSquare(squareName);
      }
      return;
    }

    if (squareName === selectedSquare) {
      selectedSquare = null;
      Board.clearSelection();
      return;
    }

    attemptMove(selectedSquare, squareName);
  }

  function attemptMove(from, to) {
    // التحقق عبر chess.js — هل النقلة قانونية؟
    const move = chess.move({ from, to, promotion: 'q' });

    if (!move) {
      // نقلة غير قانونية
      Board.markTarget(to, false);
      setStatus('❌ نقلة غير قانونية', 'error');
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
      return;
    }

    // النقلة قانونية — هل تُنتج كش مات؟
    if (chess.in_checkmate()) {
      Board.movePiece(from, to);
      Board.clearSelection();
      Board.markTarget(to, true);
      selectedSquare = null;
      setStatus('🎉 أحسنت! كش مات صحيح', 'success');
      Storage.markSolved(currentIndex);
      updateProgress();
      els.btnNext.disabled = false;
      if (currentIndex === getPuzzleCount() - 1) {
        setTimeout(() => showWinModal(), 500);
      }
    } else {
      // نقلة قانونية لكن ليست كش مات — نتراجع
      chess.undo();
      Board.markTarget(to, false);
      setStatus('❌ ليست كش مات، حاول مجدداً', 'error');
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
    }
  }

  function showHint() {
    setStatus(`💡 ${currentPuzzle.hint}`, '');
  }

  function resetPuzzle() {
    selectedSquare = null;
    chess = new Chess(currentPuzzle.fen);
    Board.render(currentPuzzle.fen);
    els.btnNext.disabled = true;
    setStatus('', '');
  }

  function nextPuzzle() {
    loadPuzzle(currentIndex + 1);
  }

  function updateProgress() {
    const solved = Storage.getSolved().length;
    const total = getPuzzleCount();
    const pct = total ? Math.round((solved / total) * 100) : 0;
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    if (fill) fill.style.width = pct + "%";
    if (text) text.textContent = solved + " / " + total;
  }

  function setStatus(msg, type) {
    els.status.textContent = msg;
    els.status.className = 'status-message';
    if (type) els.status.classList.add(type);
  }

  function showWinModal() {
    const modal = document.getElementById("win-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function hideWinModal() {
    const modal = document.getElementById("win-modal");
    if (modal) modal.classList.add("hidden");
  }

  function playAgain() {
    Storage.reset();
    hideWinModal();
    loadPuzzle(0);
  }

  return { init, playAgain };
})();
