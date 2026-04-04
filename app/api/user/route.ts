import { hashPassword } from "@/lib/crypto";
import { getAdmin } from "@/lib/context";
import { UserRoleEnum } from "@/enums";
import { prisma } from "@/prisma";
import { z } from "zod";
import {
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/response";

const schema = z.object({
  username: z.string().min(1, "用户名不能为空").max(50, "用户名过长"),
  email: z.email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(request: Request) {
  const { error } = await getAdmin();
  if (error) {
    return error === "Unauthorized"
      ? unauthorizedResponse("请先登录")
      : forbiddenResponse("无权限操作");
  }

  try {
    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      return badRequestResponse("用户名或邮箱已存在");
    }

    const user = await prisma.user.create({
      data: {
        username: data.username,
        nickname: data.username,
        email: data.email,
        password: hashPassword(data.password),
        role: UserRoleEnum.NORMAL_USER,
        status: 1,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    return jsonResponse(user);
  } catch (err) {
    console.error("Create user error:", err);
    return errorResponse("创建用户失败");
  }
}
