// 通用轮播图功能
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const slidesContainer = document.getElementById('carouselSlides');
  const dotsContainer = document.getElementById('carouselDots');
  
  if (!slides.length || !slidesContainer || !dotsContainer) return;
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  // 创建指示点
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
  
  function updateCarousel() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }
  
  window.nextSlide = function() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }
  
  window.prevSlide = function() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }
  
  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
  }
  
  // 自动轮播
  setInterval(window.nextSlide, 5000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initCarousel);
