// ==UserScript==
// @name        Tinder-Auto-Swiper
// @namespace   Tinder
// @include     https://tinder.com/app/recs
// @version     5.0
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function () {
  let swipeCount = 0;

  function swipeRight() {
    const gamePadBtns = document.querySelectorAll('button.Bdrs\\(50\\%\\) svg.gamepad-icon');
    if (gamePadBtns.length > 6) {
      gamePadBtns[6].closest('button').click();
      swipeCount++;
      console.log(`[AutoSwiper] 右划 #${swipeCount} ✓`);
    } else {
      console.log('[AutoSwiper] 未找到按钮，当前数量:', gamePadBtns.length);
    }
  }

  function scheduleNext() {
    const delay = 1000 + Math.random() * 2000; // 1~3秒随机
    setTimeout(() => {
      swipeRight();
      scheduleNext();
    }, delay);
  }

  setTimeout(scheduleNext, 3000);
  console.log('[AutoSwiper] 已启动 v5');
})();