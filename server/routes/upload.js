const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'galaxypokemon-secret-key';

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/forum');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 验证玩家身份
function authenticatePlayer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '登录已过期' });
    }
    req.user = user;
    next();
  });
}

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    cb(new Error('不支持的图片格式，仅支持 JPG、PNG、GIF、WebP'), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

// 图片上传接口
router.post('/image', authenticatePlayer, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: '图片大小不能超过 5MB' });
        }
        return res.status(400).json({ error: '上传失败: ' + err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请选择图片' });
    }

    // 返回图片URL
    const imageUrl = `/uploads/forum/${req.file.filename}`;
    
    console.log(`✓ 图片上传成功: ${req.file.filename} by ${req.user.username}`);
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  });
});

// 删除图片（可选，用于编辑帖子时删除旧图片）
router.delete('/image/:filename', authenticatePlayer, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  // 安全检查：确保文件名不包含路径遍历
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: '无效的文件名' });
  }
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

module.exports = router;
