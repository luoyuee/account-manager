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

// TODO:停用和删除应该分开，后续处理

const schema = z.object({
  status: z.union([z.literal(0), z.literal(1)]),
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
      return badRequestResponse("不能禁用自己");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("请求体无效");
    }
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!target) {
      return notFoundResponse("用户不存在");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: data.status },
    });

    return okResponse(
      undefined,
      data.status === 0 ? "用户已禁用" : "用户已启用",
    );
  } catch (err) {
    console.error("Update user status error:", err);
    return errorResponse("更新状态失败");
  }
}
