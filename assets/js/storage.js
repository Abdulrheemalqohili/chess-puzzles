/* ============================================
   storage.js — إدارة حفظ التقدم في localStorage
   ============================================ */

const Storage = (() => {
  const KEY_SOLVED = 'chess_puzzles_solved';
  const KEY_CURRENT = 'chess_puzzles_current';

  /**
   * إرجاع قائمة الألغاز المحلولة
   * @returns {number[]} مصفوفة من indices الألغاز المحلولة
   */
  function getSolved() {
    try {
      const raw = localStorage.getItem(KEY_SOLVED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * حفظ لغز كمحلول
   * @param {number} index — رقم اللغز
   */
  function markSolved(index) {
    const solved = getSolved();
    if (!solved.includes(index)) {
      solved.push(index);
      localStorage.setItem(KEY_SOLVED, JSON.stringify(solved));
    }
  }

  /**
   * هل اللغز محلول؟
   * @param {number} index
   * @returns {boolean}
   */
  function isSolved(index) {
    return getSolved().includes(index);
  }

  /**
   * حفظ رقم اللغز الحالي
   * @param {number} index
   */
  function saveCurrent(index) {
    localStorage.setItem(KEY_CURRENT, String(index));
  }

  /**
   * جلب رقم اللغز الحالي
   * @returns {number}
   */
  function getCurrent() {
    const raw = localStorage.getItem(KEY_CURRENT);
    const num = parseInt(raw, 10);
    return Number.isInteger(num) ? num : 0;
  }

  /**
   * إعادة تعيين كل التقدم
   */
  function reset() {
    localStorage.removeItem(KEY_SOLVED);
    localStorage.removeItem(KEY_CURRENT);
  }

  return {
    getSolved,
    markSolved,
    isSolved,
    saveCurrent,
    getCurrent,
    reset,
  };
})();

