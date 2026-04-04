import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "@/config";

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL 未配置");
}

let schema = "public";

try {
  const url = new URL(config.DATABASE_URL);
  schema = url.searchParams.get("schema") || "public";
} catch {
  schema = "public";
}

const adapter = new PrismaPg(
  { connectionString: config.DATABASE_URL },
  { schema },
);

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
