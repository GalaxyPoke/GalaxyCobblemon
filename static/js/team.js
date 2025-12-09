/**
 * 团队切换模块
 * 处理团队分组标签切换和分页功能
 */

// ========================================
// 团队分组切换
// ========================================
const teamTabs = document.querySelectorAll('.team-tab');
const teamPanels = document.querySelectorAll('.team-panel');
const tabKeys = ['admin', 'tech', 'build', 'ui', 'support'];

// 切换分组标签
function switchTeam(tabKey) {
  // 更新标签
  teamTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabKey);
  });

  // 更新面板
  teamPanels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === tabKey);
  });
}

// 标签点击事件
teamTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTeam(tab.dataset.tab));
});

// ========================================
// 分组内分页功能
// ========================================
teamPanels.forEach(panel => {
  const pages = panel.querySelectorAll('.team-page');
  const prevBtn = panel.querySelector('.team-nav-btn.prev');
  const nextBtn = panel.querySelector('.team-nav-btn.next');
  const currentPageSpan = panel.querySelector('.current-page');
  const totalPagesSpan = panel.querySelector('.total-pages');
  let currentPage = 0;
  const totalPages = pages.length;

  // 更新总页数显示
  if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

  function showPage(index) {
    if (index < 0) index = totalPages - 1;
    if (index >= totalPages) index = 0;
    currentPage = index;

    pages.forEach((page, i) => {
      page.classList.toggle('active', i === currentPage);
    });

    if (currentPageSpan) currentPageSpan.textContent = currentPage + 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => showPage(currentPage - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => showPage(currentPage + 1));
  }
});
