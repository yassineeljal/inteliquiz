import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { NextRequest } from "next/server";

// Debug: Check if token exists
if (!process.env.UPLOADTHING_TOKEN) {
  console.error("WARNING: UPLOADTHING_TOKEN is missing from environment variables!");
}

const handlers = createRouteHandler({
  router: ourFileRouter,
});

export const GET = handlers.GET;

export const POST = async (req: NextRequest) => {
  try {
    const response = await handlers.POST(req);
    if (response.status !== 200) {
        const text = await response.clone().text();
        console.error(`UploadThing Error (${response.status}):`, text);
    }
    return response;
  } catch (error) {
    console.error("UploadThing Handler Exception:", error);
    throw error;
  }
};
