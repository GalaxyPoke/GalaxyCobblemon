const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const db = database.getDb();

const router = express.Router();

// 管理员登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (!admin) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const validPassword = bcrypt.compareSync(password, admin.password);
  if (!validPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 生成 JWT
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: '登录成功',
    token,
    user: { id: admin.id, username: admin.username }
  });
});

// 验证 Token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// 修改密码
router.post('/change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请输入旧密码和新密码' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(oldPassword, admin.password)) {
    return res.status(401).json({ error: '旧密码错误' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

  res.json({ message: '密码修改成功' });
});

module.exports = router;
