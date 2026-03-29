import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import appConfig from "@/config";

const ignoreRoute = [
  "^/login",
  "^/api/login",
  "^/admin/(login|register)",
  "^/api/admin/(login|register)",
];
const ignoreRouteRegexp = new RegExp(`(${ignoreRoute.join(")|(")})`);

const getSecret = () => jose.base64url.decode(appConfig.JWT_SECRET);

const verifyAndDecodeToken = async (
  token: string,
): Promise<{
  id: number;
  username: string;
  email: string;
  exp?: number;
} | null> => {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtDecrypt(token, secret);
    return payload as {
      id: number;
      username: string;
      email: string;
      exp?: number;
    };
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  const authorization = request.cookies.get("Authorization")?.value;

  let user: {
    id: number;
    username: string;
    email: string;
    exp?: number;
  } | null = null;

  if (authorization) {
    const payload = await verifyAndDecodeToken(authorization);
    if (payload) {
      user = payload;
    }
  }

  const response = NextResponse.next();

  if (user) {
    response.headers.set("x-user-id", String(user.id));
    response.headers.set("x-user-username", user.username);
    response.headers.set("x-user-email", user.email);
  }

  if (!ignoreRouteRegexp.test(pathname)) {
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized", message: "no authorization" },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
