import { hashPassword } from "@/lib/crypto";
import { createToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/prisma";
import { z } from "zod";
import {
  badRequestResponse,
  errorResponse,
  jsonResponse,
} from "@/lib/response";
import config from "@/config";

const schema = z.object({
  email: z.email("邮箱格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email, status: 1 },
    });

    if (!user) return badRequestResponse("用户不存在");

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return badRequestResponse("密码错误");
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(config.JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: config.JWT_COOKIE_MAX_AGE,
      path: "/",
    });

    return jsonResponse({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("服务器错误");
  }
}
