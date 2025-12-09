const express = require('express');
const database = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const db = database.getDb();

const router = express.Router();

// 获取所有公告（公开）
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const announcements = db.prepare(`
    SELECT * FROM announcements 
    ORDER BY pinned DESC, created_at DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;

  res.json({
    announcements,
    total,
    limit,
    offset
  });
});

// 获取单个公告
router.get('/:id', (req, res) => {
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);

  if (!announcement) {
    return res.status(404).json({ error: '公告不存在' });
  }

  res.json(announcement);
});

// 创建公告（需要认证）
router.post('/', authenticateToken, (req, res) => {
  const { title, content, type = 'info', pinned = false } = req.body;
  const author = req.user?.username || '府衙';

  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }

  const result = db.prepare(`
    INSERT INTO announcements (title, content, type, pinned, author) 
    VALUES (?, ?, ?, ?, ?)
  `).run(title, content, type, pinned ? 1 : 0, author);

  res.status(201).json({
    message: '公告创建成功',
    id: result.lastInsertRowid
  });
});

// 更新公告（需要认证）
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content, type, pinned } = req.body;

  const existing = db.prepare('SELECT id FROM announcements WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '公告不存在' });
  }

  db.prepare(`
    UPDATE announcements 
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        type = COALESCE(?, type),
        pinned = COALESCE(?, pinned),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content, type, pinned !== undefined ? (pinned ? 1 : 0) : null, req.params.id);

  res.json({ message: '公告更新成功' });
});

// 删除公告（需要认证）
router.delete('/:id', authenticateToken, (req, res) => {
  const existing = db.prepare('SELECT id FROM announcements WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '公告不存在' });
  }

  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);

  res.json({ message: '公告删除成功' });
});

module.exports = router;
