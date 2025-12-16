const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'galaxypokemon.db');

let db = null;

// 初始化数据库
async function initDatabase() {
  const SQL = await initSqlJs();
  
  // 如果数据库文件存在，加载它
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      pinned INTEGER DEFAULT 0,
      author TEXT DEFAULT '府衙',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 检查并添加 author 字段（兼容旧数据库）
  try {
    db.run("ALTER TABLE announcements ADD COLUMN author TEXT DEFAULT '府衙'");
  } catch (e) {
    // 字段已存在，忽略错误
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT,
      type TEXT DEFAULT 'suggestion',
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      player_uuid TEXT,
      category TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 论坛帖子表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'discussion',
      author TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      pinned INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 兼容旧数据库，添加 featured 字段
  try {
    db.run("ALTER TABLE forum_posts ADD COLUMN featured INTEGER DEFAULT 0");
  } catch (e) {}
  
  // 添加最后回复时间字段
  try {
    db.run("ALTER TABLE forum_posts ADD COLUMN last_reply_at DATETIME");
  } catch (e) {}

  // 论坛回复表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES forum_posts(id)
    )
  `);

  // 点赞记录表（防止重复点赞）
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, username)
    )
  `);

  // 回复点赞记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_reply_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reply_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reply_id, username)
    )
  `);

  // 举报记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reporter TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 通知表
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      from_user TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 收藏表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, username)
    )
  `);

  // 为回复表添加 parent_id 字段（楼中楼回复）
  try {
    db.run("ALTER TABLE forum_replies ADD COLUMN parent_id INTEGER DEFAULT NULL");
  } catch (e) {}

  // 为回复表添加 reply_to 字段（被回复的用户名）
  try {
    db.run("ALTER TABLE forum_replies ADD COLUMN reply_to TEXT DEFAULT NULL");
  } catch (e) {}

  // 帖子编辑历史表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_post_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      editor TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES forum_posts(id)
    )
  `);

  // 帖子标签表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#d4a574',
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 帖子-标签关联表
  db.run(`
    CREATE TABLE IF NOT EXISTS forum_post_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      UNIQUE(post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES forum_posts(id),
      FOREIGN KEY (tag_id) REFERENCES forum_tags(id)
    )
  `);

  // 私信表
  db.run(`
    CREATE TABLE IF NOT EXISTS private_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 用户勋章表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_icon TEXT,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username, badge_type)
    )
  `);

  // 用户积分和等级表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      total_checkins INTEGER DEFAULT 0,
      continuous_checkins INTEGER DEFAULT 0,
      last_checkin DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 积分记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS points_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 帖子草稿表
  db.run(`
    CREATE TABLE IF NOT EXISTS post_drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      title TEXT,
      content TEXT,
      category TEXT DEFAULT 'discussion',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建或更新管理员账号
  const oldAdmin = db.exec("SELECT id FROM admins WHERE username = 'admin'");
  if (oldAdmin.length > 0 && oldAdmin[0].values.length > 0) {
    // 将旧的 admin 账号更新为 GalaxyPokemon
    db.run("UPDATE admins SET username = 'GalaxyPokemon' WHERE username = 'admin'");
    console.log('✓ 管理员账号已更新为: GalaxyPokemon');
  }
  
  // 如果没有任何管理员，创建新的
  const adminExists = db.exec("SELECT id FROM admins");
  if (adminExists.length === 0 || adminExists[0].values.length === 0) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [
      'GalaxyPokemon',
      hashedPassword
    ]);
    console.log('✓ 默认管理员账号已创建: GalaxyPokemon');
  }

  // 创建官方精华帖子
  const officialPosts = db.exec("SELECT id FROM forum_posts WHERE author = 'GalaxyPokemon' AND pinned = 1");
  if (officialPosts.length === 0 || officialPosts[0].values.length === 0) {
    // 等级规则帖子
    db.run(`INSERT INTO forum_posts (title, content, author, category, pinned, featured, likes) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      '📜 功名之路 - 论坛等级规则',
      `# 📜 功名之路 - 论坛等级规则

> 古有科举取士，今有论坛晋级。欢迎诸位踏上功名之路！

---

## 🎓 等级称号一览

| 品阶 | 称号 | 所需经验 | 说明 |
|:----:|:----:|:--------:|:-----|
| 一品 | 白丁 | 0 | 初入江湖，尚未开蒙 |
| 二品 | 童生 | 100 | 略识文墨，初窥门径 |
| 三品 | 秀才 | 300 | 饱读诗书，小有所成 |
| 四品 | 举人 | 600 | 乡试及第，名动一方 |
| 五品 | 贡士 | 1000 | 会试高中，前途无量 |
| 六品 | 进士 | 1500 | 殿试题名，金榜有名 |
| 七品 | 翰林 | 2500 | 入翰林院，文采斐然 |
| 八品 | 侍郎 | 4000 | 位列朝堂，辅佐君王 |
| 九品 | 尚书 | 6000 | 执掌六部，权倾一时 |
| 十品 | 太傅 | 10000 | 帝师之尊，德高望重 |

---

## 📖 经验获取途径

| 行为 | 经验奖励 | 备注 |
|:----:|:--------:|:-----|
| 每日签到 | +10~45 | 连续签到奖励递增 |
| 发布帖子 | +20 | 优质内容更受欢迎 |
| 回复帖子 | +5 | 积极参与讨论 |
| 获得点赞 | +2 | 好内容自有人赏识 |

---

## 💰 积分用途

积分可用于：
- 🎁 兑换专属称号
- 🏆 参与活动抽奖
- ✨ 解锁论坛特权

*更多玩法，敬请期待...*

---

> *"十年寒窗无人问，一举成名天下知。"*
> 
> 祝各位早日金榜题名，位极人臣！`,
      'GalaxyPokemon',
      'discussion',
      1,
      1,
      0
    ]);

    // 论坛规章帖子
    db.run(`INSERT INTO forum_posts (title, content, author, category, pinned, featured, likes) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      '📋 论坛发言规章制度',
      `# 📋 论坛发言规章制度

> 无规矩不成方圆，良好的社区氛围需要大家共同维护。

---

## 📌 基本准则

| 条款 | 规定 | 说明 |
|:----:|:-----|:-----|
| 第一条 | **文明发言** | 不得辱骂、人身攻击、发布歧视性言论 |
| 第二条 | **禁止广告** | 不得发布商业推广、外站引流、交易信息 |
| 第三条 | **尊重原创** | 转载需注明出处，不得盗用他人作品 |
| 第四条 | **禁止刷屏** | 不得恶意灌水、重复发帖、无意义回复 |
| 第五条 | **遵守法律** | 不得发布违法违规内容、传播不良信息 |

---

## ✅ 鼓励行为

| 行为 | 说明 |
|:----:|:-----|
| 🌟 原创分享 | 分享游戏心得、攻略教程、创意作品 |
| 💬 友善讨论 | 积极参与话题讨论，帮助解答问题 |
| 🎨 优质内容 | 发布有价值、有深度的帖子 |
| 🤝 互帮互助 | 热心帮助新人，营造友好氛围 |

---

## ⚠️ 违规处理

| 违规等级 | 处理方式 | 示例 |
|:--------:|:--------:|:-----|
| 轻微违规 | 警告 + 删帖 | 无意义灌水、轻微不当言论 |
| 一般违规 | 禁言 1-7 天 | 人身攻击、发布广告 |
| 严重违规 | 永久封禁 | 违法内容、恶意破坏 |

---

## 📞 申诉渠道

如对处罚有异议，可通过以下方式申诉：
- 私信管理员说明情况
- 在建议反馈板块发帖

---

> *"己所不欲，勿施于人。"*
> 
> 共建和谐社区，从你我做起！`,
      'GalaxyPokemon',
      'discussion',
      1,
      1,
      0
    ]);

    console.log('✓ 官方精华帖子已创建');
  }

  saveDatabase();
  console.log('✓ 数据库初始化完成');
}

// 保存数据库到文件
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// 封装查询方法，兼容之前的 API
const dbWrapper = {
  prepare: (sql) => ({
    run: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      saveDatabase();
      const lastId = db.exec("SELECT last_insert_rowid()");
      return { lastInsertRowid: lastId[0]?.values[0]?.[0] || 0 };
    },
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        stmt.free();
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return obj;
      }
      stmt.free();
      return null;
    },
    all: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      const columns = stmt.getColumnNames();
      while (stmt.step()) {
        const values = stmt.get();
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        results.push(obj);
      }
      stmt.free();
      return results;
    }
  }),
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  }
};

// 导出 Promise
module.exports = {
  init: initDatabase,
  getDb: () => dbWrapper,
  save: saveDatabase
};
