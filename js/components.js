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
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // 加载 header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(html => {
                headerContainer.innerHTML = html;
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

        fetch('loader.html')
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
                    if (loader) loader.classList.add('hidden');
                }, hideTime);
            })
            .catch(err => console.error('Loader 加载失败:', err));
    }

    // 加载 footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('footer.html')
            .then(response => response.text())
            .then(html => {
                footerContainer.innerHTML = html;
            })
            .catch(err => console.error('Footer 加载失败:', err));
    }
}

// 立即执行
initComponents();