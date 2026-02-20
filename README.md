# NegotiateAI - 商务谈判训练平台

该仓库包含：
- 前端：Vite + React + TypeScript（根目录）
- 后端：Express + PostgreSQL + JWT + Gemini（`server/`）

## 前端启动（根目录）
### 1) 安装依赖
```bash
npm install
```

### 2) 配置环境变量
在根目录 `.env` 中配置：
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3) 启动
```bash
npm run dev

### 2) 配置环境变量
在根目录 `.env` 中配置：
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3) 启动
```bash
npm run dev
```
默认地址：`http://localhost:5173`

## 后端启动（server/）
### 1) 安装依赖
```bash
cd server
npm install
```
默认地址：`http://localhost:5173`

## 后端启动（server/）
> 需要 Node.js 18+（后端使用原生 `fetch` 调用 Gemini HTTP API，无需安装 `@google/genai`）。

### 1) 安装依赖
```bash
cd server
npm install
```

### 2) 配置环境变量
复制 `server/.env.example` 为 `server/.env` 并填写：
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/negotiateai
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MODEL=gemini-2.0-flash
```

### 3) 执行数据库迁移
```bash
cd server
psql "$DATABASE_URL" -f migrations/001_init.sql
```

### 4) 启动后端
```bash
cd server
npm run dev
```
默认地址：`http://localhost:3000`

## 最小联调验证
1. 注册
2. 登录拿 token
3. 创建 session
4. 调用 chat
5. 拉取 messages

可直接参考 `server/README.md` 中的 `curl` 示例。

## API 对齐清单
- `POST /api/auth/register` body `{ email, password }`
- `POST /api/auth/login` body `{ email, password }` -> `{ token }`
- `GET /api/auth/me` header `Authorization: Bearer <token>` -> `{ id, email }`
- `POST /api/sessions` body `{ title?, scenario }` -> `{ sessionId }`
- `GET /api/sessions` -> `[{ id, title, scenario, createdAt }]`
- `GET /api/sessions/:id/messages` -> `[{ id, role, content, createdAt }]`
- `POST /api/chat` body `{ sessionId, userMessage }` -> `{ assistantMessage }`

## 健康检查
- `GET /health` -> `{ ok: true }`
