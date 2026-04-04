import { hashPassword } from "@/lib/crypto";
import { getAdmin } from "@/lib/context";
import { prisma } from "@/prisma";
import { z } from "zod";
import {
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  okResponse,
  unauthorizedResponse,
} from "@/lib/response";

const schema = z.object({
  password: z.string().min(6, "密码至少 6 位"),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { admin: currentUser, error } = await getAdmin();
  if (error) {
    return error === "Unauthorized"
      ? unauthorizedResponse("请先登录")
      : forbiddenResponse("无权限操作");
  }

  try {
    const { id } = await params;

    const { error: userIdError, data: userId } = z.coerce
      .number()
      .positive()
      .safeParse(id);

    if (userIdError) {
      return badRequestResponse("用户 ID 无效");
    }

    if (userId === currentUser.id) {
      return badRequestResponse("不能修改自己的密码，请使用个人设置");
    }

    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const target = await prisma.user.findUnique({
      where: { id: userId, status: 1 },
      select: { id: true, status: true },
    });

    if (target) {
      return notFoundResponse("用户不存在或已被停用");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword(data.password) },
    });

    return okResponse(undefined, "密码修改成功");
  } catch (err) {
    console.error("Update user password error:", err);
    return errorResponse("修改密码失败");
  }
}
