import { cookies } from "next/headers";

export const getWalletAddress = async (): Promise<string | null> => {
  const cookieStore = cookies();
  const wallet = (await cookieStore).get("wallet")?.value;
  return wallet ?? null;
};
