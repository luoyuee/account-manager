<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## 项目基本信息

- 框架：Next.js 16+ App Router
- 语言：TypeScript
- 样式：Tailwind CSS
- 组件库：Shadcn-ui 组件在 components/ui 目录
- 状态管理：Zustand
- 数据库：Prisma + PostgreSQL
- 路由体系：App Router 模式，使用 app/ 目录

## 必须遵守的代码规范

- 组件统一使用函数式组件 + hooks
- 文件名使用 kebab-case
- 组件名使用 PascalCase
- 工具函数使用 camelCase
- 禁止使用 any，必须定义完整类型
- 服务端代码与客户端代码严格分离

## 禁止事项

- 禁止在客户端组件中访问敏感环境变量
- 禁止硬编码密钥、Token、账号密码
- 禁止使用不安全的 eval、动态代码执行
- 禁止随意修改 instrumentation.ts 初始化逻辑
- 禁止自动引入未使用的依赖
- 禁止生成不符合 App Router 结构的代码
- 禁止自动安装依赖包，有需要时提示我手动安装

## 生成代码时必须遵循

- 生成组件前先判断是否需要 `'use client'`
- 生成接口时遵循 Next.js App Router 路由规范
- 涉及表单优先使用 React useFormState + Server Actions
- 代码必须简洁、类型安全、可维护
- 注释只写关键逻辑，不写废话
