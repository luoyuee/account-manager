import { getAdmin } from "@/lib/context";
import { prisma } from "@/prisma";
import {
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  okResponse,
  unauthorizedResponse,
} from "@/lib/response";
import z from "zod";

export async function DELETE(
  _request: Request,
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

    const schema = z.object({
      id: z.coerce.number().min(1, "用户 ID 不能为空"),
    });

    const { error, data } = schema.safeParse(id);

    if (error) {
      return badRequestResponse(error.message);
    }

    if (data.id === currentUser.id) {
      return badRequestResponse("不能删除自己");
    }

    const target = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, status: true },
    });

    if (!target) {
      return notFoundResponse("用户不存在");
    }

    await prisma.user.update({
      where: { id: data.id },
      data: { status: 0 },
    });

    return okResponse(undefined, "用户已删除");
  } catch (err) {
    console.error("Delete user error:", err);
    return errorResponse("删除用户失败");
  }
}
