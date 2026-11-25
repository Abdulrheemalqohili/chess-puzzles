/* ============================================
   puzzles.js — بيانات ألغاز الشطرنج
   كل لغز: وضعية FEN + النقلة الصحيحة + وصف
   ============================================ */

const PUZZLES = [
  {
    id: 1,
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: { from: 'a1', to: 'a8' },
    instruction: 'الملك الأسود محصور — حرّك القلعة لإماتته',
    hint: 'القلعة على العمود a تستطيع الوصول للصف الأخير',
  },
  {
    id: 2,
    fen: '7k/6pp/8/8/8/8/6PP/5R1K w - - 0 1',
    solution: { from: 'f1', to: 'f8' },
    instruction: 'كش مات بالقلعة من العمود f',
    hint: 'تحرك القلعة إلى الصف الثامن',
  },
  {
    id: 3,
    fen: '6k1/8/6K1/8/8/8/8/7R w - - 0 1',
    solution: { from: 'h1', to: 'h8' },
    instruction: 'الملكان متقابلان — أمت الملك بالقلعة',
    hint: 'القلعة في الزاوية اليمنى',
  },
];

/**
 * جلب لغز حسب الفهرس
 * @param {number} index
 * @returns {object|null}
 */
function getPuzzle(index) {
  return PUZZLES[index] || null;
}

/**
 * عدد الألغاز الكلي
 */
function getPuzzleCount() {
  return PUZZLES.length;
}

