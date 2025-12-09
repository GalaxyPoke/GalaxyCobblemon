const express = require('express');
const jwt = require('jsonwebtoken');
const database = require('../db/database');

const router = express.Router();

// 验证玩家 Token 中间件
function authenticatePlayer(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'galaxy-pokemon-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '登录已过期，请重新登录' });
    }
    req.user = user;
    next();
  });
}

// 获取帖子列表
router.get('/posts', (req, res) => {
  try {
    const db = database.getDb();
    const { category, sort, page = 1, limit = 20, search } = req.query;
    
    let sql = 'SELECT * FROM forum_posts';
    const params = [];
    const conditions = [];
    
    // 分类筛选
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    
    // 搜索
    if (search && search.trim()) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // 排序
    if (sort === 'hot') {
      sql += ' ORDER BY pinned DESC, views DESC, created_at DESC';
    } else if (sort === 'likes') {
      sql += ' ORDER BY pinned DESC, likes DESC, created_at DESC';
    } else {
      sql += ' ORDER BY pinned DESC, created_at DESC';
    }
    
    // 分页
    const offset = (page - 1) * limit;
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    
    const posts = db.prepare(sql).all(...params);
    
    // 获取总数（用于分页）
    let countSql = 'SELECT COUNT(*) as total FROM forum_posts';
    if (conditions.length > 0) {
      countSql += ' WHERE ' + conditions.join(' AND ');
    }
    const totalResult = db.prepare(countSql).get(...params.slice(0, conditions.length === 2 ? 2 : conditions.length));
    const total = totalResult?.total || 0;
    
    // 获取每个帖子的回复数
    const postsWithReplies = posts.map(post => {
      const replyCount = db.prepare('SELECT COUNT(*) as count FROM forum_replies WHERE post_id = ?').get(post.id);
      return { ...post, replies: replyCount?.count || 0 };
    });
    
    res.json({
      posts: postsWithReplies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

// 获取单个帖子详情
router.get('/posts/:id', (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    
    // 先增加浏览量
    db.prepare('UPDATE forum_posts SET views = views + 1 WHERE id = ?').run(id);
    
    // 再获取帖子（包含更新后的浏览量）
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    // 获取回复
    const replies = db.prepare('SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC').all(id);
    
    res.json({ ...post, replies });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

// 发布帖子
router.post('/posts', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { title, content, category } = req.body;
    const author = req.user.username;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    if (title.length > 100) {
      return res.status(400).json({ error: '标题不能超过100个字符' });
    }
    
    if (content.length > 10000) {
      return res.status(400).json({ error: '内容不能超过10000个字符' });
    }
    
    const result = db.prepare(
      'INSERT INTO forum_posts (title, content, category, author) VALUES (?, ?, ?, ?)'
    ).run(title, content, category || 'discussion', author);
    
    res.json({ 
      message: '发布成功',
      postId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    res.status(500).json({ error: '发布帖子失败' });
  }
});

// 回复帖子
router.post('/posts/:id/replies', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user.username;
    
    if (!content) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }
    
    // 检查帖子是否存在
    const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    const result = db.prepare(
      'INSERT INTO forum_replies (post_id, content, author) VALUES (?, ?, ?)'
    ).run(id, content, author);
    
    res.json({ 
      message: '回复成功',
      replyId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('回复失败:', error);
    res.status(500).json({ error: '回复失败' });
  }
});

// 编辑帖子
router.put('/posts/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const { title, content } = req.body;
    const author = req.user.username;
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT author FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    if (post.author !== author) {
      return res.status(403).json({ error: '只能编辑自己的帖子' });
    }
    
    db.prepare('UPDATE forum_posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, content, id);
    
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('编辑帖子失败:', error);
    res.status(500).json({ error: '编辑帖子失败' });
  }
});

// 删除帖子
router.delete('/posts/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const author = req.user.username;
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT author FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    if (post.author !== author) {
      return res.status(403).json({ error: '只能删除自己的帖子' });
    }
    
    // 删除回复
    db.prepare('DELETE FROM forum_replies WHERE post_id = ?').run(id);
    // 删除帖子
    db.prepare('DELETE FROM forum_posts WHERE id = ?').run(id);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ error: '删除帖子失败' });
  }
});

// 编辑回复
router.put('/replies/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const replyId = req.params.id;
    const { content } = req.body;
    const username = req.user.username;
    
    // 检查回复是否存在且是作者
    const reply = db.prepare('SELECT * FROM forum_replies WHERE id = ?').get(replyId);
    
    if (!reply) {
      return res.status(404).json({ error: '回复不存在' });
    }
    
    if (reply.author !== username) {
      return res.status(403).json({ error: '只能编辑自己的回复' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }
    
    db.prepare('UPDATE forum_replies SET content = ? WHERE id = ?').run(content.trim(), replyId);
    
    res.json({ message: '编辑成功' });
  } catch (error) {
    console.error('编辑回复失败:', error);
    res.status(500).json({ error: '编辑失败' });
  }
});

// 删除回复
router.delete('/replies/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const replyId = req.params.id;
    const username = req.user.username;
    
    // 检查回复是否存在且是作者
    const reply = db.prepare('SELECT * FROM forum_replies WHERE id = ?').get(replyId);
    
    if (!reply) {
      return res.status(404).json({ error: '回复不存在' });
    }
    
    if (reply.author !== username) {
      return res.status(403).json({ error: '只能删除自己的回复' });
    }
    
    db.prepare('DELETE FROM forum_replies WHERE id = ?').run(replyId);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除回复失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 管理员列表（可以配置）
const ADMIN_USERS = ['Flechazo_o', 'admin'];

// 置顶/取消置顶帖子（仅管理员）
router.post('/posts/:id/pin', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const username = req.user.username;
    
    // 检查是否是管理员
    if (!ADMIN_USERS.includes(username)) {
      return res.status(403).json({ error: '只有管理员可以置顶帖子' });
    }
    
    // 检查帖子是否存在
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    // 切换置顶状态
    const newPinned = post.pinned ? 0 : 1;
    db.prepare('UPDATE forum_posts SET pinned = ? WHERE id = ?').run(newPinned, postId);
    
    res.json({ 
      message: newPinned ? '已置顶' : '已取消置顶',
      pinned: !!newPinned
    });
  } catch (error) {
    console.error('置顶操作失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 设置/取消精华帖（仅管理员）
router.post('/posts/:id/feature', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const username = req.user.username;
    
    // 检查是否是管理员
    if (!ADMIN_USERS.includes(username)) {
      return res.status(403).json({ error: '只有管理员可以设置精华' });
    }
    
    // 检查帖子是否存在
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    // 切换精华状态
    const newFeatured = post.featured ? 0 : 1;
    db.prepare('UPDATE forum_posts SET featured = ? WHERE id = ?').run(newFeatured, postId);
    
    res.json({ 
      message: newFeatured ? '已设为精华' : '已取消精华',
      featured: !!newFeatured
    });
  } catch (error) {
    console.error('精华操作失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 点赞帖子
router.post('/posts/:id/like', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const username = req.user.username;
    
    // 检查是否已点赞
    const existingLike = db.prepare('SELECT id FROM forum_likes WHERE post_id = ? AND username = ?').get(id, username);
    
    if (existingLike) {
      // 取消点赞
      db.prepare('DELETE FROM forum_likes WHERE post_id = ? AND username = ?').run(id, username);
      db.prepare('UPDATE forum_posts SET likes = likes - 1 WHERE id = ? AND likes > 0').run(id);
      res.json({ message: '已取消点赞', liked: false });
    } else {
      // 添加点赞
      db.prepare('INSERT INTO forum_likes (post_id, username) VALUES (?, ?)').run(id, username);
      db.prepare('UPDATE forum_posts SET likes = likes + 1 WHERE id = ?').run(id);
      res.json({ message: '点赞成功', liked: true });
    }
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});

// 检查是否已点赞
router.get('/posts/:id/like-status', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const username = req.user.username;
    
    const liked = db.prepare('SELECT id FROM forum_likes WHERE post_id = ? AND username = ?').get(id, username);
    res.json({ liked: !!liked });
  } catch (error) {
    res.status(500).json({ error: '查询失败' });
  }
});

// 举报帖子或回复
router.post('/report', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { type, targetId, reason } = req.body;
    const reporter = req.user.username;
    
    if (!type || !targetId || !reason) {
      return res.status(400).json({ error: '请填写举报原因' });
    }
    
    if (!['post', 'reply'].includes(type)) {
      return res.status(400).json({ error: '无效的举报类型' });
    }
    
    // 检查是否已举报过
    const existing = db.prepare('SELECT id FROM forum_reports WHERE type = ? AND target_id = ? AND reporter = ?').get(type, targetId, reporter);
    if (existing) {
      return res.status(400).json({ error: '您已举报过该内容' });
    }
    
    // 添加举报记录
    db.prepare('INSERT INTO forum_reports (type, target_id, reason, reporter) VALUES (?, ?, ?, ?)').run(type, targetId, reason, reporter);
    
    res.json({ message: '举报成功，我们会尽快处理' });
  } catch (error) {
    console.error('举报失败:', error);
    res.status(500).json({ error: '举报失败' });
  }
});

// 获取举报列表（管理员）
router.get('/reports', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    if (!ADMIN_USERS.includes(username)) {
      return res.status(403).json({ error: '无权限' });
    }
    
    const reports = db.prepare('SELECT * FROM forum_reports ORDER BY created_at DESC').all();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 处理举报（管理员）
router.post('/reports/:id/handle', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const reportId = req.params.id;
    const { action } = req.body; // 'dismiss' 或 'delete'
    const username = req.user.username;
    
    if (!ADMIN_USERS.includes(username)) {
      return res.status(403).json({ error: '无权限' });
    }
    
    const report = db.prepare('SELECT * FROM forum_reports WHERE id = ?').get(reportId);
    if (!report) {
      return res.status(404).json({ error: '举报不存在' });
    }
    
    if (action === 'delete') {
      // 删除被举报的内容
      if (report.type === 'post') {
        db.prepare('DELETE FROM forum_replies WHERE post_id = ?').run(report.target_id);
        db.prepare('DELETE FROM forum_posts WHERE id = ?').run(report.target_id);
      } else {
        db.prepare('DELETE FROM forum_replies WHERE id = ?').run(report.target_id);
      }
    }
    
    // 更新举报状态
    db.prepare('UPDATE forum_reports SET status = ? WHERE id = ?').run(action === 'delete' ? 'deleted' : 'dismissed', reportId);
    
    res.json({ message: action === 'delete' ? '已删除内容' : '已忽略举报' });
  } catch (error) {
    console.error('处理举报失败:', error);
    res.status(500).json({ error: '处理失败' });
  }
});

// 回复点赞
router.post('/replies/:id/like', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const replyId = req.params.id;
    const username = req.user.username;
    
    // 检查回复是否存在
    const reply = db.prepare('SELECT * FROM forum_replies WHERE id = ?').get(replyId);
    if (!reply) {
      return res.status(404).json({ error: '回复不存在' });
    }
    
    // 检查是否已点赞
    const existingLike = db.prepare('SELECT id FROM forum_reply_likes WHERE reply_id = ? AND username = ?').get(replyId, username);
    
    if (existingLike) {
      // 取消点赞
      db.prepare('DELETE FROM forum_reply_likes WHERE reply_id = ? AND username = ?').run(replyId, username);
      db.prepare('UPDATE forum_replies SET likes = likes - 1 WHERE id = ? AND likes > 0').run(replyId);
      res.json({ message: '已取消点赞', liked: false, likes: Math.max(0, reply.likes - 1) });
    } else {
      // 添加点赞
      db.prepare('INSERT INTO forum_reply_likes (reply_id, username) VALUES (?, ?)').run(replyId, username);
      db.prepare('UPDATE forum_replies SET likes = likes + 1 WHERE id = ?').run(replyId);
      res.json({ message: '点赞成功', liked: true, likes: reply.likes + 1 });
    }
  } catch (error) {
    console.error('回复点赞失败:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});

// 编辑帖子
router.put('/posts/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const { title, content, category } = req.body;
    const username = req.user.username;
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(postId);
    
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    if (post.author !== username) {
      return res.status(403).json({ error: '只能编辑自己的帖子' });
    }
    
    // 验证输入
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    // 更新帖子
    db.prepare(`
      UPDATE forum_posts 
      SET title = ?, content = ?, category = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(title, content, category || post.category, postId);
    
    res.json({ message: '编辑成功' });
  } catch (error) {
    console.error('编辑帖子失败:', error);
    res.status(500).json({ error: '编辑失败' });
  }
});

// 删除帖子
router.delete('/posts/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const username = req.user.username;
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(postId);
    
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    if (post.author !== username) {
      return res.status(403).json({ error: '只能删除自己的帖子' });
    }
    
    // 删除帖子的回复
    db.prepare('DELETE FROM forum_replies WHERE post_id = ?').run(postId);
    
    // 删除帖子的点赞记录
    db.prepare('DELETE FROM forum_likes WHERE post_id = ?').run(postId);
    
    // 删除帖子
    db.prepare('DELETE FROM forum_posts WHERE id = ?').run(postId);
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 获取论坛统计
router.get('/stats', (req, res) => {
  try {
    const db = database.getDb();
    
    const postCount = db.prepare('SELECT COUNT(*) as count FROM forum_posts').get();
    const replyCount = db.prepare('SELECT COUNT(*) as count FROM forum_replies').get();
    
    // 按分类统计
    const categories = ['discussion', 'question', 'share', 'suggestion'];
    const categoryStats = {};
    categories.forEach(cat => {
      const count = db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE category = ?').get(cat);
      categoryStats[cat] = count?.count || 0;
    });
    
    res.json({
      totalPosts: postCount?.count || 0,
      totalReplies: replyCount?.count || 0,
      categories: categoryStats
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

// 获取活跃用户排行
router.get('/top-users', (req, res) => {
  try {
    const db = database.getDb();
    
    // 统计每个用户的发帖数量
    const users = db.prepare(`
      SELECT author, COUNT(*) as post_count 
      FROM forum_posts 
      GROUP BY author 
      ORDER BY post_count DESC 
      LIMIT 5
    `).all();
    
    res.json(users);
  } catch (error) {
    console.error('获取活跃用户失败:', error);
    res.status(500).json({ error: '获取活跃用户失败' });
  }
});

module.exports = router;
