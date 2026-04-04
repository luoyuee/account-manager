/**
 * 用户上下文模块
 * 从请求头中提取已认证用户信息
 * 
 * 工作流程：
 * 1. proxy.ts 中间件验证 JWT 并设置 x-user-* 响应头
 * 2. 本模块从 headers 中读取用户信息
 * 3. 提供给服务端组件和 API 路由使用
 */
import { UserRoleEnum } from "@/enums";
import { headers } from "next/headers";
import { prisma } from "@/prisma";

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
 * 获取当前登录用户结果类型
 */
export type UserResult =
  | { user: UserContext; error: null }
  | { user: null; error: "Unauthorized" };

/**
 * 获取当前登录用户
 * 从请求头中提取由 proxy 中间件注入的用户信息
 * 
 * @returns 成功返回 { user }，失败返回 { error }
 * 
 * @example
 * const { user, error } = await getCurrentUser();
 * if (error) {
 *   return unauthorizedResponse("请先登录");
 * }
 * // 使用 user...
 */
export async function getCurrentUser(): Promise<UserResult> {
  const header = await headers();
  const userId = header.get("x-user-id");

  if (!userId) {
    return { user: null, error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: Number(userId), status: 1 },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  if (!dbUser) {
    return { user: null, error: "Unauthorized" };
  }

  return {
    user: dbUser,
    error: null,
  };
}

/**
 * 验证当前用户是否为管理员
 * 同时验证用户状态是否正常（status === 1）
 * 
 * @returns 成功返回 { admin }，失败返回 { error }
 * 
 * @example
 * const { admin, error } = await getAdmin();
 * if (error) {
 *   return error === "Unauthorized" 
 *     ? unauthorizedResponse("请先登录") 
 *     : forbiddenResponse("无权限操作");
 * }
 */
export type AdminResult =
  | { admin: UserContext; error: null }
  | { admin: null; error: "Unauthorized" | "Forbidden" };

export async function getAdmin(): Promise<AdminResult> {
  const { user, error } = await getCurrentUser();
  if (error) {
    return { admin: null, error };
  }

  if (user.role !== UserRoleEnum.ADMIN) {
    return { admin: null, error: "Forbidden" };
  }

  return { admin: user, error: null };
}
