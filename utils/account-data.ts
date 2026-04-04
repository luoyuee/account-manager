/**
 * 账号数据导入导出工具模块
 * 提供账号数据的 JSON 导入导出功能，支持明文和加密两种格式
 */
import { encrypt, decrypt } from "./crypto";
import { AccountItem } from "@/types";

/* ==================== 类型定义 ==================== */

/**
 * 明文导出数据格式
 */
export type ExportPlainData = {
  /** 导出时间（ISO 格式） */
  exportedAt: string;
  /** 账号列表 */
  accounts: AccountItem[];
};

/**
 * 加密导出数据格式
 */
export type ExportEncryptedData = {
  /** 导出时间（ISO 格式） */
  exportedAt: string;
  /** 标识为加密数据 */
  encrypted: true;
  /** 加密后的数据字符串 */
  data: string;
};

/** 导出数据类型（明文或加密） */
export type ExportData = ExportPlainData | ExportEncryptedData;

/**
 * 导入文件解析结果
 */
export type ImportResult = {
  /** 解析出的账号列表（加密文件时为空数组） */
  accounts: AccountItem[];
  /** 是否为加密文件 */
  isEncrypted: boolean;
};

/* ==================== 工具函数 ==================== */

/**
 * 触发浏览器下载 JSON 文件
 * @param data - 要下载的数据对象
 * @param filename - 文件名
 */
function downloadJson(data: object, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 判断两个账号是否完全相同
 * 比较标题、账号、密码、备注和标签（忽略顺序）
 * @param a - 第一个账号
 * @param b - 第二个账号
 * @returns 是否完全相同
 */
function isAccountDuplicate(a: AccountItem, b: AccountItem): boolean {
  return (
    a.title === b.title &&
    a.username === b.username &&
    a.password === b.password &&
    (a.remark ?? "") === (b.remark ?? "") &&
    JSON.stringify([...a.tags].sort()) === JSON.stringify([...b.tags].sort())
  );
}

/* ==================== 导入功能 ==================== */

/**
 * 解析导入的 JSON 文件内容
 * 自动识别明文或加密格式
 * @param content - JSON 文件内容字符串
 * @returns 解析结果，包含账号列表和是否加密标识
 * @throws 如果文件格式无效
 */
export function parseImportFile(content: string): ImportResult {
  const data = JSON.parse(content);

  if (data.encrypted === true && typeof data.data === "string") {
    return {
      accounts: [],
      isEncrypted: true,
    };
  }

  if (Array.isArray(data.accounts)) {
    return {
      accounts: data.accounts as AccountItem[],
      isEncrypted: false,
    };
  }

  throw new Error("无效的导入文件格式");
}

/**
 * 解密导入的加密数据
 * @param encryptedData - 加密的数据字符串
 * @param password - 解密密码
 * @returns 解密后的账号列表
 * @throws 如果解密失败或数据格式无效
 */
export function decryptImportData(
  encryptedData: string,
  password: string,
): AccountItem[] {
  const decrypted = decrypt(encryptedData, password);
  const data = JSON.parse(decrypted);
  if (!Array.isArray(data.accounts)) {
    throw new Error("解密后的数据格式无效");
  }
  return data.accounts as AccountItem[];
}

/**
 * 准备导入的账号数据
 * - 覆盖模式：直接导入所有账号，不检查重复
 * - 普通模式：检查重复，跳过已存在的账号
 * - 所有导入的账号会生成新 ID 并添加导入时间标签
 * @param accounts - 待导入的账号列表
 * @param existingAccounts - 现有账号列表
 * @param overwrite - 是否覆盖模式
 * @returns 导入结果，包含成功导入和跳过的账号
 */
export function prepareImportAccounts(
  accounts: AccountItem[],
  existingAccounts: AccountItem[],
  overwrite: boolean,
): { imported: AccountItem[]; skipped: AccountItem[] } {
  const importTime = new Date().toISOString();
  const importTag = `导入:${importTime.split("T")[0]}`;
  const baseId = Date.now();

  const imported: AccountItem[] = [];
  const skipped: AccountItem[] = [];

  accounts.forEach((account, index) => {
    if (overwrite) {
      imported.push({
        ...account,
        id: `${baseId}-${index}`,
        tags: [...account.tags, importTag],
      });
    } else {
      const isDuplicate = existingAccounts.some((existing) =>
        isAccountDuplicate(account, existing),
      );

      if (isDuplicate) {
        skipped.push(account);
      } else {
        imported.push({
          ...account,
          id: `${baseId}-${index}`,
          tags: [...account.tags, importTag],
        });
      }
    }
  });

  return { imported, skipped };
}

/* ==================== 导出功能 ==================== */

/**
 * 导出明文 JSON 文件
 * 文件包含导出时间和账号列表，可直接查看
 * @param accounts - 要导出的账号列表
 */
export function exportPlainJson(accounts: AccountItem[]) {
  const exportData: ExportPlainData = {
    exportedAt: new Date().toISOString(),
    accounts,
  };
  downloadJson(exportData, `accounts-plain-${Date.now()}.json`);
}

/**
 * 导出加密 JSON 文件
 * 使用 AES 加密账号数据，需要密码才能解密
 * @param accounts - 要导出的账号列表
 * @param password - 加密密码
 * @returns 是否导出成功
 */
export function exportEncryptedJson(accounts: AccountItem[], password: string) {
  const encrypted = encrypt(JSON.stringify({ accounts }), password);
  if (!encrypted) {
    return false;
  }
  const exportData: ExportEncryptedData = {
    exportedAt: new Date().toISOString(),
    encrypted: true,
    data: encrypted,
  };
  downloadJson(exportData, `accounts-encrypted-${Date.now()}.json`);
  return true;
}
