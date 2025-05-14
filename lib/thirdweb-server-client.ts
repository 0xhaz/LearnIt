import { createThirdwebClient } from "thirdweb";

export const thirdwebServerClient = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID!,
  secretKey: process.env.THIRDWEB_CLIENT_SECRET!,
});
