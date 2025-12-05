import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async () => {
      try {
        const user = await auth();
        console.log("UploadThing Middleware - User:", user?.userId);
        
        if (!user || !user.userId) {
          console.error("UploadThing Middleware - Unauthorized: No user found");
          throw new Error("Unauthorized");
        }
        
        return { userId: user.userId };
      } catch (error) {
        console.error("UploadThing Middleware Error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
