/**
 * 通用页面加载动画组件
 * 使用方法：在页面中引入此脚本，然后调用 PageLoader.init(icon, name)
 * 例如：PageLoader.init('bi-controller', '游戏图鉴')
 */
(function() {
  // 注入CSS样式
  var style = document.createElement('style');
  style.textContent = `
    .page-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1c1814 0%, #2a2420 50%, #1c1814 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }
    
    .page-loader.hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    .loader-content {
      text-align: center;
    }
    
    .loader-icon {
      font-size: 4rem;
      color: #d4a574;
      animation: bounce-loader 1s infinite;
    }
    
    @keyframes bounce-loader {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    
    .loader-text {
      color: #fff;
      font-size: 1.2rem;
      margin-top: 1rem;
      font-weight: 500;
    }
    
    .loader-bar {
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin-top: 1.5rem;
      overflow: hidden;
    }
    
    .loader-progress {
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, #8b7355, #d4a574);
      border-radius: 2px;
      animation: loading 1.5s ease-in-out forwards;
    }
    
    @keyframes loading {
      0% { width: 0; }
      100% { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  // 创建加载动画DOM
  function createLoader(icon, name) {
    var loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.id = 'pageLoader';
    loader.innerHTML = 
      '<div class="loader-content">' +
        '<div class="loader-icon"><i class="bi ' + icon + '"></i></div>' +
        '<div class="loader-text">正在加载 ' + name + '...</div>' +
        '<div class="loader-bar"><div class="loader-progress"></div></div>' +
      '</div>';
    return loader;
  }

  // 隐藏加载动画
  function hideLoader() {
    var loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  // 暴露全局API
  window.PageLoader = {
    /**
     * 初始化页面加载动画
     * @param {string} icon - Bootstrap图标类名，如 'bi-controller'
     * @param {string} name - 页面名称，如 '游戏图鉴'
     */
    init: function(icon, name) {
      // 插入到body最前面
      var loader = createLoader(icon, name);
      document.body.insertBefore(loader, document.body.firstChild);
      
      // 页面加载完成后隐藏
      window.addEventListener('load', function() {
        setTimeout(hideLoader, 500);
      });
    },
    
    /**
     * 手动隐藏加载动画
     */
    hide: function() {
      hideLoader();
    },
    
    /**
     * 手动显示加载动画（需要先init）
     */
    show: function() {
      var loader = document.getElementById('pageLoader');
      if (loader) {
        loader.classList.remove('hidden');
      }
    }
  };
})();
