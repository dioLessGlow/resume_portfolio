// 公共组件加载
document.addEventListener('DOMContentLoaded', () => {
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
        fetch('loader.html')
            .then(response => response.text())
            .then(html => {
                loaderContainer.innerHTML = html;
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
});