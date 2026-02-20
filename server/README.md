# NegotiateAI Server

Express + PostgreSQL 后端服务，提供认证、会话与聊天 API。

> 运行要求：Node.js 18+（使用内置 `fetch` 调用 Google Generative Language API）。

## 环境变量
复制 `server/.env.example` 为 `server/.env`：

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/negotiateai
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

## 启动
```bash
cd server
npm install
psql "$DATABASE_URL" -f migrations/001_init.sql
npm run dev
```

## 最小验证说明
登录拿 token 示例使用 `jq`，需安装 `jq`（或手动复制 token）。
