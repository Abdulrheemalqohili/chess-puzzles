/* ============================================
   game.js — منطق اللعبة مع Lichess API
   يدعم ألغازاً لا نهائية ومتعددة النقلات
   ============================================ */

const Game = (() => {
  let chess = null;
  let puzzleData = null;
  let solutionIndex = 0;
  let selectedSquare = null;
  let isLocked = false;
  let score = 0;

  const els = {};

  function init() {
    els.counter = document.getElementById('puzzle-counter');
    els.instruction = document.getElementById('puzzle-instruction');
    els.status = document.getElementById('status-message');
    els.btnHint = document.getElementById('btn-hint');
    els.btnReset = document.getElementById('btn-reset');
    els.btnNext = document.getElementById('btn-next');
    els.btnNew = document.getElementById('btn-new');
    els.loading = document.getElementById('loading-message');

    bindEvents();
    fetchPuzzle();
  }

  function bindEvents() {
    document.getElementById('board').addEventListener('click', onBoardClick);
    els.btnHint.addEventListener('click', showHint);
    els.btnReset.addEventListener('click', resetPuzzle);
    els.btnNext.addEventListener('click', fetchPuzzle);
    els.btnNew.addEventListener('click', fetchPuzzle);

    const btnAgain = document.getElementById('btn-play-again');
    if (btnAgain) btnAgain.addEventListener('click', playAgain);
  }

  // جلب لغز من Lichess
  async function fetchPuzzle() {
    setLoading(true);
    setStatus('', '');
    els.btnNext.disabled = true;
    els.btnHint.disabled = true;

    try {
      const res = await fetch('https://lichess.org/api/puzzle/next');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      
      puzzleData = data.puzzle;
      puzzleData.pgn = data.game.pgn;
      
      loadPuzzle();
    } catch (err) {
      console.error('فشل جلب اللغز:', err);
      setStatus('⚠️ تعذّر جلب اللغز. تأكد من الإنترنت أو استخدم السيرفر المحلي.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function loadPuzzle() {
    solutionIndex = 0;
    selectedSquare = null;
    isLocked = false;
    els.btnNext.disabled = true;
    els.btnHint.disabled = false;
    setStatus('', '');

    chess = new Chess();
    chess.load_pgn(puzzleData.pgn);
    
    Board.render(chess.fen());
    els.counter.textContent = `#${puzzleData.id}`;
    
    const turn = chess.turn() === 'w' ? 'الأبيض' : 'الأسود';
    els.instruction.textContent = `الخصم لعب للتو. دورك (${turn}) — اعثر على النقلة الصحيحة`;
  }

  function onBoardClick(e) {
    if (isLocked) return;
    const squareEl = e.target.closest('.square');
    if (!squareEl) return;

    const squareName = squareEl.dataset.square;
    const piece = Board.getPieceAt(squareName);

    if (!selectedSquare) {
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        const isBlackPiece = piece === piece.toLowerCase();
        const turn = chess.turn();
        
        // الإصلاح: نتحقق أن القطعة تنتمي للاعب الذي عليه الدور
        if ((turn === 'w' && isWhitePiece) || (turn === 'b' && isBlackPiece)) {
          selectedSquare = squareName;
          Board.selectSquare(squareName);
        }
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
    if (!puzzleData || !puzzleData.solution) return;

    const expectedMove = puzzleData.solution[solutionIndex];
    const userMove = from + to;

    // التحقق من النقلة
    if (!expectedMove.startsWith(userMove)) {
      Board.markTarget(to, false);
      setStatus('❌ ليست النقلة الصحيحة', 'error');
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
      return;
    }

    // تنفيذ النقلة
    let move = chess.move({ from, to, promotion: 'q' });
    
    if (!move && expectedMove.length > 4) {
        const promotionPiece = expectedMove[4];
        move = chess.move({ from, to, promotion: promotionPiece });
    }

    if (!move) {
      setStatus('❌ نقلة غير قانونية', 'error');
      Board.clearSelection();
      selectedSquare = null;
      return;
    }

    Board.movePiece(from, to);
    Board.clearSelection();
    selectedSquare = null;
    solutionIndex++;

    if (solutionIndex >= puzzleData.solution.length) {
      setStatus('🎉 أحسنت! لغز مكتمل', 'success');
      els.btnNext.disabled = false;
      incrementScore();
      return;
    }

    playOpponentMove();
  }

  function playOpponentMove() {
    if (solutionIndex >= puzzleData.solution.length) return;

    const oppMoveUci = puzzleData.solution[solutionIndex];
    const from = oppMoveUci.slice(0, 2);
    const to = oppMoveUci.slice(2, 4);
    const promotion = oppMoveUci.length > 4 ? oppMoveUci[4] : 'q';

    isLocked = true;
    setStatus('⏳ الخصم يلعب...', '');

    setTimeout(() => {
      const move = chess.move({ from, to, promotion });
      if (move) {
        Board.render(chess.fen()); // إعادة رسم الرقعة بالكامل
      }
      
      solutionIndex++;
      isLocked = false;

      if (solutionIndex >= puzzleData.solution.length) {
        setStatus('🎉 أحسنت! لغز مكتمل', 'success');
        els.btnNext.disabled = false;
        incrementScore();
      } else {
        const turn = chess.turn() === 'w' ? 'الأبيض' : 'الأسود';
        setStatus(`🎯 دورك الآن (${turn})`, '');
      }
    }, 500);
  }

  function showHint() {
    if (!puzzleData || !puzzleData.solution) return;
    const nextMove = puzzleData.solution[solutionIndex];
    if (nextMove) {
      const from = nextMove.slice(0, 2);
      const to = nextMove.slice(2, 4);
      setStatus(`💡 جرّب النقلة من ${from} إلى ${to}`, '');
    }
  }

  function resetPuzzle() {
    if (puzzleData) loadPuzzle();
  }

  function playAgain() {
    hideWinModal();
    score = 0;
    incrementScore(); // تصفير العداد
    fetchPuzzle();
  }

  function setStatus(msg, type) {
    els.status.textContent = msg;
    els.status.className = 'status-message';
    if (type) els.status.classList.add(type);
  }

  function setLoading(isLoading) {
    if (els.loading) els.loading.classList.toggle('hidden', !isLoading);
    if (els.btnNew) els.btnNew.disabled = isLoading;
  }

  function incrementScore() {
    const text = document.getElementById('progress-text');
    if (text) text.textContent = `🏆 ${score}`;
  }

  function showWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function hideWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.add('hidden');
  }

  return { init, playAgain, incrementScore };
})();
