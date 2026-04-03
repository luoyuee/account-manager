/**
 * 加密工具模块
 * 提供 AES 加密/解密和 SHA-256 哈希功能
 * 使用 PBKDF2 密钥派生算法增强安全性
 */
import CryptoJS from "crypto-js";

const KEY_SIZE = 256;
const ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 16;

/**
 * 生成密码学安全的随机字节序列
 * @param length - 需要生成的字节数
 * @returns Uint8Array 格式的随机字节数组
 */
function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

/**
 * 将 Uint8Array 转换为 CryptoJS 的 WordArray 格式
 * CryptoJS 内部使用 32 位字（word）数组存储数据
 * @param bytes - Uint8Array 格式的字节数组
 * @returns CryptoJS.lib.WordArray 对象
 */
function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    const word =
      (bytes[i] << 24) |
      (bytes[i + 1] << 16) |
      (bytes[i + 2] << 8) |
      bytes[i + 3];
    words.push(word);
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

/**
 * 使用 AES-CBC 模式加密明文
 * 加密流程：
 * 1. 生成随机盐值（用于密钥派生）
 * 2. 使用 PBKDF2 从密码派生加密密钥
 * 3. 生成随机初始化向量（IV）
 * 4. 使用 AES-CBC 加密数据
 * 5. 将盐值、IV 和密文拼接返回
 *
 * 输出格式：Base64(salt) + Base64(iv) + Base64(ciphertext)
 * - salt: 16 字节，Base64 编码后 24 字符
 * - iv: 16 字节，Base64 编码后 24 字符
 * - ciphertext: 可变长度
 *
 * @param plaintext - 待加密的明文字符串
 * @param password - 加密密码
 * @returns 拼接后的加密字符串
 */
export function encrypt(plaintext: string, password: string): string {
  const saltBytes = generateRandomBytes(SALT_SIZE);
  const salt = bytesToWordArray(saltBytes);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });

  const ivBytes = generateRandomBytes(IV_SIZE);
  const iv = bytesToWordArray(ivBytes);

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const saltBase64 = salt.toString(CryptoJS.enc.Base64);
  const ivBase64 = iv.toString(CryptoJS.enc.Base64);

  return saltBase64 + ivBase64 + encrypted.toString();
}

/**
 * 解密 AES-CBC 加密的数据
 * 解密流程：
 * 1. 从加密字符串中提取盐值、IV 和密文
 * 2. 使用相同的盐值和密码通过 PBKDF2 派生密钥
 * 3. 使用 AES-CBC 解密数据
 *
 * @param encryptedStr - 加密字符串（格式：Base64(salt) + Base64(iv) + ciphertext）
 * @param password - 解密密码
 * @returns 解密后的明文字符串
 * @throws 如果数据格式无效、密码错误或数据损坏
 */
export function decrypt(encryptedStr: string, password: string): string {
  if (encryptedStr.length < 56) {
    throw new Error("无效的加密数据格式");
  }

  const saltBase64 = encryptedStr.substring(0, 24);
  const ivBase64 = encryptedStr.substring(24, 48);
  const ciphertext = encryptedStr.substring(48);

  try {
    const salt = CryptoJS.enc.Base64.parse(saltBase64);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: KEY_SIZE / 32,
      iterations: ITERATIONS,
    });

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error("解密失败");
    }
    return result;
  } catch {
    throw new Error("解密失败：密码错误或数据损坏");
  }
}

/**
 * 使用 SHA-256 算法计算数据的哈希值
 * 使用 Web Crypto API 实现，适用于密码存储、数据校验等场景
 *
 * @param data - 待哈希的字符串数据
 * @returns 64 字符的十六进制哈希字符串
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
