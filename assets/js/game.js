/* ============================================
   game.js — منطق اللعبة مع دعم Lichess API
   يدعم ألغازاً متعددة النقلات
   ============================================ */

const Game = (() => {
  let chess = null;
  let currentPuzzleData = null; // { fen, solution, lastMove, id }
  let solutionIndex = 0; // مؤشر في مصفوفة الحل
  let selectedSquare = null;
  let isLocked = false; // منع التفاعل أثناء تحريك الخصم

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
    fetchAndLoadPuzzle(); // ابدأ بجلب لغز
  }

  function bindEvents() {
    document.getElementById('board').addEventListener('click', onBoardClick);
    els.btnHint.addEventListener('click', showHint);
    els.btnReset.addEventListener('click', resetPuzzle);
    els.btnNext.addEventListener('click', fetchAndLoadPuzzle);
    els.btnNew.addEventListener('click', fetchAndLoadPuzzle);

    const btnAgain = document.getElementById('btn-play-again');
    if (btnAgain) btnAgain.addEventListener('click', playAgain);
  }

  // ---------- جلب اللغز من Lichess ----------
  async function fetchAndLoadPuzzle() {
    setLoading(true);
    setStatus('', '');
    els.btnNext.disabled = true;

    try {
      const res = await fetch('https://lichess.org/api/puzzle/next');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // تحقق من وجود البيانات المطلوبة
      if (!data.puzzle || !data.puzzle.fen || !data.puzzle.solution) {
        throw new Error('بيانات اللغز غير مكتملة');
      }

      loadPuzzle(data.puzzle);
    } catch (err) {
      console.error('فشل جلب اللغز:', err);
      setStatus('⚠️ تعذّر جلب لغز من الإنترنت. تحقق من الاتصال أو حاول لاحقاً.', 'error');
      // في حالة الفشل، جرّب استخدام لغز محلي احتياطي
      loadFallbackPuzzle();
    } finally {
      setLoading(false);
    }
  }

  function loadPuzzle(puzzleData) {
    currentPuzzleData = puzzleData;
    solutionIndex = 0;
    selectedSquare = null;
    isLocked = false;

    // تهيئة محرك الشطرنج
    chess = new Chess(puzzleData.fen);

    // تطبيق النقلة الأخيرة للخصم (إن وجدت)
    // ملاحظة: Lichess fen هو الوضعية *قبل* lastMove
    // نطبق lastMove يدوياً لجعل الوضعية جاهزة للاعب
    if (puzzleData.lastMove) {
      try {
        const from = puzzleData.lastMove.slice(0, 2);
        const to = puzzleData.lastMove.slice(2, 4);
        const promotion = puzzleData.lastMove.length > 4 ? puzzleData.lastMove[4] : undefined;
        chess.move({ from, to, promotion });
      } catch (e) {
        console.warn('فشل تطبيق lastMove:', e);
      }
    }

    // عرض الرقعة
    Board.render(chess.fen());
    els.counter.textContent = puzzleData.id || '—';
    els.instruction.textContent = 'اعثر على النقلة الصحيحة'; // يمكن تحسينها لاحقاً باستخدام themes
    els.btnNext.disabled = true;
    setStatus('', '');
  }

  function loadFallbackPuzzle() {
    // استخدام أول لغز من PUZZLES المحلي كخطة بديلة
    if (typeof PUZZLES !== 'undefined' && PUZZLES.length > 0) {
      const p = PUZZLES[0];
      loadPuzzle({
        id: 'محلي',
        fen: p.fen,
        solution: [p.solution.from + p.solution.to],
        lastMove: null,
      });
    } else {
      setStatus('⚠️ لا توجد ألغاز متاحة', 'error');
    }
  }

  // ---------- تفاعل المستخدم ----------
  function onBoardClick(e) {
    if (isLocked) return;
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
    if (!currentPuzzleData || !currentPuzzleData.solution) return;

    const expectedMoveUci = currentPuzzleData.solution[solutionIndex];
    const userMoveUci = from + to;

    // التحقق: هل النقلة تطابق المتوقع؟
    if (userMoveUci !== expectedMoveUci && !userMoveUci.startsWith(expectedMoveUci)) {
      // نقلة خاطئة
      Board.markTarget(to, false);
      setStatus('❌ ليست النقلة الصحيحة', 'error');
      setTimeout(() => {
        Board.clearSelection();
        selectedSquare = null;
      }, 700);
      return;
    }

    // النقلة صحيحة
    const move = chess.move({ from, to, promotion: 'q' });
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

    // هل انتهى الحل؟
    if (solutionIndex >= currentPuzzleData.solution.length) {
      // تم حل اللغز
      setStatus('🎉 أحسنت! لغز مكتمل', 'success');
      els.btnNext.disabled = false;
      Storage.markSolved(currentPuzzleData.id);
      updateProgress();
      if (Storage.getSolved().length >= 5) {
        setTimeout(showWinModal, 500);
      }
      return;
    }

    // تطبيق رد الخصم التالي
    applyOpponentMove();
  }

  function applyOpponentMove() {
    if (solutionIndex >= currentPuzzleData.solution.length) return;

    const oppMoveUci = currentPuzzleData.solution[solutionIndex];
    if (!oppMoveUci) return;

    const from = oppMoveUci.slice(0, 2);
    const to = oppMoveUci.slice(2, 4);
    const promotion = oppMoveUci.length > 4 ? oppMoveUci[4] : undefined;

    isLocked = true;
    setStatus('⏳ الخصم يلعب...', '');

    setTimeout(() => {
      const move = chess.move({ from, to, promotion });
      if (move) {
        Board.movePiece(from, to);
      }
      solutionIndex++;
      isLocked = false;

      // هل انتهى الحل بعد نقلة الخصم؟
      if (solutionIndex >= currentPuzzleData.solution.length) {
        setStatus('🎉 أحسنت! لغز مكتمل', 'success');
        els.btnNext.disabled = false;
        Storage.markSolved(currentPuzzleData.id);
        updateProgress();
        if (Storage.getSolved().length >= 5) {
          setTimeout(showWinModal, 500);
        }
      } else {
        setStatus('🎯 دورك الآن', '');
      }
    }, 600); // تأخير بسيط لمحاكاة تفكير الخصم
  }

  // ---------- دوال مساعدة ----------
  function showHint() {
    if (!currentPuzzleData || !currentPuzzleData.solution) return;
    const nextMove = currentPuzzleData.solution[solutionIndex];
    if (nextMove) {
      const from = nextMove.slice(0, 2);
      const to = nextMove.slice(2, 4);
      setStatus(`💡 جرّب النقلة من ${from} إلى ${to}`, '');
    } else {
      setStatus('✅ لا توجد نقلات متبقية', '');
    }
  }

  function resetPuzzle() {
    if (!currentPuzzleData) return;
    loadPuzzle(currentPuzzleData);
  }

  function playAgain() {
    Storage.reset();
    hideWinModal();
    fetchAndLoadPuzzle();
  }

  function setStatus(msg, type) {
    els.status.textContent = msg;
    els.status.className = 'status-message';
    if (type) els.status.classList.add(type);
  }

  function setLoading(isLoading) {
    if (els.loading) {
      els.loading.classList.toggle('hidden', !isLoading);
    }
    if (isLoading) {
      els.btnNext.disabled = true;
      els.btnNew.disabled = true;
    } else {
      els.btnNew.disabled = false;
    }
  }

  function updateProgress() {
    const solved = Storage.getSolved().length;
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    if (fill) fill.style.width = Math.min(solved * 20, 100) + '%';
    if (text) text.textContent = solved + ' / 5';
  }

  function showWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function hideWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.add('hidden');
  }

  return { init, playAgain };
})();
