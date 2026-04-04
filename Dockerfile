#################################################################
# 基于 Node.js LTS 的 Next.js 生产环境 Dockerfile
#################################################################

FROM node:22-bookworm

WORKDIR /app

# 设置构建时环境变量（占位值，运行时覆盖）
ENV AC_JWT_SECRET="build-placeholder-secret"
ENV AC_JWT_SECRET_RESET="build-placeholder-reset-secret"
ENV AC_DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?schema=public"
ENV AC_SMTP_HOST="smtp.example.com"
ENV AC_SMTP_USER="your-email"
ENV AC_SMTP_PASS="your-password"
ENV AC_SMTP_FROM="noreply@example.com"

#################################################################
# 依赖安装
#################################################################

# 复制依赖描述文件
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装依赖
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

#################################################################
# 构建应用
#################################################################

COPY . .

# 生成 Prisma Client 并构建
RUN npm run prisma:generate
RUN npm run build

#################################################################
# 运行配置
#################################################################

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]

#################################################################
# 使用说明
#
# 1. 构建镜像：
#    docker build -t account-manager:latest .
#
# 2. 运行容器：
#    docker run -d \
#      -p 3000:3000 \
#      -e AC_JWT_SECRET="your-jwt-secret" \
#      -e AC_JWT_SECRET_RESET="your-reset-secret" \
#      -e AC_DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public" \
#      -e AC_SMTP_HOST="smtp.example.com" \
#      -e AC_SMTP_USER="your-email" \
#      -e AC_SMTP_PASS="your-password" \
#      -e AC_SMTP_FROM="noreply@example.com" \
#      --name account-manager \
#      account-manager:latest
#
# 3. 首次运行需执行数据库迁移：
#    docker exec -it account-manager npm run prisma:deploy
#################################################################
