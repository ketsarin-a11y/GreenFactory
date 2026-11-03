import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createAdapter } from "../../src/server/db-adapter";

export const prisma = new PrismaClient({ adapter: createAdapter(process.env.DATABASE_URL) });
