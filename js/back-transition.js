// 返回键转场：点击瞬间升起 CSH 遮罩（消除"旧页面内容滞留"的空档），
// 0.9s 后执行 history.back()；目的地 works.html 凭 skipLoader 标记跳过自己的 CSH，避免两连播
function showBackLoader(e) {
    if (e) e.preventDefault();
    const wrap = document.getElementById('back-loader');
    if (wrap) wrap.hidden = false;   // 内联遮罩立即升起，0ms 反馈
    sessionStorage.setItem('skipLoader', '1');
    setTimeout(() => history.back(), 900);
    return false;
}
