/**
 * 统一导航栏组件
 * 所有页面只需引入此文件，导航栏会自动生成
 * 新增页面时只需修改此文件即可全站生效
 */

// 导航栏配置 - 修改这里即可全站生效
const navConfig = {
  // 品牌信息
  brand: {
    name: 'GalaxyPokemon',
    badge: 'MineCraft',
    logo: 'static/image/Web.png',
    href: 'index.html'
  },
  
  // 主导航项（从左到右显示）
  mainNav: [
    { name: '主殿', href: 'index.html', icon: '' },
    { name: '榜文', href: 'bangwen.html', icon: '' },
    { name: '金榜', href: 'jinbang.html', icon: '' },
    { name: '论坛', href: 'forum.html', icon: '' }
  ],
  
  // 玩法下拉菜单
  gameplayMenu: [
    { name: '商业街', href: 'gameplay.html', icon: 'bi-shop' },
    { name: '建筑大比拼', href: 'building-contest.html', icon: 'bi-building' },
    { name: '公会系统', href: 'guild.html', icon: 'bi-people-fill' },
    { name: '家园系统', href: 'home.html', icon: 'bi-house-heart' },
    { name: '道馆系统', href: 'gym.html', icon: 'bi-shield-fill' },
    { name: '训练师对战', href: 'trainer-battle.html', icon: 'bi-lightning-charge' },
    { name: '反馈系统', href: 'feedback.html', icon: 'bi-chat-square-text' },
    { name: '图鉴收集', href: 'pokedex-collection.html', icon: 'bi-journal-bookmark' },
    { name: '宝可梦皮肤', href: 'pokemon-skins.html', icon: 'bi-palette2' },
    { name: '诗词文化', href: 'poetry.html', icon: 'bi-book' },
    { name: '区域音乐', href: 'region-music.html', icon: 'bi-music-note-beamed' }
  ],
  
  // 帮助下拉菜单
  helpMenu: [
    { name: '皮肤预览', href: 'skin.html', icon: 'bi-person-badge' },
    { name: '宝可梦图鉴', href: 'pokedex.html', icon: 'bi-book' },
    { name: '人物图鉴', href: 'pokemon-characters.html', icon: 'bi-people' },
    { name: '游戏图鉴', href: 'pokemon-games.html', icon: 'bi-controller' },
    { name: '热门宝可梦', href: 'trending.html', icon: 'bi-fire' },
    { name: 'Cobblemon百科', href: 'cobblemon.html', icon: 'bi-journal-richtext' },
    { name: '对战模拟器', href: 'battle-simulator.html', icon: 'bi-lightning-charge' },
    { name: '队伍构建器', href: 'team-builder.html', icon: 'bi-people-fill' },
    { divider: true },
    { name: '入服教程', href: 'guide.html', icon: 'bi-signpost-2' }
  ],
  
  // 右侧按钮
  buttons: [
    { name: '加入', href: 'guide.html', icon: 'bi-people-fill', style: 'outline' },
    { name: '下载', href: 'download.html', icon: 'bi-download', style: 'primary' }
  ]
};

// 获取当前页面文件名
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return page;
}

// 生成导航栏HTML
function generateNavbar() {
  const currentPage = getCurrentPage();
  
  // 主导航项
  let mainNavHtml = navConfig.mainNav.map(item => {
    const isActive = currentPage === item.href ? ' active' : '';
    const icon = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
    return `<li class="nav-item"><a class="nav-link${isActive}" href="${item.href}">${icon}${item.name}</a></li>`;
  }).join('\n          ');
  
  // 玩法菜单项
  let gameplayMenuHtml = navConfig.gameplayMenu.map(item => {
    if (item.divider) {
      return '<li><hr class="dropdown-divider"></li>';
    }
    const icon = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
    return `<li><a class="dropdown-item" href="${item.href}">${icon}${item.name}</a></li>`;
  }).join('\n              ');
  
  // 检查玩法菜单中是否有当前页面
  const isGameplayActive = navConfig.gameplayMenu.some(item => item.href === currentPage);
  const gameplayActiveClass = isGameplayActive ? ' active' : '';
  
  // 帮助菜单项
  let helpMenuHtml = navConfig.helpMenu.map(item => {
    if (item.divider) {
      return '<li><hr class="dropdown-divider"></li>';
    }
    const icon = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
    return `<li><a class="dropdown-item" href="${item.href}">${icon}${item.name}</a></li>`;
  }).join('\n              ');
  
  // 检查帮助菜单中是否有当前页面
  const isHelpActive = navConfig.helpMenu.some(item => item.href === currentPage);
  const helpActiveClass = isHelpActive ? ' active' : '';
  
  // 右侧按钮
  let buttonsHtml = navConfig.buttons.map(item => {
    const btnClass = item.style === 'primary' ? 'btn-primary btn-glow' : 'btn-outline-light';
    const icon = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
    return `<a href="${item.href}" class="btn ${btnClass} btn-sm me-2">${icon}${item.name}</a>`;
  }).join('\n          ');

  // 玩家登录状态
  const playerLoginHtml = `
    <div class="player-status" id="playerStatus">
      <a href="login.html" class="player-link" id="playerLink">
        <img src="https://mc-heads.net/avatar/MHF_Steve/32" alt="头像" class="player-avatar" id="navPlayerAvatar">
        <span class="player-name" id="navPlayerName">未登录</span>
      </a>
    </div>
  `;
  
  // 完整导航栏HTML
  return `
  <nav class="navbar navbar-expand-lg fixed-top glass-nav">
    <div class="container">
      <a class="navbar-brand" href="${navConfig.brand.href}">
        <span class="brand-text">${navConfig.brand.name}</span>
        <span class="brand-badge">${navConfig.brand.badge}</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <i class="bi bi-list"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          ${mainNavHtml}
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle${gameplayActiveClass}" href="#" data-bs-toggle="dropdown">玩法</a>
            <ul class="dropdown-menu">
              ${gameplayMenuHtml}
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle${helpActiveClass}" href="#" data-bs-toggle="dropdown">帮助</a>
            <ul class="dropdown-menu">
              ${helpMenuHtml}
            </ul>
          </li>
        </ul>
        <div class="nav-buttons ms-lg-3 d-flex align-items-center">
          ${playerLoginHtml}
          ${buttonsHtml}
        </div>
      </div>
    </div>
  </nav>`;
}

// 初始化导航栏
function initNavbar() {
  // 查找导航栏占位符或现有导航栏
  const placeholder = document.getElementById('navbar-placeholder');
  const existingNav = document.querySelector('nav.navbar');
  
  if (placeholder) {
    // 如果有占位符，替换它
    placeholder.outerHTML = generateNavbar();
  } else if (existingNav) {
    // 如果有现有导航栏，替换它
    existingNav.outerHTML = generateNavbar();
  } else {
    // 否则插入到body开头
    document.body.insertAdjacentHTML('afterbegin', generateNavbar());
  }
}

// 检查玩家登录状态
function checkPlayerLogin() {
  const token = localStorage.getItem('playerToken');
  const playerName = localStorage.getItem('playerName');
  
  const avatarEl = document.getElementById('navPlayerAvatar');
  const nameEl = document.getElementById('navPlayerName');
  const linkEl = document.getElementById('playerLink');
  
  if (token && playerName && avatarEl && nameEl) {
    // 已登录
    avatarEl.src = `https://mc-heads.net/avatar/${playerName}/32`;
    nameEl.textContent = playerName;
    nameEl.style.color = '#d4a574';
    
    // 点击跳转到个人中心
    if (linkEl) {
      linkEl.href = 'login.html';
    }
  }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    setTimeout(checkPlayerLogin, 100);
  });
} else {
  initNavbar();
  setTimeout(checkPlayerLogin, 100);
}
