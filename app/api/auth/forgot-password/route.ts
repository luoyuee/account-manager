import { badRequestResponse, errorResponse, okResponse } from "@/lib/response";
import { createResetPasswordToken } from "@/lib/jwt";
import { sendResetPasswordMail } from "@/lib/mail";
import { prisma } from "@/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.email("邮箱格式不正确"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email, status: 1 },
    });

    if (user) {
      const token = await createResetPasswordToken({
        userId: user.id,
        email: user.email,
      });

      const host = request.headers.get("host") || "localhost:3030";
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const resetUrl = `${protocol}://${host}/auth/reset-password?token=${token}`;

      await sendResetPasswordMail(email, resetUrl);
    }

    return okResponse(undefined, "如果该邮箱已注册，重置密码邮件已发送");
  } catch (err) {
    console.error("Forgot password error:", err);
    return errorResponse("服务器错误");
  }
}
