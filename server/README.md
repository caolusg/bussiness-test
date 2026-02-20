# NegotiateAI Server

Express + PostgreSQL 后端服务，提供认证、会话与聊天 API。

> 运行要求：Node.js 18+（使用内置 fetch 直接调用 Google Generative Language API，无需安装 @google/genai SDK）

---

## 1. 环境变量

复制 `server/.env.example` 到 `server/.env` 并填写：

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/negotiateai
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/negotiateai
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MODEL=gemini-2.0-flash
```

## 2. 安装与启动
```bash
cd server
npm install
npm run dev
```

## 3. 数据库迁移
确保 PostgreSQL 已创建数据库，然后执行：

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```

## 4. 最小验证步骤
1) 注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"password123"}'
```

2) 登录拿 token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"password123"}' | jq -r .token)
```

3) 创建 session
```bash
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"采购谈判","scenario":"你是供应商代表，目标是争取更高预付款。"}' | jq -r .sessionId)
```

4) 发送 chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$SESSION_ID\",\"userMessage\":\"我们希望降低首付款比例\"}"
```

5) 拉取 messages
```bash
curl http://localhost:3000/api/sessions/$SESSION_ID/messages \
  -H "Authorization: Bearer $TOKEN"
```

## API 清单
- `POST /api/auth/register` `{ email, password }`
- `POST /api/auth/login` `{ email, password } -> { token }`
- `GET /api/auth/me` `Authorization: Bearer <token> -> { id, email }`
- `POST /api/sessions` `{ title?, scenario } -> { sessionId }`
- `GET /api/sessions` `-> [{ id, title, scenario, createdAt }]`
- `GET /api/sessions/:id/messages` `-> [{ id, role, content, createdAt }]`
- `POST /api/chat` `{ sessionId, userMessage } -> { assistantMessage }`
- `GET /health` `-> { ok: true }`
