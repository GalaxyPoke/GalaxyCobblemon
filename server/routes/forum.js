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
    } else if (sort === 'active') {
      // 按最后活跃时间排序（有新回复的帖子优先）
      sql += ' ORDER BY pinned DESC, COALESCE(last_reply_at, created_at) DESC';
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

// 解析@提及的用户
function parseMentions(content) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    if (!mentions.includes(match[1])) {
      mentions.push(match[1]);
    }
  }
  return mentions;
}

// 创建通知
function createNotification(db, username, type, title, content, link, fromUser) {
  if (username === fromUser) return; // 不给自己发通知
  db.prepare(
    'INSERT INTO notifications (username, type, title, content, link, from_user) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(username, type, title, content, link, fromUser);
}

// 回复帖子
router.post('/posts/:id/replies', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const { content, parentId, replyTo } = req.body;
    const author = req.user.username;
    
    if (!content) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }
    
    // 检查帖子是否存在
    const post = db.prepare('SELECT id, title, author FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    const result = db.prepare(
      'INSERT INTO forum_replies (post_id, content, author, parent_id, reply_to) VALUES (?, ?, ?, ?, ?)'
    ).run(id, content, author, parentId || null, replyTo || null);
    
    // 更新帖子的最后回复时间
    db.prepare('UPDATE forum_posts SET last_reply_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    
    // 通知帖子作者（如果不是自己回复自己）
    if (post.author !== author) {
      createNotification(db, post.author, 'reply', '收到新回复', 
        `${author} 回复了你的帖子「${post.title}」`, 
        `forum-post.html?id=${id}`, author);
    }
    
    // 通知被回复的用户
    if (replyTo && replyTo !== author && replyTo !== post.author) {
      createNotification(db, replyTo, 'reply', '收到新回复',
        `${author} 回复了你在「${post.title}」中的评论`,
        `forum-post.html?id=${id}`, author);
    }
    
    // 处理@提及
    const mentions = parseMentions(content);
    mentions.forEach(mentioned => {
      if (mentioned !== author && mentioned !== post.author && mentioned !== replyTo) {
        createNotification(db, mentioned, 'mention', '有人@了你',
          `${author} 在「${post.title}」中提到了你`,
          `forum-post.html?id=${id}`, author);
      }
    });
    
    res.json({ 
      message: '回复成功',
      replyId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('回复失败:', error);
    res.status(500).json({ error: '回复失败' });
  }
});

// 编辑帖子（含编辑历史）
router.put('/posts/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const { title, content } = req.body;
    const author = req.user.username;
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    if (post.author !== author) {
      return res.status(403).json({ error: '只能编辑自己的帖子' });
    }
    
    // 保存编辑历史（保存修改前的版本）
    db.prepare(
      'INSERT INTO forum_post_history (post_id, title, content, editor) VALUES (?, ?, ?, ?)'
    ).run(id, post.title, post.content, author);
    
    // 更新帖子
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

// 删除帖子（重复路由已移除，使用上面的版本）
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
    
    // 按分类统计 - 支持所有板块
    const categories = ['discussion', 'question', 'share', 'suggestion', 'guide', 'bug', 'trade', 'team'];
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

// ==================== 通知系统 ====================

// 获取用户通知列表
router.get('/notifications', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    const { unreadOnly } = req.query;
    
    let sql = 'SELECT * FROM notifications WHERE username = ?';
    if (unreadOnly === 'true') {
      sql += ' AND is_read = 0';
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    
    const notifications = db.prepare(sql).all(username);
    
    // 获取未读数量
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE username = ? AND is_read = 0').get(username);
    
    res.json({
      notifications,
      unreadCount: unreadCount?.count || 0
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({ error: '获取通知失败' });
  }
});

// 标记通知为已读
router.post('/notifications/:id/read', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const notificationId = req.params.id;
    const username = req.user.username;
    
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND username = ?').run(notificationId, username);
    
    res.json({ message: '已标记为已读' });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 标记所有通知为已读
router.post('/notifications/read-all', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    db.prepare('UPDATE notifications SET is_read = 1 WHERE username = ?').run(username);
    
    res.json({ message: '已全部标记为已读' });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 删除通知
router.delete('/notifications/:id', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const notificationId = req.params.id;
    const username = req.user.username;
    
    db.prepare('DELETE FROM notifications WHERE id = ? AND username = ?').run(notificationId, username);
    
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// ==================== 收藏系统 ====================

// 收藏/取消收藏帖子
router.post('/posts/:id/favorite', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const username = req.user.username;
    
    // 检查帖子是否存在
    const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
    // 检查是否已收藏
    const existing = db.prepare('SELECT id FROM forum_favorites WHERE post_id = ? AND username = ?').get(postId, username);
    
    if (existing) {
      // 取消收藏
      db.prepare('DELETE FROM forum_favorites WHERE post_id = ? AND username = ?').run(postId, username);
      res.json({ message: '已取消收藏', favorited: false });
    } else {
      // 添加收藏
      db.prepare('INSERT INTO forum_favorites (post_id, username) VALUES (?, ?)').run(postId, username);
      res.json({ message: '收藏成功', favorited: true });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 检查是否已收藏
router.get('/posts/:id/favorite-status', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const username = req.user.username;
    
    const favorited = db.prepare('SELECT id FROM forum_favorites WHERE post_id = ? AND username = ?').get(postId, username);
    res.json({ favorited: !!favorited });
  } catch (error) {
    res.status(500).json({ error: '查询失败' });
  }
});

// 获取用户收藏列表
router.get('/favorites', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    const favorites = db.prepare(`
      SELECT p.*, f.created_at as favorited_at
      FROM forum_favorites f
      JOIN forum_posts p ON f.post_id = p.id
      WHERE f.username = ?
      ORDER BY f.created_at DESC
    `).all(username);
    
    res.json(favorites);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// ==================== 点赞通知 ====================

// 点赞帖子（更新版，添加通知）
router.post('/posts/:id/like', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { id } = req.params;
    const username = req.user.username;
    
    // 获取帖子信息
    const post = db.prepare('SELECT id, title, author FROM forum_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    
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
      
      // 通知帖子作者
      if (post.author !== username) {
        createNotification(db, post.author, 'like', '收到点赞',
          `${username} 赞了你的帖子「${post.title}」`,
          `forum-post.html?id=${id}`, username);
      }
      
      res.json({ message: '点赞成功', liked: true });
    }
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});

// ==================== 标签系统 ====================

// 获取所有标签
router.get('/tags', (req, res) => {
  try {
    const db = database.getDb();
    const tags = db.prepare('SELECT * FROM forum_tags ORDER BY usage_count DESC').all();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 获取热门标签
router.get('/tags/hot', (req, res) => {
  try {
    const db = database.getDb();
    const tags = db.prepare('SELECT * FROM forum_tags ORDER BY usage_count DESC LIMIT 20').all();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: '获取热门标签失败' });
  }
});

// 创建标签（发帖时自动创建）
function getOrCreateTag(db, tagName) {
  let tag = db.prepare('SELECT * FROM forum_tags WHERE name = ?').get(tagName);
  if (!tag) {
    db.prepare('INSERT INTO forum_tags (name) VALUES (?)').run(tagName);
    tag = db.prepare('SELECT * FROM forum_tags WHERE name = ?').get(tagName);
  }
  return tag;
}

// 为帖子添加标签
router.post('/posts/:id/tags', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    const { tags } = req.body; // 标签名数组
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: '标签格式错误' });
    }
    
    // 检查帖子是否存在且是作者
    const post = db.prepare('SELECT author FROM forum_posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    if (post.author !== req.user.username) {
      return res.status(403).json({ error: '无权操作' });
    }
    
    // 清除旧标签关联
    const oldTags = db.prepare('SELECT tag_id FROM forum_post_tags WHERE post_id = ?').all(postId);
    db.prepare('DELETE FROM forum_post_tags WHERE post_id = ?').run(postId);
    
    // 减少旧标签使用次数
    oldTags.forEach(t => {
      db.prepare('UPDATE forum_tags SET usage_count = usage_count - 1 WHERE id = ? AND usage_count > 0').run(t.tag_id);
    });
    
    // 添加新标签
    tags.slice(0, 5).forEach(tagName => { // 最多5个标签
      const tag = getOrCreateTag(db, tagName.trim());
      if (tag) {
        try {
          db.prepare('INSERT INTO forum_post_tags (post_id, tag_id) VALUES (?, ?)').run(postId, tag.id);
          db.prepare('UPDATE forum_tags SET usage_count = usage_count + 1 WHERE id = ?').run(tag.id);
        } catch (e) {} // 忽略重复
      }
    });
    
    res.json({ message: '标签更新成功' });
  } catch (error) {
    console.error('更新标签失败:', error);
    res.status(500).json({ error: '更新标签失败' });
  }
});

// 获取帖子的标签
router.get('/posts/:id/tags', (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    
    const tags = db.prepare(`
      SELECT t.* FROM forum_tags t
      JOIN forum_post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `).all(postId);
    
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 按标签搜索帖子
router.get('/posts/by-tag/:tagName', (req, res) => {
  try {
    const db = database.getDb();
    const tagName = req.params.tagName;
    
    const posts = db.prepare(`
      SELECT p.* FROM forum_posts p
      JOIN forum_post_tags pt ON p.id = pt.post_id
      JOIN forum_tags t ON pt.tag_id = t.id
      WHERE t.name = ?
      ORDER BY p.created_at DESC
    `).all(tagName);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

// ==================== 帖子编辑历史 ====================

// 获取帖子编辑历史
router.get('/posts/:id/history', (req, res) => {
  try {
    const db = database.getDb();
    const postId = req.params.id;
    
    const history = db.prepare(`
      SELECT * FROM forum_post_history 
      WHERE post_id = ? 
      ORDER BY created_at DESC
    `).all(postId);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: '获取编辑历史失败' });
  }
});

// ==================== 用户个人主页 ====================

// 获取用户的帖子
router.get('/user/:username/posts', (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = db.prepare(`
      SELECT * FROM forum_posts 
      WHERE author = ? 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(username, parseInt(limit), offset);
    
    const total = db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE author = ?').get(username);
    
    res.json({
      posts,
      pagination: {
        total: total?.count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户帖子失败' });
  }
});

// 获取用户统计信息
router.get('/user/:username/stats', (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    
    const postCount = db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE author = ?').get(username);
    const replyCount = db.prepare('SELECT COUNT(*) as count FROM forum_replies WHERE author = ?').get(username);
    const likeCount = db.prepare('SELECT SUM(likes) as count FROM forum_posts WHERE author = ?').get(username);
    
    res.json({
      posts: postCount?.count || 0,
      replies: replyCount?.count || 0,
      likes: likeCount?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

// ============ 私信功能 ============

// 发送私信
router.post('/messages', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const { receiver, content } = req.body;
    const sender = req.user.username;
    
    if (!receiver || !content) {
      return res.status(400).json({ error: '接收者和内容不能为空' });
    }
    
    if (receiver === sender) {
      return res.status(400).json({ error: '不能给自己发私信' });
    }
    
    db.prepare('INSERT INTO private_messages (sender, receiver, content) VALUES (?, ?, ?)')
      .run(sender, receiver, content);
    
    res.json({ message: '发送成功' });
  } catch (error) {
    res.status(500).json({ error: '发送私信失败' });
  }
});

// 获取私信列表
router.get('/messages', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    const messages = db.prepare(`
      SELECT * FROM private_messages 
      WHERE receiver = ? OR sender = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(username, username);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取私信失败' });
  }
});

// 获取与某用户的对话
router.get('/messages/:username', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const currentUser = req.user.username;
    const otherUser = req.params.username;
    
    const messages = db.prepare(`
      SELECT * FROM private_messages 
      WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
      ORDER BY created_at ASC
    `).all(currentUser, otherUser, otherUser, currentUser);
    
    // 标记为已读
    db.prepare('UPDATE private_messages SET is_read = 1 WHERE sender = ? AND receiver = ?')
      .run(otherUser, currentUser);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取对话失败' });
  }
});

// 获取未读私信数量
router.get('/messages/unread/count', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    const result = db.prepare('SELECT COUNT(*) as count FROM private_messages WHERE receiver = ? AND is_read = 0').get(username);
    
    res.json({ count: result?.count || 0 });
  } catch (error) {
    res.status(500).json({ error: '获取未读数量失败' });
  }
});

// ============ 勋章系统 ============

// 获取用户勋章
router.get('/user/:username/badges', (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    
    const badges = db.prepare('SELECT * FROM user_badges WHERE username = ? ORDER BY earned_at DESC').all(username);
    
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: '获取勋章失败' });
  }
});

// 检查并授予勋章（内部调用）
function checkAndAwardBadges(db, username) {
  const postCount = db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE author = ?').get(username);
  const replyCount = db.prepare('SELECT COUNT(*) as count FROM forum_replies WHERE author = ?').get(username);
  const likeCount = db.prepare('SELECT SUM(likes) as count FROM forum_posts WHERE author = ?').get(username);
  
  const badges = [
    { type: 'first_post', name: '初来乍到', icon: '🌱', condition: postCount?.count >= 1 },
    { type: 'active_poster', name: '活跃发帖', icon: '✍️', condition: postCount?.count >= 10 },
    { type: 'prolific_poster', name: '高产作者', icon: '📚', condition: postCount?.count >= 50 },
    { type: 'first_reply', name: '热心回复', icon: '💬', condition: replyCount?.count >= 1 },
    { type: 'active_replier', name: '积极互动', icon: '🗣️', condition: replyCount?.count >= 50 },
    { type: 'liked', name: '受人喜爱', icon: '❤️', condition: (likeCount?.count || 0) >= 10 },
    { type: 'popular', name: '人气之星', icon: '⭐', condition: (likeCount?.count || 0) >= 100 },
  ];
  
  badges.forEach(badge => {
    if (badge.condition) {
      try {
        db.prepare('INSERT OR IGNORE INTO user_badges (username, badge_type, badge_name, badge_icon) VALUES (?, ?, ?, ?)')
          .run(username, badge.type, badge.name, badge.icon);
      } catch (e) {}
    }
  });
}

// 手动检查勋章
router.post('/user/:username/check-badges', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    
    if (req.user.username !== username) {
      return res.status(403).json({ error: '无权操作' });
    }
    
    checkAndAwardBadges(db, username);
    
    const badges = db.prepare('SELECT * FROM user_badges WHERE username = ?').all(username);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: '检查勋章失败' });
  }
});

// ============ 积分和等级系统 ============

// 等级配置（古代官职风格）
const LEVEL_CONFIG = [
  { level: 1, name: '白丁', exp: 0 },
  { level: 2, name: '童生', exp: 100 },
  { level: 3, name: '秀才', exp: 300 },
  { level: 4, name: '举人', exp: 600 },
  { level: 5, name: '贡士', exp: 1000 },
  { level: 6, name: '进士', exp: 1500 },
  { level: 7, name: '翰林', exp: 2500 },
  { level: 8, name: '侍郎', exp: 4000 },
  { level: 9, name: '尚书', exp: 6000 },
  { level: 10, name: '太傅', exp: 10000 }
];

// 获取用户积分和等级
router.get('/user/:username/points', (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    
    let userPoints = db.prepare('SELECT * FROM user_points WHERE username = ?').get(username);
    
    if (!userPoints) {
      db.prepare('INSERT INTO user_points (username) VALUES (?)').run(username);
      userPoints = { username, points: 0, level: 1, exp: 0, total_checkins: 0, continuous_checkins: 0 };
    }
    
    const levelInfo = LEVEL_CONFIG.find(l => l.level === userPoints.level) || LEVEL_CONFIG[0];
    const nextLevel = LEVEL_CONFIG.find(l => l.level === userPoints.level + 1);
    
    res.json({
      ...userPoints,
      levelName: levelInfo.name,
      nextLevelExp: nextLevel ? nextLevel.exp : null,
      expProgress: nextLevel ? Math.floor((userPoints.exp / nextLevel.exp) * 100) : 100
    });
  } catch (error) {
    res.status(500).json({ error: '获取积分失败' });
  }
});

// 签到
router.post('/checkin', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    const today = new Date().toISOString().split('T')[0];
    
    let userPoints = db.prepare('SELECT * FROM user_points WHERE username = ?').get(username);
    
    if (!userPoints) {
      db.prepare('INSERT INTO user_points (username) VALUES (?)').run(username);
      userPoints = { points: 0, level: 1, exp: 0, total_checkins: 0, continuous_checkins: 0, last_checkin: null };
    }
    
    if (userPoints.last_checkin === today) {
      return res.status(400).json({ error: '今天已经签到过了' });
    }
    
    // 计算连续签到
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let continuous = userPoints.last_checkin === yesterday ? userPoints.continuous_checkins + 1 : 1;
    
    // 签到奖励：基础5积分 + 连续签到奖励
    let bonus = 5 + Math.min(continuous - 1, 7) * 2;
    let expGain = 10 + Math.min(continuous - 1, 7) * 5;
    
    const newPoints = userPoints.points + bonus;
    const newExp = userPoints.exp + expGain;
    
    // 检查升级
    let newLevel = userPoints.level;
    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
      if (newExp >= LEVEL_CONFIG[i].exp) {
        newLevel = LEVEL_CONFIG[i].level;
        break;
      }
    }
    
    db.prepare(`
      UPDATE user_points SET 
        points = ?, exp = ?, level = ?,
        total_checkins = total_checkins + 1,
        continuous_checkins = ?,
        last_checkin = ?
      WHERE username = ?
    `).run(newPoints, newExp, newLevel, continuous, today, username);
    
    // 记录积分日志
    db.prepare('INSERT INTO points_log (username, points, reason) VALUES (?, ?, ?)')
      .run(username, bonus, `签到奖励（连续${continuous}天）`);
    
    const levelUp = newLevel > userPoints.level;
    const levelInfo = LEVEL_CONFIG.find(l => l.level === newLevel);
    
    res.json({
      message: '签到成功',
      points: bonus,
      exp: expGain,
      totalPoints: newPoints,
      totalExp: newExp,
      continuous,
      levelUp,
      level: newLevel,
      levelName: levelInfo?.name
    });
  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ error: '签到失败' });
  }
});

// 获取积分记录
router.get('/user/:username/points/log', (req, res) => {
  try {
    const db = database.getDb();
    const username = req.params.username;
    const limit = parseInt(req.query.limit) || 20;
    
    const logs = db.prepare('SELECT * FROM points_log WHERE username = ? ORDER BY created_at DESC LIMIT ?')
      .all(username, limit);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: '获取积分记录失败' });
  }
});

// ============ 草稿箱功能 ============

// 保存草稿
router.post('/drafts', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    const { title, content, category } = req.body;
    
    const existing = db.prepare('SELECT id FROM post_drafts WHERE username = ?').get(username);
    
    if (existing) {
      db.prepare('UPDATE post_drafts SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?')
        .run(title || '', content || '', category || 'discussion', username);
    } else {
      db.prepare('INSERT INTO post_drafts (username, title, content, category) VALUES (?, ?, ?, ?)')
        .run(username, title || '', content || '', category || 'discussion');
    }
    
    res.json({ message: '草稿已保存' });
  } catch (error) {
    res.status(500).json({ error: '保存草稿失败' });
  }
});

// 获取草稿
router.get('/drafts', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    const draft = db.prepare('SELECT * FROM post_drafts WHERE username = ?').get(username);
    
    res.json(draft || null);
  } catch (error) {
    res.status(500).json({ error: '获取草稿失败' });
  }
});

// 删除草稿
router.delete('/drafts', authenticatePlayer, (req, res) => {
  try {
    const db = database.getDb();
    const username = req.user.username;
    
    db.prepare('DELETE FROM post_drafts WHERE username = ?').run(username);
    
    res.json({ message: '草稿已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除草稿失败' });
  }
});

// 增加积分（内部函数）
function addPoints(db, username, points, reason) {
  let userPoints = db.prepare('SELECT * FROM user_points WHERE username = ?').get(username);
  
  if (!userPoints) {
    db.prepare('INSERT INTO user_points (username) VALUES (?)').run(username);
    userPoints = { points: 0, exp: 0, level: 1 };
  }
  
  const newPoints = userPoints.points + points;
  const newExp = userPoints.exp + points;
  
  let newLevel = userPoints.level;
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (newExp >= LEVEL_CONFIG[i].exp) {
      newLevel = LEVEL_CONFIG[i].level;
      break;
    }
  }
  
  db.prepare('UPDATE user_points SET points = ?, exp = ?, level = ? WHERE username = ?')
    .run(newPoints, newExp, newLevel, username);
  
  db.prepare('INSERT INTO points_log (username, points, reason) VALUES (?, ?, ?)')
    .run(username, points, reason);
}

module.exports = router;
