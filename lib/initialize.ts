import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import config from "../config/index";

const logger = {
  info: (message: string) => console.log(`[Init] ${message}`),
  error: (message: string) => console.error(`[Init Error] ${message}`),
  success: (message: string) => console.log(`[Init ✓] ${message}`),
};

const checkEnvironmentVariables = (): void => {
  logger.info("检查环境变量...");

  const requiredVars = [
    { key: "AC_JWT_SECRET", value: config.JWT_SECRET },
    { key: "AC_DATABASE_URL", value: config.DATABASE_URL },
  ];

  for (const { key, value } of requiredVars) {
    if (!value || value.trim() === "") {
      throw new Error(`环境变量 ${key} 未配置`);
    }
    logger.success(`环境变量 ${key} 已配置`);
  }
};

const ensureDirectories = (): void => {
  logger.info("检查必要目录...");

  const directories = ["logs"];

  for (const dir of directories) {
    const dirPath = path.join(config.WORK_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.success(`创建目录: ${dir}`);
    } else {
      logger.success(`目录已存在: ${dir}`);
    }
  }
};

export const initialize = async (): Promise<void> => {
  logger.info("开始初始化应用...");

  try {
    checkEnvironmentVariables();
    ensureDirectories();

    logger.success("应用初始化完成");
  } catch (error) {
    logger.error(
      `应用初始化失败: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
};
