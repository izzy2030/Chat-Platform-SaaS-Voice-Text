import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getExpiredUploadThingMessages = internalQuery({
  args: {
    now: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("conversationMessages")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", args.now))
      .order("asc")
      .take(Math.max(args.limit * 3, args.limit));

    return candidates
      .filter((message) => !!message.uploadthingFileKey)
      .slice(0, args.limit)
      .map((message) => ({
        _id: message._id,
        uploadthingFileKey: message.uploadthingFileKey!,
      }));
  },
});

export const clearExpiredUploadThingMessages = internalMutation({
  args: {
    messageIds: v.array(v.id("conversationMessages")),
  },
  handler: async (ctx, args) => {
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (!message) {
        continue;
      }

      const cleanedMessage: Omit<Doc<"conversationMessages">, "_id" | "_creationTime"> = {
        conversationId: message.conversationId,
        widgetId: message.widgetId,
        sender: message.sender,
        kind: message.kind,
        body: message.body,
        createdAt: message.createdAt,
      };

      if (message.audioStorageId) {
        cleanedMessage.audioStorageId = message.audioStorageId;
      }
      if (message.durationMs !== undefined) {
        cleanedMessage.durationMs = message.durationMs;
      }

      await ctx.db.replace(messageId, cleanedMessage);
    }
  },
});
