import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const password = process.env.DB_PASSWORD;

  if (!password) {
    throw new Error("DB_PASSWORD is not set");
  }

  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";

  return `postgresql://postgres:${encodeURIComponent(
    password
  )}@${host}:${port}/postgres?schema=public`;
};

const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma, PrismaClient };
