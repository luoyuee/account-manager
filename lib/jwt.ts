/**
 * JWT 工具模块
 * 使用 jose 库实现 JWE（加密 JWT）的创建和验证
 * 
 * 安全特性：
 * - 使用 JWE 加密而非普通签名，客户端无法读取内容
 * - PBKDF2 密钥派生，防止暴力破解
 * - 支持普通 Token 和刷新 Token 两种有效期
 */
import * as jose from "jose";
import config from "@/config";

/**
 * 获取 JWT 加密密钥
 * 从配置中读取 Base64 编码的密钥并解码
 */
const getSecret = () => jose.base64url.decode(config.JWT_SECRET);

/**
 * 获取密码重置 Token 的专用密钥
 * 使用独立密钥，与普通 Token 隔离，提高安全性
 */
const getResetSecret = () => jose.base64url.decode(config.JWT_SECRET_RESET);

/**
 * JWT 载荷结构
 * 包含用户基本信息和权限标识
 */
export interface JwtPayload extends jose.JWTPayload {
  id: number;
  username: string;
  email: string;
  role: number;
}

/**
 * 创建访问令牌
 * 有效期较短（默认 3 小时），用于日常请求认证
 * 
 * @param payload - 用户信息载荷
 * @returns 加密后的 JWT 字符串
 */
export const createToken = async (payload: JwtPayload): Promise<string> => {
  const secret = getSecret();
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime(config.JWT_EXP)
    .encrypt(secret);
  return jwt;
};

/**
 * 创建刷新令牌
 * 有效期较长（默认 7 天），用于获取新的访问令牌
 * 
 * @param payload - 用户信息载荷
 * @returns 加密后的 JWT 字符串
 */
export const createRefreshToken = async (
  payload: JwtPayload,
): Promise<string> => {
  const secret = getSecret();
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime(config.JWT_EXP_7D)
    .encrypt(secret);
  return jwt;
};

/**
 * 验证并解码访问令牌
 * 
 * @param token - JWT 字符串
 * @returns 解密后的载荷，验证失败返回 null
 */
export const verifyToken = async (
  token: string,
): Promise<JwtPayload | null> => {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtDecrypt<JwtPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
};

/**
 * 获取 Token 过期时间
 * 不验证签名，仅解码获取 exp 字段
 * 
 * @param token - JWT 字符串
 * @returns 过期时间戳（秒），解码失败返回 null
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jose.decodeJwt(token);
    return decoded.exp ?? null;
  } catch {
    return null;
  }
};

/**
 * 密码重置令牌载荷结构
 * 仅包含必要信息，最小化数据暴露
 */
export interface ResetPasswordPayload extends jose.JWTPayload {
  userId: number;
  email: string;
}

/**
 * 创建密码重置令牌
 * 有效期 10 分钟，使用独立密钥签名
 * 
 * @param payload - 重置所需的最小信息
 * @returns 加密后的 JWT 字符串
 */
export const createResetPasswordToken = async (
  payload: ResetPasswordPayload,
): Promise<string> => {
  const secret = getResetSecret();
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime("10 m")
    .encrypt(secret);
  return jwt;
};

/**
 * 验证密码重置令牌
 * 
 * @param token - 密码重置 JWT 字符串
 * @returns 解密后的载荷，验证失败返回 null
 */
export const verifyResetPasswordToken = async (
  token: string,
): Promise<ResetPasswordPayload | null> => {
  try {
    const secret = getResetSecret();
    const { payload } = await jose.jwtDecrypt<ResetPasswordPayload>(
      token,
      secret,
    );
    return payload;
  } catch {
    return null;
  }
};
