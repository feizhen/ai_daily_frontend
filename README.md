# AI Daily Client

一个基于 React + TypeScript + Vite 的前端应用项目。

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 功能特性

- 🔐 用户认证（登录/注册）
- 🛡️ 路由保护
- 🔄 Token 自动刷新
- 📱 响应式设计

## 开始使用

### 前置要求

- Node.js >= 18.0.0
- pnpm (推荐) 或 npm/yarn

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 开发环境

```bash
pnpm dev
# 或
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

构建产物将生成在 `dist` 目录

### 预览生产构建

```bash
pnpm preview
# 或
npm run preview
```

## 环境变量

创建 `.env` 文件来配置环境变量：

```env
VITE_API_URL=http://localhost:3000
```

## 项目结构

```
ai-daily-client/
├── public/          # 静态资源
├── src/
│   ├── api/        # API 请求封装
│   ├── components/  # 公共组件
│   ├── contexts/   # React Context
│   ├── pages/      # 页面组件
│   ├── types/      # TypeScript 类型定义
│   ├── utils/      # 工具函数
│   ├── App.tsx     # 根组件
│   └── main.tsx    # 应用入口
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

MIT

