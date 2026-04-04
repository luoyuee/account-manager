# Account Manager

一个基于 Next.js 构建的账号密码管理系统，支持加密存储、用户管理、密码重置等功能。

## 功能特性

- 🔐 **加密存储** - 使用 AES 加密算法保护账号密码
- 👥 **用户管理** - 支持多用户、角色权限控制
- 🔑 **密码重置** - 邮件验证码重置密码
- 🏷️ **标签分类** - 为账号添加标签便于管理
- 🔍 **快速搜索** - 支持标题、账号、标签搜索
- 🌙 **深色模式** - 支持明暗主题切换
- 📱 **响应式设计** - 适配桌面和移动端

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 组件库 | Shadcn UI |
| 状态管理 | Zustand |
| 表单验证 | @tanstack/react-form + Zod |
| 数据库 | PostgreSQL + Prisma |
| 认证 | JWT (JWE 加密) |

## 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm / npm / yarn

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/account-manager.git
cd account-manager
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下必要变量：

```env
# 数据库连接
AC_DATABASE_URL="postgresql://user:password@localhost:5432/account_manager?schema=public"

# JWT 密钥（至少 32 位随机字符串）
AC_JWT_SECRET="your-jwt-secret-at-least-32-chars"
AC_JWT_SECRET_RESET="your-reset-secret-at-least-32-chars"

# 邮件配置（可选，用于密码重置）
AC_SMTP_HOST="smtp.example.com"
AC_SMTP_PORT="587"
AC_SMTP_USER="your-email@example.com"
AC_SMTP_PASS="your-smtp-password"
AC_SMTP_FROM="noreply@example.com"
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate-dev
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3030，首次访问会跳转到管理员注册页面。

## Docker 部署

### 构建镜像

```bash
docker build -t account-manager:latest .
```

### 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e AC_JWT_SECRET="your-jwt-secret" \
  -e AC_JWT_SECRET_RESET="your-reset-secret" \
  -e AC_DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public" \
  -e AC_SMTP_HOST="smtp.example.com" \
  -e AC_SMTP_USER="your-email" \
  -e AC_SMTP_PASS="your-password" \
  -e AC_SMTP_FROM="noreply@example.com" \
  --name account-manager \
  account-manager:latest
```

### 数据库迁移

首次运行后执行数据库迁移：

```bash
docker exec -it account-manager npm run prisma:deploy
```

## 项目结构

```
account-manager/
├── app/                    # Next.js App Router
│   ├── account/           # 账号管理页面
│   ├── admin/             # 管理后台
│   ├── api/               # API 路由
│   └── auth/              # 认证页面
├── components/            # 公共组件
│   └── ui/               # Shadcn UI 组件
├── prisma/               # 数据库模型
├── lib/                  # 核心库
├── utils/                # 工具函数
├── stores/               # Zustand 状态
├── apis/                 # API 请求封装
├── constants/            # 常量定义
├── types/                # 类型定义
└── config/               # 配置文件
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm prisma:migrate-dev` | 开发环境数据库迁移 |
| `pnpm prisma:deploy` | 生产环境数据库迁移 |

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `AC_DATABASE_URL` | ✅ | PostgreSQL 连接字符串 |
| `AC_JWT_SECRET` | ✅ | JWT 加密密钥 |
| `AC_JWT_SECRET_RESET` | ✅ | 密码重置 JWT 密钥 |
| `AC_SMTP_HOST` | ❌ | SMTP 服务器地址 |
| `AC_SMTP_PORT` | ❌ | SMTP 端口（默认 587） |
| `AC_SMTP_USER` | ❌ | SMTP 用户名 |
| `AC_SMTP_PASS` | ❌ | SMTP 密码 |
| `AC_SMTP_FROM` | ❌ | 发件人地址 |
| `AC_SMTP_SECURE` | ❌ | 是否使用 SSL（默认 false） |

## License

MIT
