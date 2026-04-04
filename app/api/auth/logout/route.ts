import { cookies } from "next/headers";
import { okResponse } from "@/lib/response";
import config from "@/config";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(config.JWT_COOKIE_NAME);

  return okResponse(null, "退出成功");
}
