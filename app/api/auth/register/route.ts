import { hashPassword } from "@/lib/crypto";
import { UserRoleEnum } from "@/enums";
import { prisma } from "@/prisma";
import { z } from "zod";
import {
  badRequestResponse,
  errorResponse,
  forbiddenResponse,
  okResponse,
} from "@/lib/response";

const schema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  email: z.email("邮箱格式不正确"),
  password: z.string().min(6, "密码长度至少6位"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { error, data } = schema.safeParse(body);

    if (error) return badRequestResponse(error.message);

    const { username, email, password } = data;

    const adminCount = await prisma.user.count({
      where: { role: UserRoleEnum.ADMIN, status: 1 },
    });

    if (adminCount > 0) return forbiddenResponse("管理员已存在，无法注册");

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) return badRequestResponse("用户名或邮箱已被使用");

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname: username,
        role: UserRoleEnum.ADMIN,
      },
    });

    return okResponse(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      "注册成功",
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("服务器错误");
  }
}
