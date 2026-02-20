# NegotiateAI - 商务谈判训练平台

前后端同仓库：根目录为前端，`server/` 为后端。

## 前端启动（根目录）
1) 安装依赖
```bash
npm install
```

2) 配置前端环境变量（根目录 `.env`）
```env
VITE_API_BASE_URL=http://localhost:3000
```

3) 启动前端
```bash
npm run dev
```
访问：`http://localhost:5173`

## 后端启动（server/）
> 需要 Node.js 18+（使用内置 `fetch` 调用 Gemini HTTP API，后端无需安装 `@google/genai`）。

1) 安装依赖
```bash
cd server
npm install
```

2) 配置后端环境变量（`server/.env`）
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/negotiateai
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

3) 执行迁移
```bash
cd server
psql "$DATABASE_URL" -f migrations/001_init.sql
```

4) 启动后端
```bash
cd server
npm run dev
```
访问：`http://localhost:3000`
