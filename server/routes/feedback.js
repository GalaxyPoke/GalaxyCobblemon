const express = require('express');
const database = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const db = database.getDb();

const router = express.Router();

// 提交反馈（公开）
router.post('/', (req, res) => {
  const { name, contact, type = 'suggestion', content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: '姓名和内容不能为空' });
  }

  const result = db.prepare(`
    INSERT INTO feedback (name, contact, type, content) 
    VALUES (?, ?, ?, ?)
  `).run(name, contact || '', type, content);

  res.status(201).json({
    message: '反馈提交成功，感谢您的意见！',
    id: result.lastInsertRowid
  });
});

// 获取所有反馈（需要认证）
router.get('/', authenticateToken, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status;

  let query = 'SELECT * FROM feedback';
  let params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const feedbacks = db.prepare(query).all(...params);

  let countQuery = 'SELECT COUNT(*) as count FROM feedback';
  if (status) {
    countQuery += ' WHERE status = ?';
  }
  const total = db.prepare(countQuery).get(status || undefined)?.count || 0;

  res.json({
    feedbacks,
    total,
    limit,
    offset
  });
});

// 获取单个反馈（需要认证）
router.get('/:id', authenticateToken, (req, res) => {
  const feedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id);

  if (!feedback) {
    return res.status(404).json({ error: '反馈不存在' });
  }

  res.json(feedback);
});

// 更新反馈状态/回复（需要认证）
router.put('/:id', authenticateToken, (req, res) => {
  const { status, reply } = req.body;

  const existing = db.prepare('SELECT id FROM feedback WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '反馈不存在' });
  }

  db.prepare(`
    UPDATE feedback 
    SET status = COALESCE(?, status),
        reply = COALESCE(?, reply)
    WHERE id = ?
  `).run(status, reply, req.params.id);

  res.json({ message: '反馈更新成功' });
});

// 删除反馈（需要认证）
router.delete('/:id', authenticateToken, (req, res) => {
  const existing = db.prepare('SELECT id FROM feedback WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '反馈不存在' });
  }

  db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);

  res.json({ message: '反馈删除成功' });
});

// 获取统计数据（需要认证）
router.get('/stats/summary', authenticateToken, (req, res) => {
  const stats = {
    total: db.prepare('SELECT COUNT(*) as count FROM feedback').get().count,
    pending: db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'pending'").get().count,
    resolved: db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'resolved'").get().count,
    rejected: db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'rejected'").get().count
  };

  res.json(stats);
});

module.exports = router;
