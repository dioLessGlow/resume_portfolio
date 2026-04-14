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
                
                // CSH 动画 timeline
                const tl = gsap.timeline();
                
                // C 字母 - 从左飞入 + 弹跳
                tl.to('#c', {
                    opacity: 1,
                    duration: 0.01
                })
                .from('#c', {
                    x: -80,
                    y: -40,
                    rotation: -20,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                })
                .to('#c', {
                    rotation: 0,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.5)'
                }, '-=0.2')
                
                // S 字母 - 缩放弹入
                .to('#s', {
                    opacity: 1,
                    duration: 0.01
                })
                .from('#s', {
                    scale: 0,
                    duration: 0.5,
                    ease: 'back.out(2)'
                })
                
                // H 字母 - 从右飞入 + 弹跳
                .to('#h', {
                    opacity: 1,
                    duration: 0.01
                })
                .from('#h', {
                    x: 80,
                    y: -40,
                    rotation: 20,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                })
                .to('#h', {
                    rotation: 0,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.5)'
                }, '-=0.2')
                
                // 装饰线条动画
                .to('#decor', {
                    opacity: 1,
                    duration: 0.01
                })
                .from('.line-1', {
                    strokeDasharray: 100,
                    strokeDashoffset: 100,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.5')
                .from('.line-2', {
                    strokeDasharray: 80,
                    strokeDashoffset: 80,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.4')
                
                // 爆炸粒子
                .to('#burst', {
                    opacity: 1,
                    duration: 0.01
                })
                .from('#burst circle', {
                    scale: 0,
                    duration: 0.3,
                    ease: 'back.out(2)',
                    stagger: 0.05
                })
                .to('#burst circle', {
                    scale: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                    stagger: 0.03
                }, '+=0.2');
                
                // 根据页面设置隐藏时间（welcome 2.5秒，其他 1秒）
                const isWelcome = window.location.pathname.includes('welcome');
                const hideTime = isWelcome ? 2500 : 800;
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