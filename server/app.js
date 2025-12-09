const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const database = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    /\.netlify\.app$/,  // 允许所有 Netlify 子域名
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件 - 上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GalaxyPokemon API 运行中',
    time: new Date().toISOString()
  });
});

// 服务器状态（模拟）
app.get('/api/server-status', (req, res) => {
  res.json({
    online: true,
    players: Math.floor(Math.random() * 50) + 10,
    maxPlayers: 100,
    version: '1.21.1',
    uptime: '99.9%'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 初始化数据库后启动服务器
async function startServer() {
  try {
    await database.init();
    
    // 加载路由（数据库初始化后）
    const authRoutes = require('./routes/auth');
    const announcementRoutes = require('./routes/announcements');
    const feedbackRoutes = require('./routes/feedback');
    const playerAuthRoutes = require('./routes/player-auth');
    const forumRoutes = require('./routes/forum');
    const uploadRoutes = require('./routes/upload');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/announcements', announcementRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/player', playerAuthRoutes);
    app.use('/api/forum', forumRoutes);
    app.use('/api/upload', uploadRoutes);
    
    app.listen(PORT, () => {
      console.log(`
  ╔════════════════════════════════════════╗
  ║   GalaxyPokemon API Server Started     ║
  ║   http://localhost:${PORT}                 ║
  ╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();
