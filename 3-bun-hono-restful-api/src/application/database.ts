import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { logger } from "./logging";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prismaClient = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("query", (e) => {
  logger.info(e);
});

prismaClient.$on("error", (e) => {
  logger.error(e);
});

prismaClient.$on("info", (e) => {
  logger.info(e);
});

prismaClient.$on("warn", (e) => {
  logger.warn(e);
});
