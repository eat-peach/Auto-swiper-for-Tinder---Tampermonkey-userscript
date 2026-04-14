// ==UserScript==
// @name        Tinder-Auto-Swiper
// @namespace   Tinder
// @include     https://tinder.com/app/recs
// @version     2.0
// @description Auto swipe on Tinder with full profile filtering
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function () {
  var swipeCount = 0;
  var skipCount = 0;
  var isPaused = true;
  var minDelay = 1000;
  var maxDelay = 3000;
  var isProcessing = false;
  var isMinimized = false;
  var activeTab = 'main';

  var STORAGE_KEY = 'tinder_swiper_settings';

  function loadSettings() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { keywords: [], maxDistance: 0, minHeight: 0 };
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  var settings = loadSettings();

  function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  function randomDelay() {
    return minDelay + Math.random() * (maxDelay - minDelay);
  }

  function detectPageLang() {
    var htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('zh')) return 'zh';
    return 'en';
  }

  var PAGE_LANG = detectPageLang();

  function swipeAction(direction) {
    var selector = direction === 'right'
      ? 'button[class*="sparks-like-default"]'
      : 'button[class*="sparks-nope-default"]';
    var btn = document.querySelector(selector);
    if (btn) { btn.click(); return true; }
    console.log('[AutoSwiper] button not found: ' + direction);
    return false;
  }

  function openProfile() {
    var label = PAGE_LANG === 'zh' ? '\u6253\u5f00\u4e2a\u4eba\u8d44\u6599' : 'Open Profile';
    var spans = Array.from(document.querySelectorAll('span'));
    var btn = spans.find(function(el) { return el.textContent.trim() === label; });
    if (btn) {
      var parent = btn.closest('button');
      if (parent) parent.click();
      else btn.click();
      return true;
    }
    return false;
  }

  function isProfileOpen() {
    var titles = [
      '\u5173\u952e\u4fe1\u606f', '\u4e2a\u4eba\u7b80\u4ecb', '\u6211\u7684\u66f4\u591a\u4fe1\u606f',
      '\u751f\u6d3b\u65b9\u5f0f', '\u5174\u8da3',
      'Key Facts', 'About', 'Lifestyle', 'Interests'
    ];
    return Array.from(document.querySelectorAll('h2'))
      .some(function(el) { return titles.indexOf(el.textContent.trim()) !== -1; });
  }

  var UI_EXCLUDE = [
    '\u7167\u7247\u5df2\u9a8c\u8bc1', 'Super Like', 'Tinder', '\u5728\u65b0\u7a97\u53e3\u6253\u5f00',
    'Auto Swiper', '\u53f3\u5212', '\u5de6\u5212', '\u901f\u5ea6', 'Fast', 'Slow',
    'Pause', 'Resume', 'Start', '\u6682\u505c', '\u5f00\u59cb', '\u7ee7\u7eed',
    '\u5173\u952e\u8bcd', '\u6700\u8fdc\u8ddd\u79bb', '\u6700\u4f4e\u8eab\u9ad8', '\u8fd0\u884c', '\u5df2\u6682\u505c', '\u8fd4\u56de'
  ];

  function getProfileText() {
    return Array.from(document.querySelectorAll('div, span, h2, h3, p'))
      .filter(function(el) {
        if (el.children.length > 0) return false;
        if (el.closest('#as-panel')) return false;
        var text = el.textContent.trim();
        if (text.length < 2 || text.length > 300) return false;
        if (UI_EXCLUDE.some(function(ex) { return text.indexOf(ex) !== -1; })) return false;
        return true;
      })
      .map(function(el) { return el.textContent.trim(); })
      .join(' ');
  }

  function getName() {
    var spans = Array.from(document.querySelectorAll('span'));
    for (var i = 0; i < spans.length - 1; i++) {
      var next = spans[i + 1];
      if (next && /^\d{2}$/.test(next.textContent.trim()) &&
          spans[i].textContent.trim().length > 0 &&
          spans[i].textContent.trim().length < 20) {
        return spans[i].textContent.trim();
      }
    }
    return '';
  }

  function getProfileStats() {
    var result = { distance: null, height: null };
    Array.from(document.querySelectorAll('div, span'))
      .filter(function(el) { return el.children.length === 0; })
      .forEach(function(el) {
        if (el.closest('#as-panel')) return;
        var text = el.textContent.trim();
        var distZh = text.match(/^(\d+)\s*\u516c\u91cc\u8fdc$/);
        var distEn = text.match(/^(\d+)\s*km away$/i);
        if (distZh) result.distance = parseInt(distZh[1]);
        if (distEn) result.distance = parseInt(distEn[1]);
        var htZh = text.match(/^(\d+)\s*\u5398\u7c73$/);
        var htEn = text.match(/^(\d+)\s*cm$/i);
        if (htZh) result.height = parseInt(htZh[1]);
        if (htEn) result.height = parseInt(htEn[1]);
      });
    return result;
  }

  function shouldSkip(text, stats) {
    var lower = text.toLowerCase();
    for (var i = 0; i < settings.keywords.length; i++) {
      var kw = settings.keywords[i].trim();
      if (kw && lower.indexOf(kw.toLowerCase()) !== -1) {
        return 'keyword: "' + kw + '"';
      }
    }
    if (settings.maxDistance > 0 && stats.distance !== null) {
      if (stats.distance > settings.maxDistance) {
        return stats.distance + 'km > ' + settings.maxDistance + 'km';
      }
    }
    if (settings.minHeight > 0 && stats.height !== null) {
      if (stats.height < settings.minHeight) {
        return stats.height + 'cm < ' + settings.minHeight + 'cm';
      }
    }
    return null;
  }

  async function doSwipe() {
    if (isProcessing || isPaused) return;
    isProcessing = true;

    try {
      var name = getName();
      var nameLower = name.toLowerCase();
      for (var i = 0; i < settings.keywords.length; i++) {
        var kw = settings.keywords[i].trim();
        if (kw && nameLower.indexOf(kw.toLowerCase()) !== -1) {
          swipeAction('left');
          skipCount++;
          skipCountEl.textContent = skipCount;
          lastEl.textContent = '<- ' + kw;
          isProcessing = false;
          scheduleNext();
          return;
        }
      }

      openProfile();
      await sleep(300);

      if (!isProfileOpen()) {
        console.log('[AutoSwiper] profile not opened, skip');
        isProcessing = false;
        scheduleNext();
        return;
      }

      var text = getProfileText();
      var stats = getProfileStats();
      console.log('[AutoSwiper] text: ' + text.substring(0, 80) + ' dist:' + stats.distance + ' height:' + stats.height);

      var reason = shouldSkip(text, stats);
      if (reason) {
        swipeAction('left');
        skipCount++;
        skipCountEl.textContent = skipCount;
        lastEl.textContent = '<- ' + reason;
        console.log('[AutoSwiper] left <- ' + reason);
      } else {
        swipeAction('right');
        swipeCount++;
        swipeCountEl.textContent = swipeCount;
        lastEl.textContent = '-> #' + swipeCount;
        console.log('[AutoSwiper] right -> #' + swipeCount);
      }

    } catch (e) {
      console.error('[AutoSwiper] error:', e);
      lastEl.textContent = 'error, skip';
    }

    isProcessing = false;
    scheduleNext();
  }

  function scheduleNext() {
    if (isPaused) return;
    setTimeout(doSwipe, randomDelay());
  }

  // ‚î?‚î? Â±ïÂºÄÊó∂Á°Æ‰øùÈù¢Êùø‰∏çË∂ÖÂá∫ËßÜÁ™ó ‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?
  function clampPanelPosition() {
    var rect = panel.getBoundingClientRect();
    var maxX = window.innerWidth - panel.offsetWidth;
    var maxY = window.innerHeight - panel.offsetHeight;
    var newX = Math.max(0, Math.min(rect.left, maxX));
    var newY = Math.max(0, Math.min(rect.top, maxY));
    if (newX !== rect.left || newY !== rect.top) {
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  // ‚î?‚î? UI ‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?‚î?
  var langHintBg = PAGE_LANG === 'zh' ? 'rgba(76,175,80,0.15)' : 'rgba(255,193,7,0.15)';
  var langHintColor = PAGE_LANG === 'zh' ? '#81c784' : '#ffd54f';
  var langHintHTML = PAGE_LANG === 'zh'
    ? '<b>\u2713 \u4e2d\u6587\u754c\u9762</b><br>\u2022 <b>\u9009\u9879\u7c7b</b>\uff08\u8bed\u8a00/\u6027\u53d6\u5411/\u70df\u9152\u7b49\uff09\u968f\u754c\u9762\u8bed\u8a00\uff0c\u5982\u300c\u82f1\u8bed\u300d\u300c\u6cdb\u6027\u604b\u300d\u300c\u5438\u70df\u300d<br>\u2022 <b>\u81ea\u586b\u7b80\u4ecb/Prompt</b> \u968f\u5bf9\u65b9\u586b\u5199\u8bed\u8a00\uff0c\u53ef\u4e2d\u82f1\u6df7\u586b'
    : '<b>English UI</b><br>Options (language/orientation/lifestyle): e.g. "English" "smoking"<br>Bio/Prompts depend on the other user\'s language';

  var panel = document.createElement('div');
  panel.id = 'as-panel';
  panel.setAttribute('style', [
    'position:fixed',
    'bottom:80px',
    'right:20px',
    'z-index:99999',
    'background:rgba(20,20,20,0.93)',
    'border:1px solid rgba(255,255,255,0.1)',
    'border-radius:16px',
    'color:#fff',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'font-size:13px',
    'width:260px',
    'box-shadow:0 8px 32px rgba(0,0,0,0.5)',
    'backdrop-filter:blur(10px)',
    'user-select:none',
    'overflow:hidden'
  ].join(';'));

  panel.innerHTML = [
    '<div id="as-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:grab;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.07);">',
    '<span style="font-size:13px;font-weight:700;">\ud83d\udd25 Auto Swiper</span>',
    '<div style="display:flex;align-items:center;gap:6px;">',
    '<span id="as-status" style="font-size:10px;padding:2px 6px;border-radius:20px;background:#666;white-space:nowrap;">OFF</span>',
    '<button id="as-mini-toggle" style="background:linear-gradient(135deg,#4CAF50,#2e7d32);border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;cursor:pointer;white-space:nowrap;">&#9654;</button>',
    '<button id="as-minimize" style="background:rgba(255,255,255,0.1);border:none;border-radius:6px;color:#ccc;font-size:13px;font-weight:700;cursor:pointer;padding:2px 7px;line-height:1;">&#8212;</button>',
    '</div>',
    '</div>',

    '<div id="as-body" style="padding:14px;">',

    '<div style="display:flex;justify-content:space-around;margin-bottom:8px;text-align:center;">',
    '<div>',
    '<div style="font-size:10px;color:#aaa;margin-bottom:2px;">\u53f3\u5212 &#10084;&#65039;</div>',
    '<div id="as-swipe-count" style="font-size:26px;font-weight:800;color:#fd267a;">0</div>',
    '</div>',
    '<div style="width:1px;background:rgba(255,255,255,0.1);"></div>',
    '<div>',
    '<div style="font-size:10px;color:#aaa;margin-bottom:2px;">\u5de6\u5212 &#10005;</div>',
    '<div id="as-skip-count" style="font-size:26px;font-weight:800;color:#aaa;">0</div>',
    '</div>',
    '</div>',

    '<div id="as-last" style="font-size:10px;color:#888;margin-bottom:12px;min-height:14px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\u5df2\u6682\u505c\uff0c\u70b9 &#9654; \u5f00\u59cb\u8fd0\u884c</div>',

    '<div style="display:flex;gap:4px;margin-bottom:12px;">',
    '<button id="as-tab-main" style="flex:1;padding:5px 0;border:none;border-radius:8px;background:rgba(253,38,122,0.8);color:#fff;font-size:11px;font-weight:600;cursor:pointer;">\u4e3b\u9875</button>',
    '<button id="as-tab-filter" style="flex:1;padding:5px 0;border:none;border-radius:8px;background:rgba(255,255,255,0.08);color:#aaa;font-size:11px;font-weight:600;cursor:pointer;">\u7b5b\u9009</button>',
    '</div>',

    '<div id="as-page-main">',
    '<div style="margin-bottom:4px;">',
    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">',
    '<span style="color:#aaa;font-size:11px;">\u901f\u5ea6 / Speed</span>',
    '<span id="as-speed-label" style="font-size:11px;">1~3 \u79d2</span>',
    '</div>',
    '<input id="as-speed" type="range" min="1" max="5" step="1" value="3" style="width:100%;accent-color:#fd267a;cursor:pointer;">',
    '<div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:2px;">',
    '<span>\u5feb Fast</span><span>\u6162 Slow</span>',
    '</div>',
    '</div>',
    '</div>',

    '<div id="as-page-filter" style="display:none;">',
    '<div style="margin-bottom:10px;">',
    '<div style="color:#aaa;font-size:11px;margin-bottom:5px;">\ud83d\udeab \u5de6\u5212\u5173\u952e\u8bcd\uff08\u9017\u53f7\u5206\u9694\uff09</div>',
    '<textarea id="as-keywords" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 8px;color:#fff;font-size:12px;resize:none;height:60px;outline:none;"></textarea>',
    '<div style="font-size:10px;margin-top:5px;padding:6px 8px;border-radius:6px;line-height:1.7;background:' + langHintBg + ';color:' + langHintColor + ';">',
    langHintHTML,
    '</div>',
    '</div>',
    '<div style="display:flex;gap:8px;">',
    '<div style="flex:1;">',
    '<div style="color:#aaa;font-size:11px;margin-bottom:5px;">\ud83d\udccd \u6700\u8fdc\u8ddd\u79bb(km)</div>',
    '<input id="as-distance" type="number" min="0" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 8px;color:#fff;font-size:12px;outline:none;">',
    '</div>',
    '<div style="flex:1;">',
    '<div style="color:#aaa;font-size:11px;margin-bottom:5px;">\ud83d\udccf \u6700\u4f4e\u8eab\u9ad8(cm)</div>',
    '<input id="as-height" type="number" min="0" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 8px;color:#fff;font-size:12px;outline:none;">',
    '</div>',
    '</div>',
    '</div>',

    '</div>'
  ].join('');

  document.body.appendChild(panel);

  var swipeCountEl  = document.getElementById('as-swipe-count');
  var skipCountEl   = document.getElementById('as-skip-count');
  var speedSlider   = document.getElementById('as-speed');
  var speedLabel    = document.getElementById('as-speed-label');
  var statusEl      = document.getElementById('as-status');
  var keywordsEl    = document.getElementById('as-keywords');
  var distanceEl    = document.getElementById('as-distance');
  var heightEl      = document.getElementById('as-height');
  var lastEl        = document.getElementById('as-last');
  var bodyEl        = document.getElementById('as-body');
  var header        = document.getElementById('as-header');
  var minBtn        = document.getElementById('as-minimize');
  var miniToggleBtn = document.getElementById('as-mini-toggle');
  var tabMain       = document.getElementById('as-tab-main');
  var tabFilter     = document.getElementById('as-tab-filter');
  var pageMain      = document.getElementById('as-page-main');
  var pageFilter    = document.getElementById('as-page-filter');

  keywordsEl.value = settings.keywords.join(', ');
  distanceEl.value = settings.maxDistance;
  heightEl.value   = settings.minHeight;

  function updateToggleUI() {
    if (isPaused) {
      miniToggleBtn.innerHTML = '&#9654;';
      miniToggleBtn.style.background = 'linear-gradient(135deg,#4CAF50,#2e7d32)';
      statusEl.textContent = 'OFF';
      statusEl.style.background = '#666';
      lastEl.textContent = '\u5df2\u6682\u505c';
    } else {
      miniToggleBtn.innerHTML = '&#9646;&#9646;';
      miniToggleBtn.style.background = 'linear-gradient(135deg,#fd267a,#ff6036)';
      statusEl.textContent = 'ON';
      statusEl.style.background = '#4CAF50';
      lastEl.textContent = '\u8fd0\u884c\u4e2d...';
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    updateToggleUI();
    if (!isPaused) scheduleNext();
  }

  miniToggleBtn.addEventListener('click', togglePause);

  var speedMap = {
    1: { min: 300,   max: 700,   label: '0.3~0.7 \u79d2' },
    2: { min: 700,   max: 1500,  label: '0.7~1.5 \u79d2' },
    3: { min: 1000,  max: 3000,  label: '1~3 \u79d2' },
    4: { min: 3000,  max: 6000,  label: '3~6 \u79d2' },
    5: { min: 6000,  max: 12000, label: '6~12 \u79d2' }
  };

  speedSlider.addEventListener('input', function() {
    var s = speedMap[speedSlider.value];
    minDelay = s.min;
    maxDelay = s.max;
    speedLabel.textContent = s.label;
  });

  keywordsEl.addEventListener('input', function() {
    settings.keywords = keywordsEl.value.split(',').map(function(k) { return k.trim(); }).filter(Boolean);
    saveSettings();
  });

  distanceEl.addEventListener('input', function() {
    settings.maxDistance = parseInt(distanceEl.value) || 0;
    saveSettings();
  });

  heightEl.addEventListener('input', function() {
    settings.minHeight = parseInt(heightEl.value) || 0;
    saveSettings();
  });

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'main') {
      pageMain.style.display = 'block';
      pageFilter.style.display = 'none';
      tabMain.style.background = 'rgba(253,38,122,0.8)';
      tabMain.style.color = '#fff';
      tabFilter.style.background = 'rgba(255,255,255,0.08)';
      tabFilter.style.color = '#aaa';
    } else {
      pageMain.style.display = 'none';
      pageFilter.style.display = 'block';
      tabFilter.style.background = 'rgba(253,38,122,0.8)';
      tabFilter.style.color = '#fff';
      tabMain.style.background = 'rgba(255,255,255,0.08)';
      tabMain.style.color = '#aaa';
    }
  }

  tabMain.addEventListener('click', function() { switchTab('main'); });
  tabFilter.addEventListener('click', function() { switchTab('filter'); });

  minBtn.addEventListener('click', function() {
    isMinimized = !isMinimized;
    if (isMinimized) {
      bodyEl.style.display = 'none';
      minBtn.innerHTML = '&#43;';
      panel.style.width = 'auto';
    } else {
      bodyEl.style.display = 'block';
      minBtn.innerHTML = '&#8212;';
      panel.style.width = '260px';
      // Â±ïÂºÄÂêéÁ°Æ‰øù‰∏çË∂ÖÂá∫ËßÜÁ™ó
      setTimeout(clampPanelPosition, 10);
    }
  });

  function clampPanelPosition() {
    var rect = panel.getBoundingClientRect();
    var maxX = window.innerWidth - panel.offsetWidth - 8;
    var maxY = window.innerHeight - panel.offsetHeight - 8;
    var newX = Math.max(8, Math.min(rect.left, maxX));
    var newY = Math.max(8, Math.min(rect.top, maxY));
    panel.style.left = newX + 'px';
    panel.style.top = newY + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  // ÊãñÂä®
  var dragStartX = 0;
  var dragStartY = 0;
  var panelStartX = 0;
  var panelStartY = 0;
  var isDragging = false;

  header.addEventListener('mousedown', function(e) {
    if (e.target === minBtn || e.target === miniToggleBtn) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    var rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var dx = e.clientX - dragStartX;
    var dy = e.clientY - dragStartY;
    var newX = panelStartX + dx;
    var newY = panelStartY + dy;
    newX = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, newX));
    newY = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, newY));
    panel.style.left = newX + 'px';
    panel.style.top = newY + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
    header.style.cursor = 'grab';
  });

  console.log('[AutoSwiper] v2 started, lang: ' + PAGE_LANG);
})();
