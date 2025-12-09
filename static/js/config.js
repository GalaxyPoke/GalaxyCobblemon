// API 配置
// 本地开发时使用 localhost，部署后改成 Render 地址
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'https://galaxycobblemon-api.onrender.com'
  : 'https://你的render地址.onrender.com';  // 部署后修改这里

// 导出配置
window.API_CONFIG = {
  baseUrl: API_BASE_URL,
  api: (path) => `${API_BASE_URL}/api${path}`
};
