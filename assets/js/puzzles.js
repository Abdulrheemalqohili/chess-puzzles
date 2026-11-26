/* ============================================
   puzzles.js — ألغاز شطرنج حقيقية (10 ألغاز)
   كلها كش مات في نقلة واحدة
   التحقق يتم عبر chess.js
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
    hint: 'انقل القلعة من a1 إلى a8',
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
    difficulty: 'متوسط',
    fen: '6k1/5ppp/8/8/8/8/5PPP/1Q4K1 w - - 0 1',
    solution: { from: 'b1', to: 'b8' },
    instruction: 'أمت الملك الأسود بالوزير',
    hint: 'انقل الوزير من b1 إلى b8',
  },
  {
    id: 7,
    difficulty: 'متوسط',
    fen: '7k/8/6K1/8/8/8/8/7Q w - - 0 1',
    solution: { from: 'h1', to: 'a8' },
    instruction: 'أمت الملك الأسود بالوزير من بعيد',
    hint: 'انقل الوزير من h1 إلى a8 عبر القطر',
  },
  {
    id: 8,
    difficulty: 'صعب',
    fen: '6rk/6pp/8/6N1/8/8/8/7K w - - 0 1',
    solution: { from: 'g5', to: 'f7' },
    instruction: 'كش مات مغلق (Smothered Mate) بالحصان',
    hint: 'انقل الحصان من g5 إلى f7',
  },
  {
    id: 9,
    difficulty: 'صعب',
    fen: '6k1/R7/8/8/8/8/1R6/7K w - - 0 1',
    solution: { from: 'b2', to: 'b8' },
    instruction: 'قلعتان تحاصران الملك — سلم المات',
    hint: 'انقل القلعة من b2 إلى b8',
  },
  {
    id: 10,
    difficulty: 'صعب',
    fen: '7k/8/7K/8/8/8/8/6Q1 w - - 0 1',
    solution: { from: 'g1', to: 'g7' },
    instruction: 'الوزير ينهي المباراة بجوار الملك',
    hint: 'انقل الوزير من g1 إلى g7',
  },
];

function getPuzzle(index) {
  return PUZZLES[index] || null;
}

function getPuzzleCount() {
  return PUZZLES.length;
}
