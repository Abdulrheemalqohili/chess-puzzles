/* ============================================
   main.js — نقطة دخول التطبيق
   ============================================ */

/**
 * تشغيل التطبيق عند اكتمال تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    Game.init();
    console.log('♟️ Chess Puzzles — جاهز للعمل');
  } catch (err) {
    console.error('خطأ في تهيئة التطبيق:', err);
    const status = document.getElementById('status-message');
    if (status) {
      status.textContent = '⚠️ حدث خطأ في تحميل التطبيق';
      status.className = 'status-message error';
    }
  }
});

