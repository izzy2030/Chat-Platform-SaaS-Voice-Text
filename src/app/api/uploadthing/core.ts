import { z } from "zod";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  voiceRecording: f({
    audio: {
      maxFileCount: 1,
      maxFileSize: "16MB",
    },
  })
    .input(
      z.object({
        widgetId: z.string(),
        sessionId: z.string(),
      })
    )
    .middleware(async ({ input }) => {
      return { ...input };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        widgetId: metadata.widgetId,
        sessionId: metadata.sessionId,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
