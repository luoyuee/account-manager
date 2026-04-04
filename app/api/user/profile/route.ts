import { jsonResponse, unauthorizedResponse } from "@/lib/response";
import { getCurrentUser } from "@/lib/context";
import { prisma } from "@/prisma";

export async function GET() {
  const { user, error } = await getCurrentUser();
  if (error) {
    return unauthorizedResponse("请先登录");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id, status: 1 },
    select: {
      id: true,
      username: true,
      nickname: true,
      email: true,
      avatar: true,
      role: true,
      created_at: true,
      last_login_at: true,
    },
  });

  return jsonResponse(profile);
}
