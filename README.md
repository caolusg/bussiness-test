# NegotiateAI - 商务谈判训练平台 (纯前端)

这是一个基于 AI 的商务谈判实战训练平台前端项目。

## 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion (motion/react)
- **路由**: React Router 7
- **图标**: Lucide React

## 快速开始

### 1. 安装依赖
```bash
rm -rf node_modules && npm install
```

### 2. 配置环境变量
在项目根目录创建 `.env` 文件（或修改 `.env.example`）:
```env
VITE_API_BASE_URL=http://localhost:3000
```
*注意：后端未启动时，API 调用失败属于正常现象。*

### 3. 启动开发服务器
```bash
npm run dev
```

## 功能模块
- **身份认证**: 登录、注册（带表单校验，Token 自动管理）。
- **会话管理**: 浏览历史会话、新建谈判会话。
- **场景选择**: 提供预设的谈判场景模板。
- **实战对话**: 沉浸式聊天 UI，支持实时消息发送。

## API 规范
项目已封装 `apiClient`，会自动处理：
1. `Authorization: Bearer <token>` 请求头注入。
2. 401 Unauthorized 自动跳转登录页。
3. 使用 `VITE_API_BASE_URL` 作为基地址。

## 关键路由
- `/register`: 注册
- `/login`: 登录
- `/app`: 会话列表
- `/app/session/:id`: 谈判对话页
