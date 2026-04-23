// 加载 GSAP
function loadGSAP() {
    return new Promise((resolve) => {
        if (typeof gsap !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = () => {
            console.log('GSAP loaded successfully');
            resolve();
        };
        script.onerror = () => console.error('Failed to load GSAP');
        document.head.appendChild(script);
    });
}

// 公共组件加载
async function initComponents() {
    let currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // home.html 也算 index 页面
    if (currentPage === 'home') {
        currentPage = 'index';
    }
    
    // 判断是否在子目录
    const isInSubDir = window.location.pathname.includes('/works/');
    const basePath = isInSubDir ? '../' : '';

    // 加载 header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
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
            })
            .catch(err => console.error('Header 加载失败:', err));
    }

    // 加载 loader
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
        await loadGSAP();

        fetch(basePath + 'loader.html')
            .then(response => response.text())
            .then(html => {
                loaderContainer.innerHTML = html;

                // 强制显示 loader
                const loader = loaderContainer.querySelector('.loader');
                if (loader) loader.style.display = 'flex';

                // 检查元素
                const textEl = loaderContainer.querySelector('.csh-text');
                if (!textEl) {
                    console.error('.csh-text not found!');
                    return;
                }

                // CSS动画已处理，无需GSAP
                console.log('Loader ready, CSS animation will play');

                // 根据页面设置隐藏时间
                const isWelcome = window.location.pathname.includes('welcome');
                const hideTime = isWelcome ? 2000 : 1000;
                console.log('Hide time:', hideTime);

                setTimeout(() => {
                    if (loader) {
                        loader.classList.add('hidden');
                        // 强制隐藏作为备份
                        loader.style.display = 'none';
                        loader.style.opacity = '0';
                        loader.style.visibility = 'hidden';
                    }
                }, hideTime);
            })
            .catch(err => console.error('Loader 加载失败:', err));
    }

    // 加载 footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch(basePath + 'footer.html')
            .then(response => response.text())
            .then(html => {
                footerContainer.innerHTML = html;
                
                // footer 点击展开（移动端）
                const footer = footerContainer.querySelector('.site-footer');
                if (footer) {
                    footer.addEventListener('click', function(e) {
                        this.classList.toggle('expanded');
                    });
                }
            })
            .catch(err => console.error('Footer 加载失败:', err));
    }
}

// 立即执行
initComponents();