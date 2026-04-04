import { getAdmin } from "@/lib/context";
import { NextRequest } from "next/server";
import queryString from "query-string";
import { z } from "zod";
import { prisma } from "@/prisma";
import {
  forbiddenResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/response";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
  const { error } = await getAdmin();
  if (error) {
    return error === "Unauthorized"
      ? unauthorizedResponse("请先登录")
      : forbiddenResponse("无权限访问");
  }

  const params = queryString.parse(request.url);
  const { page, pageSize } = paginationSchema.parse(params);
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        created_at: true,
        last_login_at: true,
      },
    }),
    prisma.user.count(),
  ]);

  return jsonResponse({
    list: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
