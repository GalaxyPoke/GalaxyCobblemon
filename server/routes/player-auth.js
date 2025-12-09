const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const router = express.Router();

// 验证码存储 (实际生产环境应该用 Redis)
const verificationCodes = new Map(); // { email: { code, expires, username, password } }

// QQ邮箱SMTP配置
// 1. 登录QQ邮箱 → 设置 → 账户
// 2. 开启 POP3/SMTP服务
// 3. 生成授权码（16位字母）
const emailConfig = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '479894990@qq.com',      // 你的QQ邮箱
    pass: 'ymhmnzmhqxpncabc'        // QQ邮箱授权码（不是密码）
  }
};

// 创建邮件发送器
let transporter = null;
try {
  transporter = nodemailer.createTransport(emailConfig);
} catch (e) {
  console.log('⚠ 邮件服务未配置，验证码将在控制台显示');
}

// AuthMe 数据库路径
const AUTHME_DB_PATH = 'C:\\Users\\LENOVO\\Desktop\\兴趣\\Cobblemon\\Galaxy_Cobblemon\\Galaxy_Cobblemon[纯净服务端]\\plugins\\AuthMe\\authme.db';

let authmeDb = null;

// 初始化 AuthMe 数据库连接
async function initAuthmeDb() {
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    
    if (fs.existsSync(AUTHME_DB_PATH)) {
      const buffer = fs.readFileSync(AUTHME_DB_PATH);
      authmeDb = new SQL.Database(buffer);
      console.log('✓ AuthMe 数据库连接成功');
    } else {
      console.error('✗ AuthMe 数据库文件不存在:', AUTHME_DB_PATH);
    }
  } catch (e) {
    console.error('✗ AuthMe 数据库连接失败:', e.message);
  }
}

// 启动时初始化
initAuthmeDb();

// SHA256 加密（AuthMe 默认方式）
function sha256Hash(password) {
  return '$SHA$' + crypto.createHash('sha256').update(password).digest('hex');
}

// AuthMe SHA256 格式验证: $SHA$salt$hash
function verifyAuthmePassword(inputPassword, storedHash) {
  if (!storedHash) return false;
  
  // AuthMe SHA256 格式: $SHA$salt$hash
  const parts = storedHash.split('$');
  
  if (parts.length === 4 && parts[1] === 'SHA') {
    const salt = parts[2];
    const hash = parts[3];
    // SHA256(SHA256(password) + salt)
    const step1 = crypto.createHash('sha256').update(inputPassword).digest('hex');
    const step2 = crypto.createHash('sha256').update(step1 + salt).digest('hex');
    return step2.toLowerCase() === hash.toLowerCase();
  }
  
  // 简单 SHA256
  const simpleHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  return simpleHash.toLowerCase() === storedHash.toLowerCase();
}

// 玩家登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }
  
  if (!authmeDb) {
    return res.status(500).json({ error: '数据库未连接，请稍后再试' });
  }
  
  try {
    // 重新读取数据库（确保数据最新）
    const buffer = fs.readFileSync(AUTHME_DB_PATH);
    const initSqlJs = require('sql.js');
    initSqlJs().then(SQL => {
      const db = new SQL.Database(buffer);
      
      // 查询玩家
      const stmt = db.prepare('SELECT * FROM authme WHERE LOWER(username) = LOWER(?)');
      stmt.bind([username]);
      
      if (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        const player = {};
        columns.forEach((col, i) => player[col] = values[i]);
        stmt.free();
        
        // 验证密码
        if (verifyAuthmePassword(password, player.password)) {
          // 生成 JWT
          const token = jwt.sign(
            { 
              username: player.realname || player.username,
              odername: player.username,
              type: 'player'
            },
            process.env.JWT_SECRET || 'galaxy-pokemon-secret',
            { expiresIn: '7d' }
          );
          
          res.json({
            message: '登录成功',
            token,
            player: {
              username: player.realname || player.username,
              email: player.email,
              lastLogin: player.lastlogin,
              regDate: player.regdate
            }
          });
        } else {
          res.status(401).json({ error: '密码错误' });
        }
      } else {
        stmt.free();
        res.status(404).json({ error: '玩家不存在' });
      }
      
      db.close();
    });
  } catch (e) {
    console.error('登录错误:', e);
    res.status(500).json({ error: '登录失败，请稍后再试' });
  }
});

// 生成 AuthMe 密码哈希
function generateAuthmeHash(password) {
  // 生成16位随机salt
  const salt = crypto.randomBytes(8).toString('hex');
  // SHA256(SHA256(password) + salt)
  const step1 = crypto.createHash('sha256').update(password).digest('hex');
  const step2 = crypto.createHash('sha256').update(step1 + salt).digest('hex');
  return `$SHA$${salt}$${step2}`;
}

// 发送验证码
router.post('/send-code', async (req, res) => {
  const { username, password, email } = req.body;
  
  // 验证输入
  if (!username || !password || !email) {
    return res.status(400).json({ error: '请填写完整信息' });
  }
  
  if (username.length < 3 || username.length > 16) {
    return res.status(400).json({ error: '用户名长度需要3-16个字符' });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '用户名只能包含字母、数字和下划线' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }
  
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(AUTHME_DB_PATH);
    const db = new SQL.Database(buffer);
    
    // 检查用户名是否已存在
    const checkStmt = db.prepare('SELECT id FROM authme WHERE LOWER(username) = LOWER(?)');
    checkStmt.bind([username]);
    
    if (checkStmt.step()) {
      checkStmt.free();
      db.close();
      return res.status(400).json({ error: '用户名已被注册' });
    }
    checkStmt.free();
    
    // 检查邮箱是否已被使用（只能绑定一次）
    const emailStmt = db.prepare("SELECT id FROM authme WHERE LOWER(email) = LOWER(?) AND email != ''");
    emailStmt.bind([email]);
    if (emailStmt.step()) {
      emailStmt.free();
      db.close();
      return res.status(400).json({ error: '该邮箱已被其他账号绑定' });
    }
    emailStmt.free();
    db.close();
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10分钟有效
    
    // 存储验证码和注册信息
    verificationCodes.set(email.toLowerCase(), {
      code,
      expires,
      username,
      password
    });
    
    // 发送邮件
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"GalaxyPokemon 服务器" <${emailConfig.auth.user}>`,
          to: email,
          subject: '【GalaxyPokemon】注册验证码',
          html: `
            <div style="padding: 30px; background: #1c1814; color: #fff; font-family: sans-serif;">
              <h2 style="color: #d4a574; margin-bottom: 20px;">GalaxyPokemon 服务器</h2>
              <p>您好，<strong>${username}</strong>！</p>
              <p>您的注册验证码是：</p>
              <div style="font-size: 32px; color: #d4a574; letter-spacing: 8px; margin: 20px 0; font-weight: bold;">${code}</div>
              <p style="color: #888;">验证码10分钟内有效，请勿泄露给他人。</p>
              <hr style="border-color: #333; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">如果这不是您的操作，请忽略此邮件。</p>
            </div>
          `
        });
        console.log(`✓ 验证码已发送至 ${email}: ${code}`);
      } catch (e) {
        console.error('邮件发送失败:', e.message);
        console.log(`⚠ 验证码 (控制台): ${email} -> ${code}`);
      }
    } else {
      // 邮件未配置，在控制台显示验证码
      console.log(`⚠ 验证码 (控制台): ${email} -> ${code}`);
    }
    
    res.json({ message: '验证码已发送', email });
    
  } catch (e) {
    console.error('发送验证码错误:', e);
    res.status(500).json({ error: '发送失败，请稍后再试' });
  }
});

// 验证并完成注册
router.post('/register', async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: '请输入验证码' });
  }
  
  // 获取验证码信息
  const stored = verificationCodes.get(email.toLowerCase());
  
  if (!stored) {
    return res.status(400).json({ error: '请先获取验证码' });
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email.toLowerCase());
    return res.status(400).json({ error: '验证码已过期，请重新获取' });
  }
  
  if (stored.code !== code) {
    return res.status(400).json({ error: '验证码错误' });
  }
  
  const { username, password } = stored;
  
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(AUTHME_DB_PATH);
    const db = new SQL.Database(buffer);
    
    // 再次检查用户名和邮箱（防止并发）
    const checkStmt = db.prepare('SELECT id FROM authme WHERE LOWER(username) = LOWER(?)');
    checkStmt.bind([username]);
    if (checkStmt.step()) {
      checkStmt.free();
      db.close();
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({ error: '用户名已被注册' });
    }
    checkStmt.free();
    
    const emailStmt = db.prepare("SELECT id FROM authme WHERE LOWER(email) = LOWER(?) AND email != ''");
    emailStmt.bind([email]);
    if (emailStmt.step()) {
      emailStmt.free();
      db.close();
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({ error: '该邮箱已被绑定' });
    }
    emailStmt.free();
    
    // 生成密码哈希
    const passwordHash = generateAuthmeHash(password);
    const now = Date.now();
    
    // 插入新用户
    db.run(`
      INSERT INTO authme (username, realname, password, email, regdate, regip, isLogged)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [username.toLowerCase(), username, passwordHash, email, now, '127.0.0.1']);
    
    // 保存数据库
    const data = db.export();
    const dbBuffer = Buffer.from(data);
    fs.writeFileSync(AUTHME_DB_PATH, dbBuffer);
    db.close();
    
    // 删除验证码
    verificationCodes.delete(email.toLowerCase());
    
    console.log(`✓ 新玩家注册: ${username} (${email})`);
    
    // 生成 JWT 并自动登录
    const token = jwt.sign(
      { 
        username: username,
        type: 'player'
      },
      process.env.JWT_SECRET || 'galaxy-pokemon-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: '注册成功',
      token,
      player: {
        username: username,
        email: email || null
      }
    });
    
  } catch (e) {
    console.error('注册错误:', e);
    res.status(500).json({ error: '注册失败，请稍后再试' });
  }
});

// 验证玩家 Token
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'galaxy-pokemon-secret');
    if (decoded.type !== 'player') {
      return res.status(401).json({ error: '无效的玩家令牌' });
    }
    res.json({ 
      valid: true, 
      username: decoded.username 
    });
  } catch (e) {
    res.status(401).json({ error: '令牌已过期' });
  }
});

// 获取玩家信息
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'galaxy-pokemon-secret');
    
    // 重新读取数据库获取最新信息
    const buffer = fs.readFileSync(AUTHME_DB_PATH);
    const initSqlJs = require('sql.js');
    initSqlJs().then(SQL => {
      const db = new SQL.Database(buffer);
      const stmt = db.prepare('SELECT * FROM authme WHERE LOWER(username) = LOWER(?)');
      stmt.bind([decoded.username]);
      
      if (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        const player = {};
        columns.forEach((col, i) => player[col] = values[i]);
        stmt.free();
        
        res.json({
          username: player.realname || player.username,
          email: player.email,
          lastLogin: player.lastlogin,
          regDate: player.regdate,
          lastIp: player.ip
        });
      } else {
        stmt.free();
        res.status(404).json({ error: '玩家不存在' });
      }
      
      db.close();
    });
  } catch (e) {
    res.status(401).json({ error: '令牌无效' });
  }
});

module.exports = router;
