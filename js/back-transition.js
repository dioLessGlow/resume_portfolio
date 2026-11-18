// 返回键转场：动画在「子页」播，不在目的地播。
//
// 为什么在子页：
//   目的地 works.html 是历史回退，线上会命中 bfcache —— 文档不重新解析、脚本不执行、
//   CSS 动画不会重启，所以把动画放在目的地，线上必然看不到。
//   子页是用户当前所在的文档，点一下就能立刻把 CSH 遮罩升起来，稳定、可预期。
//
// 目的地怎么不播第二遍：
//   点击时写一个时间戳，works.html 的内联首帧脚本在 3 秒窗口内读到就隐藏自己的 loader。
//   用时间窗而不是「读一次就删」——本地 dev 热重连可能让文档重载两次，标记若被清掉，
//   第二次就会漏播；时间窗让多次重载都仍然跳过。
function showBackLoader(e) {
    if (e) e.preventDefault();

    const wrap = document.getElementById('back-loader');
    if (wrap) {
        // 已在转场中，忽略重复点击，避免叠多个定时器
        if (!wrap.hidden) return false;

        wrap.hidden = false;

        // 子页加载时这组字母动画已经播完（forwards 停在终态），
        // 这里「卸载 → 强制重排 → 重新挂上」，让它真的从头再弹一次
        const chars = wrap.querySelectorAll('.csh-text > div');
        for (let i = 0; i < chars.length; i++) {
            chars[i].style.animation = 'none';
            void chars[i].offsetWidth;
            chars[i].style.animation = '';
        }
    }

    // 给目的地留标记：3 秒内到达的 works.html 直接呈现
    try {
        sessionStorage.setItem('skipLoaderAt', String(Date.now()));
    } catch (err) { /* 隐私模式下 sessionStorage 可能不可写，忽略即可 */ }

    setTimeout(() => {
        if (history.length > 1) {
            history.back();
        } else {
            // 新标签页直接打开子页，没有上一页可退
            location.href = '../works.html';
        }
    }, 900);

    return false;
}
