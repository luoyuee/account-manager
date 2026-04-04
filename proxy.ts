/**
 * 认证代理中间件
 * 在请求到达页面前验证 JWT 并注入用户信息
 * 
 * 职责：
 * 1. 验证 Cookie 中的 JWT Token
 * 2. 将用户信息注入响应头（x-user-*）
 * 3. 未登录用户重定向到登录页或返回 401
 * 
 * 数据流：
 * Request → Cookie 解析 → JWT 验证 → Header 注入 → Response
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import appConfig from "@/config";
import * as jose from "jose";

/**
 * 无需认证的路由前缀
 * 使用正则匹配，登录、注册等公开页面无需验证
 */
const ignoreRoute = ["^/auth/", "^/api/auth/"];
const ignoreRouteRegexp = new RegExp(`(${ignoreRoute.join(")|(")})`);

/**
 * 获取 JWT 加密密钥
 */
const getSecret = () => jose.base64url.decode(appConfig.JWT_SECRET);

/**
 * Token 载荷结构
 * 与 lib/jwt.ts 中的 JwtPayload 保持一致
 */
interface TokenPayload {
  id: number;
  username: string;
  email: string;
  role: number;
  exp?: number;
}

/**
 * 验证并解码 JWT Token
 * 
 * @param token - Cookie 中的 JWT 字符串
 * @returns 解密后的用户信息，验证失败返回 null
 */
const verifyAndDecodeToken = async (
  token: string,
): Promise<TokenPayload | null> => {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtDecrypt<TokenPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
};

/**
 * 中间件主函数
 * 处理每个匹配的请求
 * 
 * @param request - Next.js 请求对象
 * @returns 响应对象或重定向
 */
export async function proxy(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  const authorization = request.cookies.get(appConfig.JWT_COOKIE_NAME)?.value;

  let user: TokenPayload | null = null;

  if (authorization) {
    const payload = await verifyAndDecodeToken(authorization);
    if (payload) {
      user = payload;
    }
  }

  const response = NextResponse.next();

  /**
   * 将用户信息注入响应头
   * 下游组件通过 headers() API 读取
   */
  if (user) {
    response.headers.set("x-user-id", String(user.id));
    response.headers.set("x-user-username", user.username);
    response.headers.set("x-user-email", user.email);
    response.headers.set("x-user-role", String(user.role));
  }

  /**
   * 路由保护逻辑
   * - 忽略公开路由（登录、注册等）
   * - API 路由返回 401 JSON
   * - 页面路由重定向到登录页
   */
  if (!ignoreRouteRegexp.test(pathname)) {
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized", message: "no authorization" },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

/**
 * 中间件匹配规则
 * 排除静态资源，仅处理动态路由
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
