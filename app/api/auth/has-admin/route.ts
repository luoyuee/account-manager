import { okResponse, errorResponse } from "@/lib/response";
import { UserRoleEnum } from "@/enums";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count({
      where: { role: UserRoleEnum.ADMIN, status: 1 },
    });

    return okResponse({ hasAdmin: count > 0 });
  } catch (error) {
    console.error("Get admin count error:", error);
    return errorResponse("获取管理员数量失败");
  }
}
