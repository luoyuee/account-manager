/**
 * 用户上下文模块
 * 从请求头中提取已认证用户信息
 * 
 * 工作流程：
 * 1. proxy.ts 中间件验证 JWT 并设置 x-user-* 响应头
 * 2. 本模块从 headers 中读取用户信息
 * 3. 提供给服务端组件和 API 路由使用
 */
import { headers } from "next/headers";

/**
 * 用户上下文结构
 * 与 JWT 载荷保持一致，用于服务端获取当前用户
 */
export interface UserContext {
  id: number;
  username: string;
  email: string;
  role: number;
}

/**
 * 获取当前登录用户
 * 从请求头中提取由 proxy 中间件注入的用户信息
 * 
 * @returns 用户上下文，未登录返回 null
 * 
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(user.username);
 * }
 */
export async function getCurrentUser(): Promise<UserContext | null> {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const username = headersList.get("x-user-username");
  const email = headersList.get("x-user-email");
  const role = headersList.get("x-user-role");

  if (!userId || !username || !email || !role) {
    return null;
  }

  return {
    id: Number(userId),
    username,
    email,
    role: Number(role),
  };
}

/**
 * 获取当前用户，未登录抛出异常
 * 用于必须登录才能访问的接口
 * 
 * @returns 用户上下文
 * @throws 未登录时抛出 "Unauthorized" 错误
 * 
 * @example
 * const user = await requireUser();
 * // 此时 user 一定存在
 */
export async function requireUser(): Promise<UserContext> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
