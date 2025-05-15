import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  wallet?: string;
};

export const createContext = async (req: Request): Promise<Context> => {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  console.log("authHeader:", req.headers.get("authorization"));

  return {
    prisma,
    wallet: token || undefined,
  };
};
