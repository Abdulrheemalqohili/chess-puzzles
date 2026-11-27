/* ============================================
   game.js — منطق اللعبة الشامل
   ============================================ */

const Game = (() => {
  let chess = null;
  let puzzleData = null;
  let solutionIndex = 0;
  let selectedSquare = null;
  let isLocked = false;
  let playerColor = 'w';
  let score = 0;
  let streak = 0;
  let bestStreak = parseInt(localStorage.getItem('chess_best_streak') || '0', 10);

  const sndMove = new Audio("assets/sounds/move.mp3");
  const sndCapture = new Audio("assets/sounds/capture.mp3");
  const sndError = new Audio("assets/sounds/error.mp3");

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
    updateUI(); // عرض أفضل سلسلة محفوظة عند البدء
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
    
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) diffSelect.addEventListener('change', fetchPuzzle);
  }

  async function fetchPuzzle() {
    setLoading(true);
    setStatus('', '');
    els.btnNext.disabled = true;
    els.btnHint.disabled = true;

    try {
      const diff = document.getElementById('difficulty-select')?.value || 'normal';
      const res = await fetch('https://lichess.org/api/puzzle/next?difficulty=' + diff);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      
      puzzleData = data.puzzle;
      puzzleData.pgn = data.game.pgn;
      
      loadPuzzle();
    } catch (err) {
      console.error('فشل جلب اللغز:', err);
      setStatus('⚠️ تعذّر جلب اللغز. تأكد من الإنترنت.', 'error');
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
    
    playerColor = chess.turn();
    Board.render(chess.fen(), playerColor === 'b');
    
    const history = chess.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      Board.highlightLastMove(last.from, last.to);
    }
    
    els.counter.textContent = `#${puzzleData.id}`;
    
    const turn = playerColor === 'w' ? 'الأبيض' : 'الأسود';
    els.instruction.textContent = `الخصم لعب للتو. دورك (${turn})`;
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
        if ((turn === 'w' && isWhitePiece) || (turn === 'b' && isBlackPiece)) {
          selectedSquare = squareName;
          Board.selectSquare(squareName);
          
          // إظهار النقلات المتاحة
          const moves = chess.moves({ square: squareName, verbose: true });
          Board.showLegalMoves(moves);
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

    if (!expectedMove.startsWith(userMove)) {
      sndError.play().catch(()=>{});
      Board.clearSelection();
      Board.markTarget(to, false);
      setStatus('❌ ليست النقلة الصحيحة', 'error');
      resetStreak();
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
      return;
    }

    let move = chess.move({ from, to, promotion: 'q' });
    if (!move && expectedMove.length > 4) {
        move = chess.move({ from, to, promotion: expectedMove[4] });
    }

    if (!move) {
      sndError.play().catch(()=>{});
      setStatus('❌ نقلة غير قانونية', 'error');
      Board.clearSelection();
      selectedSquare = null;
      return;
    }

    if (move.flags.includes('c') || move.flags.includes('e')) {
      sndCapture.play().catch(()=>{});
    } else {
      sndMove.play().catch(()=>{});
    }

    Board.movePiece(from, to);
    Board.clearSelection();
    Board.highlightLastMove(from, to);
    selectedSquare = null;
    solutionIndex++;

    if (solutionIndex >= puzzleData.solution.length) {
      puzzleSolved();
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
        if (move.flags.includes('c') || move.flags.includes('e')) {
          sndCapture.play().catch(()=>{});
        } else {
          sndMove.play().catch(()=>{});
        }
        Board.render(chess.fen(), playerColor === 'b');
        Board.highlightLastMove(from, to);
      }
      solutionIndex++;
      isLocked = false;

      if (solutionIndex >= puzzleData.solution.length) {
        puzzleSolved();
      } else {
        setStatus(`🎯 دورك الآن`, '');
      }
    }, 500);
  }

  function puzzleSolved() {
    setStatus('🎉 أحسنت! لغز مكتمل', 'success');
    els.btnNext.disabled = false;
    score++;
    streak++;
    
    // حفظ أفضل سلسلة
    if (streak > bestStreak) {
      bestStreak = streak;
      localStorage.setItem('chess_best_streak', bestStreak);
    }
    
    updateUI();
    
    if (streak === 3) setStatus('🔥 سلسلة رائعة! 3 ألغاز متتالية', 'success');
    if (streak === 5) setStatus('🌟 أنت محترف! 5 ألغاز متتالية', 'success');
    if (streak >= 10) setStatus('👑 أسطورة! 10 ألغاز متتالية', 'success');
  }

  function resetStreak() {
    if (streak > 0) {
      streak = 0;
      updateUI();
    }
  }

  function updateUI() {
    const textScore = document.getElementById('progress-text');
    const textStreak = document.getElementById('streak-text');
    const textBest = document.getElementById('best-streak-text');
    
    if (textScore) textScore.textContent = `🏆 ${score}`;
    if (textStreak) {
      textStreak.textContent = `🔥 ${streak}`;
      textStreak.classList.add('pop');
      setTimeout(() => textStreak.classList.remove('pop'), 200);
    }
    if (textBest) textBest.textContent = `أفضل: ${bestStreak}`;
  }

  function showHint() {
    if (!puzzleData || !puzzleData.solution) return;
    const nextMove = puzzleData.solution[solutionIndex];
    if (nextMove) {
      setStatus('💡 القطعة المضيئة هي التي يجب تحريكها', '');
      Board.highlightHint(nextMove.slice(0, 2), nextMove.slice(2, 4));
    }
  }

  function resetPuzzle() {
    if (puzzleData) loadPuzzle();
  }

  function playAgain() {
    hideWinModal();
    score = 0;
    streak = 0;
    updateUI();
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

  function showWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function hideWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.add('hidden');
  }

  return { init, playAgain, updateUI };
})();
