/* ============================================
   puzzles.js — ألغاز شطرنج حقيقية
   كلها كش مات في نقلة واحدة (Mate in 1)
   التحقق يتم عبر chess.js (ليس مقارنة نصية)
   ============================================ */

const PUZZLES = [
  {
    id: 1,
    difficulty: 'سهل',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: { from: 'a1', to: 'a8' },
    instruction: 'أمت الملك الأسود بالقلعة',
    hint: 'انقل القلعة من a1 إلى a8',
  },
  {
    id: 2,
    difficulty: 'سهل',
    fen: '7k/6pp/8/8/8/8/6PP/5R1K w - - 0 1',
    solution: { from: 'f1', to: 'f8' },
    instruction: 'أمت الملك الأسود بالقلعة',
    hint: 'انقل القلعة من f1 إلى f8',
  },
  {
    id: 3,
    difficulty: 'سهل',
    fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1',
    solution: { from: 'a1', to: 'a8' },
    instruction: 'أمت الملك الأسود بالقلعة',
    hint: 'انقل القلعة من h1 إلى h8',
  },
  {
    id: 4,
    difficulty: 'متوسط',
    fen: '6k1/8/6K1/8/8/8/8/Q7 w - - 0 1',
    solution: { from: 'a1', to: 'a8' },
    instruction: 'أمت الملك الأسود بالوزير',
    hint: 'انقل الوزير من a1 إلى a8',
  },
  {
    id: 5,
    difficulty: 'متوسط',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: { from: 'd1', to: 'd8' },
    instruction: 'أمت الملك الأسود بالقلعة',
    hint: 'انقل القلعة من d1 إلى d8',
  },
  {
    id: 6,
    difficulty: 'صعب',
    fen: '6k1/5ppp/8/8/8/8/5PPP/1Q4K1 w - - 0 1',
    solution: { from: 'b1', to: 'b8' },
    instruction: 'أمت الملك الأسود بالوزير — التحدي الأخير',
    hint: 'انقل الوزير من b1 إلى b8',
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
