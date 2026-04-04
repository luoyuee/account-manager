import { badRequestResponse, errorResponse, okResponse } from "@/lib/response";
import { verifyResetPasswordToken } from "@/lib/jwt";
import { hashPassword } from "@/lib/crypto";
import { prisma } from "@/prisma";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1, "token 不能为空"),
  password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const { token, password } = data;

    const payload = await verifyResetPasswordToken(token);
    if (!payload) {
      return badRequestResponse("重置链接已失效或已过期");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, status: 1 },
    });

    if (!user) {
      return badRequestResponse("用户不存在");
    }

    if (user.email !== payload.email) {
      return badRequestResponse("验证信息不匹配");
    }

    const hashedPassword = hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return okResponse(undefined, "密码重置成功");
  } catch (err) {
    console.error("Reset password error:", err);
    return errorResponse("服务器错误");
  }
}
