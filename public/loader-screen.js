/**
 * 全屏加载幕控制器 —— 与《林间秘境・沙海幻镜》同款视觉
 *
 * 页面里放好这段结构（放在 <body> 最前面，保证首帧即遮挡）：
 * <div id="loading-screen">
 *   <div class="loader-container">
 *     <div class="portal-pulse"></div>
 *     <div class="loader-ring"></div>
 *     <div class="loader-ring-inner"></div>
 *   </div>
 *   <div class="loading-text">标题</div>
 *   <div class="loading-subtext">副文案</div>
 *   <div class="loading-progress"><div class="loading-progress-bar" id="loading-bar"></div></div>
 *   <div class="loading-percent" id="loading-percent">0%</div>
 * </div>
 *
 * API：
 *   PageLoader.set(percent, subtext)   // 推进真实进度，subtext 可选
 *   PageLoader.done()                  // 进度满 + 淡出（含最短展示时长，避免一闪而过）
 *   PageLoader.fail(message)           // 出错时红字提示，不隐藏
 */
(function () {
    'use strict';

    var screen = document.getElementById('loading-screen');
    if (!screen) return;

    var bar = document.getElementById('loading-bar');
    var percentEl = document.getElementById('loading-percent');
    var subtextEl = screen.querySelector('.loading-subtext');

    var MIN_SHOW = 500;          // 最短展示时长(ms)，短资源也不会闪一下
    var startTime = performance.now();
    var current = 0;
    var finished = false;

    function set(percent, subtext) {
        if (typeof percent === 'number' && isFinite(percent)) {
            current = Math.max(current, Math.min(100, percent));
            if (bar) bar.style.width = current + '%';
            if (percentEl) percentEl.textContent = Math.round(current) + '%';
        }
        if (subtext && subtextEl) subtextEl.textContent = subtext;
    }

    function done() {
        if (finished) return;
        finished = true;
        set(100);

        var elapsed = performance.now() - startTime;
        var wait = Math.max(0, MIN_SHOW - elapsed);

        setTimeout(function () {
            screen.classList.add('hidden');
            window.dispatchEvent(new CustomEvent('pageloader:done'));
        }, wait);
    }

    function fail(message) {
        finished = true;
        if (subtextEl) {
            subtextEl.textContent = message || '资源加载失败';
            subtextEl.style.color = '#ff6b6b';
        }
        if (bar) bar.style.background = '#ff6b6b';
    }

    // 兜底：无论资源情况如何，页面 load 后最多再等 6 秒强制揭幕，避免永久黑屏
    window.addEventListener('load', function () {
        setTimeout(function () {
            if (!finished) done();
        }, 6000);
    });

    window.PageLoader = { set: set, done: done, fail: fail };
})();
