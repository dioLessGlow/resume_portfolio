// 加载 GSAP
function loadGSAP() {
    return new Promise((resolve) => {
        if (typeof gsap !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// 公共组件加载
async function initComponents() {
    // 获取当前页面
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // 加载 header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(html => {
                headerContainer.innerHTML = html;
                // 设置 active 状态
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
                
                // 运行 loader 动画
                const tl = gsap.timeline();
                tl.from('#c', {
                    x: -60,
                    y: -30,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'back.out(1.7)'
                })
                .from('#s', {
                    scale: 0,
                    opacity: 0,
                    duration: 0.4,
                    ease: 'back.out(2)'
                }, '-=0.3')
                .from('#h', {
                    x: 60,
                    y: -30,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'back.out(1.7)'
                }, '-=0.2');
                
                // 根据页面设置隐藏时间（welcome 2秒，其他 1秒）
                const isWelcome = window.location.pathname.includes('welcome');
                const hideTime = isWelcome ? 2000 : 500;
                setTimeout(() => {
                    const loader = loaderContainer.querySelector('.loader');
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