import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) return NextResponse.json({ exists: false });

  const user = await db?.user.findUnique({
    where: { wallet: wallet.toLowerCase() },
  });

  return NextResponse.json({ exists: !!user });
}
