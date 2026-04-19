"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { UTApi } from "uploadthing/server";
import { v } from "convex/values";

export const deleteExpiredRecordings = internalAction({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      console.warn("UPLOADTHING_TOKEN is not configured in Convex environment variables.");
      return { deleted: 0, skipped: true };
    }

    const batchSize = Math.min(Math.max(args.batchSize ?? 25, 1), 100);
    const expiredMessages: Array<{ _id: string; uploadthingFileKey: string }> =
      await ctx.runQuery(internal.recordingCleanup.getExpiredUploadThingMessages, {
        now: Date.now(),
        limit: batchSize,
      });

    if (expiredMessages.length === 0) {
      return { deleted: 0, skipped: false };
    }

    const utapi = new UTApi({ token });
    await utapi.deleteFiles(expiredMessages.map((message) => message.uploadthingFileKey));

    await ctx.runMutation(internal.recordingCleanup.clearExpiredUploadThingMessages, {
      messageIds: expiredMessages.map((message) => message._id as any),
    });

    if (expiredMessages.length === batchSize) {
      await ctx.scheduler.runAfter(
        0,
        internal.recordingCleanupActions.deleteExpiredRecordings,
        { batchSize }
      );
    }

    return { deleted: expiredMessages.length, skipped: false };
  },
});
