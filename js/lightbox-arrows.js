/* 把图片浏览的左右箭头对齐到「大图」的垂直中线。
   为什么不用 CSS 的 top: 50%：大图下面还有标题/计数，遮罩中线会把人眼看到的位置压低，
   箭头看起来偏下。这里直接量图片的实际矩形，取其中线。
   四个页面共用（intro / works-projects / works-design / works-honors），无需各页调用。 */
(function () {
    var SELECTOR_IMG = '.lightbox.is-open .lightbox__img, .honor-lb.is-open .honor-lb__img';

    function alignTo(img) {
        if (!img || img.tagName !== 'IMG') return;

        var host = img.closest('.lightbox, .honor-lb');
        if (!host) return;

        var prev = host.querySelector('.lb-arrow--prev');
        var next = host.querySelector('.lb-arrow--next');
        if (!prev || !next) return;

        var box = img.getBoundingClientRect();
        // 图还没加载出来时高度为 0，等 load 事件再对
        if (!box.height) return;

        // 垂直：对齐大图中线（图下面还有标题，遮罩中线会偏下）
        var mid = Math.round(box.top + box.height / 2) + 'px';
        prev.style.top = mid;
        next.style.top = mid;

        // 水平：手机上固定贴屏幕左右两侧（图片近乎满宽，箭头压在图上），
        // 竖图缩放成窄条时也不会跟着图片往里缩，位置是稳定的。
        // 桌面上贴着图片外侧，窄图不会离图太远。
        if (window.matchMedia('(max-width: 768px)').matches) {
            prev.style.left = '6px';
            prev.style.right = 'auto';
            next.style.right = '6px';
            next.style.left = 'auto';
        } else {
            var gap = 10;
            var aw = prev.offsetWidth || 58;
            // 用弹层自身的宽度算（有滚动条时 window.innerWidth 会偏宽，左右会不对称）
            var hostBox = host.getBoundingClientRect();
            var left = Math.max(6, Math.round(box.left - hostBox.left - aw - gap));
            var right = Math.max(6, Math.round(hostBox.right - box.right - aw - gap));

            prev.style.left = left + 'px';
            prev.style.right = 'auto';
            next.style.right = right + 'px';
            next.style.left = 'auto';
        }

        // 大图是 scale(.94)→1 的过渡，打开瞬间量到的是缩过尺寸，会算偏。
        // 过渡结束后再对一次（只绑一次，避免重复监听）
        if (host.__lbArrowImg !== img) {
            host.__lbArrowImg = img;
            host.addEventListener('transitionend', function (e) {
                if (e.target === img && e.propertyName === 'transform') alignTo(img);
            });
        }
    }

    function alignAll() {
        var imgs = document.querySelectorAll(SELECTOR_IMG);
        for (var i = 0; i < imgs.length; i++) alignTo(imgs[i]);
    }

    window.alignLightboxArrows = alignAll;

    // 换图/首次加载：图片尺寸变了，重新对齐
    document.addEventListener('load', function (e) {
        if (e.target && e.target.tagName === 'IMG') alignTo(e.target);
    }, true);

    window.addEventListener('resize', alignAll);

    // 弹层打开（class 加上 is-open）后对一次
    if (window.MutationObserver) {
        var mo = new MutationObserver(function () { alignAll(); });
        var observe = function () {
            var hosts = document.querySelectorAll('.lightbox, .honor-lb');
            for (var i = 0; i < hosts.length; i++) {
                mo.observe(hosts[i], { attributes: true, attributeFilter: ['class'] });
            }
            alignAll();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observe);
        } else {
            observe();
        }
    }
})();
