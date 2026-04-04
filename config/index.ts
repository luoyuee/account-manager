import process from "node:process";

/**
 * 获取当前工作目录
 * 保证路径相关常量基于实际运行位置计算
 */
const getCurrentWorkingDirectory = (): string => {
  return process.cwd();
};

const WORK_DIR = getCurrentWorkingDirectory();

/**
 * 校验环境变量是否存在且非空
 * 若不存在则抛出错误，终止进程启动
 */
const assertEnv = (key: string, value: unknown): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `环境变量 ${key} 未配置，请在环境文件或部署环境中设置该变量`,
    );
  }
  return value;
};

// 强制校验关键配置项，任何缺失将直接抛出错误终止运行
const JWT_SECRET = assertEnv("AC_JWT_SECRET", process.env.AC_JWT_SECRET);
const JWT_SECRET_RESET = assertEnv(
  "AC_JWT_SECRET_RESET",
  process.env.AC_JWT_SECRET_RESET,
);
const DATABASE_URL = assertEnv("AC_DATABASE_URL", process.env.AC_DATABASE_URL);

// 邮件配置（可选，忘记密码功能需要）
const SMTP_HOST = process.env.AC_SMTP_HOST ?? "";
const SMTP_PORT = process.env.AC_SMTP_PORT ?? "587";
const SMTP_USER = process.env.AC_SMTP_USER ?? "";
const SMTP_PASS = process.env.AC_SMTP_PASS ?? "";
const SMTP_FROM = process.env.AC_SMTP_FROM ?? "";
const SMTP_SECURE = process.env.AC_SMTP_SECURE === "true";

const config = {
  // JWT 相关配置
  JWT_SECRET,
  JWT_SECRET_RESET,
  JWT_ALG: "dir",
  JWT_ENC: "A128CBC-HS256",
  JWT_EXP: "3 h",
  JWT_EXP_7D: "7 d",
  JWT_COOKIE_NAME: "Authorization",
  JWT_COOKIE_MAX_AGE: Number(process.env.AC_JWT_COOKIE_MAX_AGE) || 60 * 60 * 3,

  // 数据库连接字符串
  DATABASE_URL,

  // 邮件配置
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_SECURE,

  // 目录相关配置
  WORK_DIR,
};

export default config;
