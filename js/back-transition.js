// 返回键：这里不播任何遮罩，直接回上一页。
// 转场统一由「目的地页面」播一遍 CSH —— 和点顶部导航进入时的表现完全一致。
//
// 为什么不在子页播：
//   1) 子页播一遍、目的地再播一遍 = 看起来"抖两下"；
//   2) 只让子页播、目的地禁用，字母会从半途直接跳到终点，是拼接感很强的折中。
// 只在目的地播，两条路径的观感才统一。
function showBackLoader(e) {
    if (e) e.preventDefault();

    // 有历史就回退（保持浏览器前进/后退语义）
    if (history.length > 1) {
        history.back();
        return false;
    }

    // 新标签页直接打开子页时没有上一页，退回作品集
    location.href = '../works.html';
    return false;
}
