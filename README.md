# 陈少辉 | 个人作品集网站

📱 在线访问：[https://diolessglow.github.io/resume_portfolio/](https://diolessglow.github.io/resume_portfolio/)

<img src="images/qrcode.png" alt="QR Code" width="200">

---

## ✨ 项目简介

一个纯静态的个人作品集网站，部署在 GitHub Pages。包含个人简介、五类作品展示（项目实战 / 设计作品 / 荣誉奖项 / 小游戏 / 网页互动）以及 8 个可玩的小游戏与互动页面，主打**绿系手作视觉风格**和**逐帧打磨的页面转场与微交互**，全站针对移动端深度优化。

## 🗺️ 页面导览

| 页面 | 说明 |
|---|---|
| [欢迎页](https://diolessglow.github.io/resume_portfolio/) | 字体揭幕 + 逐字弹入动画的入口仪式感 |
| 首页 / 个人简介 | 个人信息、教育背景、技能与经历 |
| 作品集菜单 | 五个作品分类的入口导航 |
| 项目实战 | 项目轮播 + 放大镜，n-1/n/n+1 首图滑动窗口预热 |
| 设计作品 | 文件夹卡片式导航，照片探出压住标签的拟物交互，滑动窗口预热 |
| 荣誉奖项 | 3D 圆形证书墙 + 灯箱放大 |
| 小游戏 / 网页互动 | 作品导航，网页互动页含「胖吉判定」投喂零食彩蛋 |
| [小游戏合集](https://diolessglow.github.io/resume_portfolio/public/games/Bird-Watch.html) | Bird-Watch / CubSpin / Mirror-Chase / Stack-Tower 四个可玩小游戏 |

## 🛠️ 技术栈

- **构建**：Vite（开发服务器与构建）
- **页面**：原生 HTML / CSS / JavaScript，多页应用
- **设计作品页**：React 18 (UMD) + Framer Motion（文件夹卡片与照片墙动效）
- **字体**：Noto Sans SC / ZCOOL KuaiLe / Inter / Space Grotesk，全部自托管并按 unicode-range 分片
- **图片**：WebP 为主，自绘 SVG 图标（favicon 星芒、文件夹标签等）
- **部署**：GitHub Pages，push 即上线

## 🚀 性能优化亮点（线上 4G 节流实测）

| 指标 | 结果 |
|---|---|
| 首屏内容绘制 FCP | 全部 9 页 ≤ 0.8s |
| 最大内容绘制 LCP | 9 页中 8 页 < 2.5s（6 页在 0.5–0.7s） |
| works-web 页 LCP | 13.4s → 0.9s（预加载策略重构） |
| 字体请求 | 338 → 96 个分片，303KB → 114KB（gzip 37KB） |
| 无引用字体文件 | 242 个 woff2 清理，8.9MB → 3.1MB |

关键策略：

- **滑动窗口预热**：设计作品页初始预热前 3 个文件夹、打开第 n 个补热 n±1；项目页按 n-1/n/n+1 预热首图——首屏只用几十 KB 就能完整呈现，浏览到哪加载到哪
- **字体精细分片**：按全站实际字符集 ∩ unicode-range 裁剪字体分片，首屏不下载无关字形
- **荣誉墙**：仅 preload 首屏前 3 张证书，其余 `loading="lazy"` 按需加载
- **自研下拉刷新**：17 个页面统一，含无动画重载、fixed 元素排除与 `overflow-x: clip` 视口保护

## 💻 本地运行

```bash
npm install
npx vite --host 127.0.0.1 --port 3000
# 访问 http://127.0.0.1:3000/resume_portfolio/
```

## 📁 目录结构

```
├── index.html            # 欢迎页
├── home.html / intro.html / works.html
├── works/                # 五个作品分类子页
├── public/games/         # 小游戏 ×4
├── public/foods/         # 互动页面 ×4
├── css/ js/              # 样式与脚本（含转场、下拉刷新、灯箱）
├── fonts/                # 自托管字体分片
└── images/               # WebP 图片资源
```

## 📱 联系方式

- 邮箱：3048008201@qq.com
- GitHub：[github.com/dioLessGlow](https://github.com/dioLessGlow)

---

© 2026 陈少辉
