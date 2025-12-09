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
