# 线上性能测试报告

- 测试时间：2026-11-20
- 测试地址：`https://diolessglow.github.io/resume_portfolio/`
- 工具：Chrome headless + CDP 网络节流
- 两组环境：
  - **桌面**：1440×900，不节流
  - **移动**：390×844、DPR2、iPhone UA、**Fast4G 节流**（150ms 延迟 / 1.6Mbps 下行 / 750Kbps 上行）
- 每组独立浏览器实例、禁用 HTTP 缓存，确保数据可信
- 指标：TTFB / FCP / LCP / CLS / 资源数 / 传输量 / JS 堆 / DOM 节点 / 重排次数
- 判定阈值（Google Core Web Vitals）：LCP ≤2.5s 良好，2.5~4s 需改进，>4s 差；CLS ≤0.1 良好

## 移动端 Fast4G 结果（关键组）

| 页面 | LCP | FCP | CLS | 传输量 | 评价 |
|---|---|---|---|---|---|
| home | 1.02s | 1.02s | 0 | 277K | 良好 |
| index | 1.54s | 0.67s | 0.001 | 465K | 良好 |
| intro | 0.94s | 0.94s | 0.019 | 404K | 良好 |
| works-hub | 2.36s | 1.58s | 0.001 | 204K | 良好 |
| projects | 1.86s | 1.40s | 0.001 | 494K | 良好 |
| **honors** | **10.48s** | 1.03s | 0.001 | 1443K | **差** |
| design | 2.48s | 2.48s | 0 | 1036K | 良好（但 223 请求） |
| **web3d** | **16.27s** | 1.92s | 0.001 | 1216K | **差** |
| games-hub | 0.96s | 0.96s | 0 | 547K | 良好 |
| food-Pocket | 0.67s | 0.52s | 0 | 375K | 良好 |
| food-Sylvan | 0.62s | 0.62s | 0 | 563K | 良好 |
| food-Zephyr | 0.72s | 0.70s | 0 | 739K | 良好 |
| food-map | 0.48s | 0.45s | 0 | 9K | 良好 |
| g-Bird | 0.98s | 0.97s | 0 | 800K | 良好 |
| g-Cub | 0.40s | 0.39s | 0 | 9K | 良好 |
| g-Rabbit | 0.71s | 0.68s | 0 | 188K | 良好 |
| g-Tower | 1.41s | 1.41s | 0 | 843K | 良好 |

**15/17 页 LCP 达标，2 页严重超标（honors、web3d）。** 桌面组结论一致（honors 22.7s、web3d 13.7s）。

## 瓶颈定位

### 1. 荣誉墙 honors — LCP 10~22s
- LCP 元素是中间主图 `11.webp`（159KB）。
- **根因：preload 预热对象错位**。`<link rel=preload>` 预热的是 `1/2/3.webp`，而真正首屏最大图是 `11.webp`（HTML 第 666 行），没有 preload，要等 HTML 解析到 `<img>` 才开始下载，还要和 3 张无用 preload 抢带宽。
- 诊断中 11.webp 完成于 3.96s、7.webp 完成于 12.8s（后者 lazy 但被 3D 卡布局判定为"可见"而提早加载，继续抢带宽）。

### 2. 作品 web3d — LCP 14~16s
- LCP 元素是企鹅 idle 动图 `idle.webp?v=20261113b`（58KB）。
- 根因是"双版本号交替"重播技巧：URL 每次带 `?a`/`?b` 强制重播动画，但首屏 LCP 就被这个动图的下载卡住；且 6 个动图（idle/isyes/no × 2 版本）都在首屏阶段发起，互相抢 1.6Mbps 带宽。
- 此前已优化过一次（Promise.all 等 6 图 → 只等首屏 idle），但 idle 本身仍要 5~6s 才完成。

### 3. 设计页 design — 223 个请求
- 其中 **189 个来自 `esm.sh`**（framer-motion@11 / react@19 / react-dom@19 的 ESM 依赖树），全部跨域、逐个请求。
- LCP 本身 2.48s 达标（主图是文字 H1），但 223 请求导致 wall time 18~20s，弱网/弱设备下交互就绪很慢。
- 同样引用 esm.sh 的还有 works-games、web3d、Mirror-Chase、Sylvan-Sands（请求数相对较少）。

## 优化建议（按收益排序）

1. **honors**：把 preload 从 `1/2/3.webp` 改为 `11.webp`（真正的主图）+ 首屏可见的相邻 2 张（7、8），其余继续 lazy。预计 LCP 从 10s+ 降到 2~3s。
2. **web3d**：首屏先用一张静态首帧图（或 CSS 占位）作为 LCP 元素，idle 动图延后到 `requestIdleCallback` 或首次交互后再播；或给 idle 动图加 `fetchpriority="high"` 并降其他动图优先级。
3. **design 等 ESM 页**：把 framer-motion / react 从 esm.sh 改为本地打包或自托管单文件（Vite build 产物），可把 189 个跨域请求压成 1~3 个，弱网收益巨大。
4. 通用：给各页 LCP 图片加 `fetchpriority="high"`，非首屏图加 `loading="lazy"`（honors 已部分做）。

## 备注

- 所有页面 TTFB 正常（100~300ms），服务端（GitHub Pages CDN）无瓶颈。
- CLS 全部 ≤0.1，布局稳定性良好。
- 报告中的毫秒数为单次测量，弱网下会有波动；honors 三轮分别测到 10.5s / 22.7s / 4.0s，波动源于证书墙 3D 布局的懒加载判定与带宽竞争，但均指向同一 preload 错位根因。

---

## 优化实施与复测（2026-11-20 下午）

按建议实施了三项低风险优化（commit `fe18d1d` / `626234b`）：

1. **design**：`framer-motion` 引用加 `?bundle`，80+ 子模块压成单文件 → **请求数 223→52（esm.sh 189→18），LCP 2.48s→0.94s** ✅
2. **web3d**：企鹅图改为 HTML 初始 src + `fetchpriority="high"`，并去掉"JS 加 ready 类才显示"的门槛（改为默认可见、无 src 时才隐藏）→ **LCP 16.3s→1.19s** ✅
3. **honors**：preload 从错位的 `1/2/3.webp` 改为真正的 LCP 主图 `11.webp`（独占带宽，只预热这一张）→ 从 10~22s 降到波动 **3~7s**（有一轮 17s）

### honors 未能彻底解决的原因

3D 证书墙的 8 张图虽然标了 `loading="lazy"`，但整墙在视口内，浏览器判定全部可见 → 1.7s 时 8 张图同时发起，1.6Mbps 弱网下把 preload 的 11.webp 带宽抢走，导致 LCP 随带宽竞争在 3~17s 大幅波动（FCP 稳定 1.0~1.3s，证明不是渲染阻塞，是下载排队）。

彻底解法是初始只给 11.webp 的 src、其余 7 张延迟到首屏绘制后再赋值（真正的时间维度懒加载），但会改动 3D 卡片的 React 渲染逻辑，风险高于收益，本轮未做。若后续要极致优化 honors，可从这里入手。

### 复测数据（移动 4G，独立浏览器实例，等 8s 采 LCP，每页 3 轮）

| 页面 | 优化前 LCP | 优化后 LCP | 请求数变化 |
|---|---|---|---|
| design | 2.48s | **0.94s** | 223→52 |
| web3d | 16.27s | **1.19s** | 不变 |
| honors | 10~22s | 3~7s（波动） | 47→48 |
