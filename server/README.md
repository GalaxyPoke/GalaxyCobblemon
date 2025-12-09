# GalaxyPokemon 后端服务器

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，修改以下配置：

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**重要**：请务必修改 `JWT_SECRET` 为一个随机的长字符串！

### 3. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

### 4. 访问管理后台

打开浏览器访问：`http://localhost:3000`

然后打开 `admin/index.html` 进行管理

---

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/server-status` | 服务器状态 |
| GET | `/api/announcements` | 获取公告列表 |
| GET | `/api/announcements/:id` | 获取单个公告 |
| POST | `/api/feedback` | 提交反馈 |

### 需要认证的接口

需要在请求头添加：`Authorization: Bearer <token>`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录 |
| GET | `/api/auth/verify` | 验证 Token |
| POST | `/api/announcements` | 创建公告 |
| PUT | `/api/announcements/:id` | 更新公告 |
| DELETE | `/api/announcements/:id` | 删除公告 |
| GET | `/api/feedback` | 获取反馈列表 |
| PUT | `/api/feedback/:id` | 更新反馈状态 |
| DELETE | `/api/feedback/:id` | 删除反馈 |

---

## 数据库

使用 SQLite，数据库文件位于 `db/galaxypokemon.db`

### 表结构

- `admins` - 管理员账号
- `announcements` - 公告
- `feedback` - 用户反馈
- `leaderboard` - 排行榜（预留）

---

## 目录结构

```
server/
├── app.js              # 主入口
├── package.json        # 依赖配置
├── .env                # 环境变量
├── db/
│   ├── database.js     # 数据库初始化
│   └── galaxypokemon.db # SQLite 数据库文件
├── routes/
│   ├── auth.js         # 认证路由
│   ├── announcements.js # 公告路由
│   └── feedback.js     # 反馈路由
├── middleware/
│   └── auth.js         # JWT 认证中间件
└── uploads/            # 上传文件目录
```
