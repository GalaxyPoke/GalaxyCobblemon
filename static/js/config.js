// API 配置 - 只需修改这里即可全站生效
// 本地开发：http://localhost:3001
// 线上部署：https://galaxycobblemon-api.onrender.com
const API_BASE_URL = 'http://localhost:3001';

// 导出配置
window.API_CONFIG = {
  baseUrl: API_BASE_URL,
  apiUrl: `${API_BASE_URL}/api`,
  api: (path) => `${API_BASE_URL}/api${path}`
};
