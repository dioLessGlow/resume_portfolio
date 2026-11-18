// GSAP 通过 CDN 加载（仅 home.html / works-projects.html 使用）

// ===== 打字机效果工具 =====
// 立即执行，确保在其他脚本之前可用
(function () {
    let typewriterTimer = null;

    window.typeText = function (element, text, speed = 40) {
        if (typewriterTimer) clearTimeout(typewriterTimer);
        if (!element) return;

        element.innerHTML = '<span></span>';
        element.classList.add('active');

        const span = element.querySelector('span');
        // 用独立的文本节点追加字符，避免 textContent 赋值把已插入的 <br> 冲掉
        let textNode = document.createTextNode('');
        span.appendChild(textNode);
        let index = 0;

        function type() {
            if (index < text.length) {
                // 支持 <br> 标签：插入换行后，新建文本节点承接后续文字
                if (text.substr(index, 4) === '<br>') {
                    span.appendChild(document.createElement('br'));
                    textNode = document.createTextNode('');
                    span.appendChild(textNode);
                    index += 4;
                } else {
                    textNode.data += text.charAt(index);
                    index++;
                }
                typewriterTimer = setTimeout(type, speed);
            }
        }
        type();
    };

    window.clearTypewriter = function (element) {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }
        if (element) {
            element.innerHTML = '<span></span>';
            element.classList.remove('active');
        }
    };
})();

// 公共组件加载
async function initComponents() {
    let currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const rawPage = currentPage; // 保留真实文件名，用于区分欢迎页(index)与首页(home)

    // home.html 也算 index 页面
    if (currentPage === 'home') {
        currentPage = 'index';
    }

    // works 子页（works-web / works-projects 等）统一算作品集，高亮"作品集"
    if (currentPage.startsWith('works')) {
        currentPage = 'works';
    }

    // 判断是否在子目录
    const isInSubDir = window.location.pathname.includes('/works/');
    const basePath = isInSubDir ? '../' : '';

    // 加载 header（记录就绪 Promise，loader 揭幕前必须等它完成，避免 header 迟到闪现）
    const headerLoaded = new Promise((resolveHeader) => {
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) { resolveHeader(); return; }
        fetch(basePath + 'header.html')
            .then(response => response.text())
            .then(html => {
                // 在子目录时，修正 header 中的链接路径
                let processedHtml = html;
                if (isInSubDir) {
                    processedHtml = html
                        .replace(/href="index\.html"/g, 'href="../index.html"')
                        .replace(/href="home\.html"/g, 'href="../home.html"')
                        .replace(/href="intro\.html"/g, 'href="../intro.html"')
                        .replace(/href="works\.html"/g, 'href="../works.html"');
                }
                headerContainer.innerHTML = processedHtml;
                const navLinks = headerContainer.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    if (link.dataset.page === currentPage) {
                        link.classList.add('active');
                    }
                });
                resolveHeader();
            })
            .catch(err => {
                console.error('Header 加载失败:', err);
                resolveHeader(); // 失败也要放行，不能让 loader 永远挂起
            });
    });

    // 加载 footer（提前发起：返回接力揭幕要等它，否则底部会空一帧再补上）
    const footerContainer = document.getElementById('footer-container');
    const footerLoaded = footerContainer ? new Promise((resolveFooter) => {
        fetch(basePath + 'footer.html')
            .then(response => response.text())
            .then(html => {
                footerContainer.innerHTML = html;

                // footer 点击展开（移动端）
                const footer = footerContainer.querySelector('.site-footer');
                if (footer) {
                    footer.addEventListener('click', function (e) {
                        this.classList.toggle('expanded');
                    });
                }
                resolveFooter();
            })
            .catch(err => {
                console.error('Footer 加载失败:', err);
                resolveFooter();
            });
    }) : Promise.resolve();

    // 加载 loader（欢迎页 index.html 不放开场动画，直接呈现内容）
    const loaderContainer = document.getElementById('loader-container');
    // 老页面（极少）首帧把容器 display:none 掉，这种就不再揭幕
    const loaderSkipped = loaderContainer && loaderContainer.style.display === 'none';

    if (loaderContainer && rawPage !== 'index' && !loaderSkipped) {
        // loader 标记已内联在 HTML 里（与内容同帧绘制，避免"内容先闪现再出遮罩"的竞态）。
        // 老页面没有内联标记时，退回 fetch 注入
        // 下拉刷新重载：跳过 CSH 字母动画，立即揭幕直接呈现内容
        const noAnim = document.documentElement.getAttribute('data-pr-noanim') === '1';
        const setupLoader = (loader) => {
            loader.style.display = 'flex';

            // 揭幕条件：动画播完 + header/footer 都注入完成
            // （footer 也等，否则底部会空一帧再补上，看起来像"页面往下长了一截"）
            const delay = (ms) => new Promise((r) => setTimeout(r, ms));
            Promise.all([headerLoaded, footerLoaded, delay(noAnim ? 0 : 900)]).then(() => {
                loader.classList.add('hidden');
                loader.style.display = 'none';
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                // 通知页面：遮罩已撤除，入场动画可以开始了
                window.dispatchEvent(new CustomEvent('loader:hidden'));
            });
        };

        const existingLoader = loaderContainer.querySelector('.loader');
        if (existingLoader) {
            setupLoader(existingLoader);
        } else {
            fetch(basePath + 'loader.html')
                .then(response => response.text())
                .then(html => {
                    loaderContainer.innerHTML = html;
                    const loader = loaderContainer.querySelector('.loader');
                    if (!loader) return;
                    setupLoader(loader);
                })
                .catch(err => console.error('Loader 加载失败:', err));
        }
    } else {
        // 欢迎页或无容器页面：仍需通知页面入场动画可以开始
        window.dispatchEvent(new CustomEvent('loader:hidden'));
    }
}

// 立即执行
initComponents();