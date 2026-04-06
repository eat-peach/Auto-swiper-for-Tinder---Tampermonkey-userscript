// ==UserScript==
// @name        Tinder-Auto-Swiper
// @namespace   Tinder
// @include     https://tinder.com/app/recs
// @version     6.0
// @description Auto swipe right on Tinder with UI controls
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function () {
  let swipeCount = 0;
  let isPaused = false;
  let minDelay = 1000;
  let maxDelay = 3000;
  let timer = null;

  // ── UI ──────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 99999;
    background: rgba(20, 20, 20, 0.92);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 16px 20px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    user-select: none;
  `;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <span style="font-size:15px;font-weight:700;letter-spacing:0.5px;">🔥 Auto Swiper</span>
      <span id="as-status" style="font-size:11px;padding:2px 8px;border-radius:20px;background:#4CAF50;color:#fff;">ON</span>
    </div>

    <div style="text-align:center;margin-bottom:14px;">
      <div style="font-size:11px;color:#aaa;margin-bottom:4px;">SWIPES</div>
      <div id="as-count" style="font-size:32px;font-weight:800;color:#fd267a;letter-spacing:-1px;">0</div>
    </div>

    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#aaa;font-size:11px;">速度 / Speed</span>
        <span id="as-speed-label" style="font-size:11px;color:#fff;">1~3 秒</span>
      </div>
      <input id="as-speed" type="range" min="1" max="5" step="1" value="3"
        style="width:100%;accent-color:#fd267a;cursor:pointer;">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:2px;">
        <span>快 Fast</span><span>慢 Slow</span>
      </div>
    </div>

    <button id="as-toggle" style="
      width:100%;
      padding:9px;
      border:none;
      border-radius:10px;
      background:linear-gradient(135deg,#fd267a,#ff6036);
      color:#fff;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      letter-spacing:0.5px;
    ">⏸ 暂停 Pause</button>
  `;

  document.body.appendChild(panel);

  // ── 速度档位映射 ────────────────────────────────────
  const speedMap = {
    1: { min: 300,  max: 700,  label: '0.3~0.7 秒' },
    2: { min: 700,  max: 1500, label: '0.7~1.5 秒' },
    3: { min: 1000, max: 3000, label: '1~3 秒' },
    4: { min: 3000, max: 6000, label: '3~6 秒' },
    5: { min: 6000, max: 12000,label: '6~12 秒' },
  };

  const speedSlider = document.getElementById('as-speed');
  const speedLabel  = document.getElementById('as-speed-label');
  const toggleBtn   = document.getElementById('as-toggle');
  const countEl     = document.getElementById('as-count');
  const statusEl    = document.getElementById('as-status');

  speedSlider.addEventListener('input', () => {
    const s = speedMap[speedSlider.value];
    minDelay = s.min;
    maxDelay = s.max;
    speedLabel.textContent = s.label;
  });

  toggleBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      toggleBtn.textContent = '▶ 继续 Resume';
      toggleBtn.style.background = 'linear-gradient(135deg,#555,#333)';
      statusEl.textContent = 'OFF';
      statusEl.style.background = '#666';
    } else {
      toggleBtn.textContent = '⏸ 暂停 Pause';
      toggleBtn.style.background = 'linear-gradient(135deg,#fd267a,#ff6036)';
      statusEl.textContent = 'ON';
      statusEl.style.background = '#4CAF50';
      scheduleNext();
    }
  });

  // ── 右划逻辑 ────────────────────────────────────────
  function swipeRight() {
    const btns = document.querySelectorAll('button.Bdrs\\(50\\%\\) svg.gamepad-icon');
    if (btns.length > 6) {
      btns[6].closest('button').click();
      swipeCount++;
      countEl.textContent = swipeCount;
      console.log(`[AutoSwiper] 右划 #${swipeCount} ✓`);
    } else {
      console.log('[AutoSwiper] 未找到按钮，当前数量:', btns.length);
    }
  }

  function scheduleNext() {
    if (isPaused) return;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    timer = setTimeout(() => {
      swipeRight();
      scheduleNext();
    }, delay);
  }

  setTimeout(scheduleNext, 3000);
  console.log('[AutoSwiper] 已启动 v6');
})();