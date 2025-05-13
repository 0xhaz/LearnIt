import { server } from "@/graphql/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createContext } from "@/graphql/context";

const handler = startServerAndCreateNextHandler(server, {
  context: createContext,
});

export { handler as GET, handler as POST };
