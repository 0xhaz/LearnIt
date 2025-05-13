import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getWalletAddress } from "@/lib/get-wallet-server";

const f = createUploadthing();

const handleAuth = async () => {
  const wallet = await getWalletAddress();

  if (!wallet) {
    throw new UploadThingError("Unauthorized: Wallet not found");
  }

  return { wallet };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      // optional: handle course image metadata
    }),

  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      // optional: handle attachment saving
    }),

  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "1024GB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      // optional: handle mux integration
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
