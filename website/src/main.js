// ===== 主入口文件 =====

import { $, $$, smoothScroll, throttle } from './lib/utils.js';

// ===== 导航滚动效果 =====
const nav = $('.nav');
let lastScroll = 0;

function handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav?.classList.add('nav-scrolled');
    } else {
        nav?.classList.remove('nav-scrolled');
    }
    
    lastScroll = currentScroll;
}

window.addEventListener('scroll', throttle(handleScroll, 100));

// ===== 移动端菜单 =====
const menuToggle = $('.menu-toggle');
const navLinks = $('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // 点击链接关闭菜单
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// ===== 加载动画 =====
window.addEventListener('load', () => {
    const loader = $('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1500);
    }
});

// ===== 平滑滚动 =====
$$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        smoothScroll(this.getAttribute('href'));
    });
});

// ===== 滚动动画 =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
const revealElements = $$('.skill-card, .project-card, .award-card, .about-card, .section');
revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(el);
});

// ===== 项目筛选 =====
const filterBtns = $$('.filter-btn');
const projectCards = $$('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新按钮状态
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.add('revealed');
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ===== 导航高亮更新 =====
const sections = $$('section[id]');
const navLinksAll = $$('.nav-link');

function updateActiveNav() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', throttle(updateActiveNav, 100));

// ===== 鼠标移动视差效果 =====
document.addEventListener('mousemove', throttle((e) => {
    const orbs = $$('.gradient-orb');
    if (orbs.length === 0) return;
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
}, 50));

// ===== 打印日志 =====
console.log('Portfolio website loaded successfully! 🚀');