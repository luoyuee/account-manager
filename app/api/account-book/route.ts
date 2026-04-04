import { getCurrentUser } from "@/lib/context";
import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import {
  badRequestResponse,
  createdResponse,
  okResponse,
  unauthorizedResponse,
} from "@/lib/response";
import z from "zod";

export async function GET() {
  const { user, error } = await getCurrentUser();
  if (error) {
    return unauthorizedResponse("请先登录");
  }

  const accountBook = await prisma.accountBook.findFirst({
    where: {
      created_by: user.id,
      status: 1,
    },
    orderBy: [{ updated_at: "desc" }, { created_at: "desc" }],
  });

  if (!accountBook) {
    return okResponse(null, "未找到账号数据");
  }

  return okResponse(accountBook);
}

export async function POST(request: NextRequest) {
  const { user, error } = await getCurrentUser();
  if (error) {
    return unauthorizedResponse("请先登录");
  }

  const schema = z.object({
    password: z.string().min(1, "密码不能为空"),
    data: z.string().min(1, "数据不能为空"),
  });
  const body = await request.json();
  const { error: schemaError, data } = schema.safeParse(body);

  if (schemaError) {
    return okResponse(null, schemaError.message);
  }

  const accountBook = await prisma.accountBook.create({
    data: {
      password: data.password,
      data: data.data,
      created_by: user.id,
      created_at: new Date(),
      status: 1,
      version: 1,
    },
  });

  return createdResponse(accountBook);
}

export async function PUT(request: NextRequest) {
  const { user, error } = await getCurrentUser();
  if (error) {
    return unauthorizedResponse("请先登录");
  }

  const schema = z.object({
    id: z.coerce.number().min(1, "账号数据 ID 不能为空"),
    data: z.string().min(1, "数据不能为空"),
    version: z.coerce.number().min(1, "数据版本不能为空"),
  });
  const body = await request.json();
  const { error: schemaError, data } = schema.safeParse(body);

  if (schemaError) {
    return badRequestResponse(schemaError.message);
  }

  const existing = await prisma.accountBook.findFirst({
    where: {
      id: data.id,
      created_by: user.id,
      status: 1,
    },
  });

  if (!existing) {
    return okResponse(null, "未找到账号数据");
  }

  if (existing.version !== data.version) {
    return badRequestResponse("数据版本不一致，请刷新后重试");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.accountBookHistory.create({
      data: {
        account_book_id: existing.id,
        password: existing.password,
        data: existing.data,
        version: existing.version,
        updated_by: user.id,
        updated_at: new Date(),
        status: 1,
      },
    });

    return tx.accountBook.update({
      where: { id: data.id },
      data: {
        data: data.data,
        version: existing.version + 1,
        updated_by: user.id,
      },
    });
  });

  return okResponse(updated);
}
