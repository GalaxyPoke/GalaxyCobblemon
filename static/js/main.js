/**
 * MC服务器官网 - 主脚本
 * Version: 2.0
 */

// ========================================
// 页面加载
// ========================================
window.addEventListener('load', function() {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 1500);
});

// ========================================
// AOS 动画初始化
// ========================================
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true
});

// ========================================
// 粒子背景配置 - 水墨风格
// ========================================
particlesJS('particles-js', {
  particles: {
    number: { value: 30, density: { enable: true, value_area: 1000 } },
    color: { value: '#d4a574' },
    shape: { type: 'circle' },
    opacity: { value: 0.2, random: true },
    size: { value: 2, random: true },
    line_linked: { enable: true, distance: 200, color: '#8b7355', opacity: 0.15, width: 1 },
    move: { enable: true, speed: 1, direction: 'none', random: true, out_mode: 'out' }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'grab' }, resize: true },
    modes: { grab: { distance: 180, line_linked: { opacity: 0.3 } } }
  }
});

// ========================================
// 导航栏滚动效果
// ========================================
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ========================================
// 数字动画
// ========================================
const counters = document.querySelectorAll('[data-count]');
const observerOptions = { threshold: 0.5 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const count = parseInt(target.getAttribute('data-count'));
      animateCount(target, count);
      observer.unobserve(target);
    }
  });
}, observerOptions);

counters.forEach(counter => observer.observe(counter));

function animateCount(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 30);
}

// ========================================
// 复制IP功能
// ========================================
function copyIP() {
  const ip = document.getElementById('serverIp').textContent;
  navigator.clipboard.writeText(ip).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.innerHTML = '<i class="bi bi-check"></i>';
    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-clipboard"></i>';
    }, 2000);
  });
}

// ========================================
// 回到顶部
// ========================================
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================================
// 平滑滚动
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
