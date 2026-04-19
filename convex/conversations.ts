import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, MutationCtx } from "./_generated/server";

const conversationStatusValidator = v.union(
  v.literal("active"),
  v.literal("ongoing"),
  v.literal("resolved"),
  v.literal("escalated")
);

const channelValidator = v.union(v.literal("text"), v.literal("voice"));

const messageKindValidator = v.union(v.literal("text"), v.literal("audio"));

async function getOrCreateConversation(
  ctx: MutationCtx,
  args: {
    widgetId: Id<"widgets">;
    sessionId: string;
    channel: Doc<"conversations">["channel"];
    pageUrl?: string;
  }
) {
  const widget = await ctx.db.get(args.widgetId);
  if (!widget) {
    throw new Error("Widget not found");
  }

  const existingConversation = await ctx.db
    .query("conversations")
    .withIndex("by_widgetId_and_sessionId", (q) =>
      q.eq("widgetId", args.widgetId).eq("sessionId", args.sessionId)
    )
    .unique();

  if (existingConversation) {
    if (args.pageUrl && existingConversation.pageUrl !== args.pageUrl) {
      await ctx.db.patch(existingConversation._id, {
        pageUrl: args.pageUrl,
      });
      return {
        conversation: {
          ...existingConversation,
          pageUrl: args.pageUrl,
        },
        widget,
      };
    }

    return { conversation: existingConversation, widget };
  }

  const startedAt = Date.now();
  const conversationId = await ctx.db.insert("conversations", {
    widgetId: args.widgetId,
    userId: widget.userId,
    sessionId: args.sessionId,
    channel: args.channel,
    status: "active",
    visitorLabel: `Visitor ${args.sessionId.slice(-8)}`,
    pageUrl: args.pageUrl,
    startedAt,
    lastMessageAt: startedAt,
    lastMessagePreview: "",
    unreadForOwner: false,
    messageCount: 0,
    totalDurationMs: 0,
    recordingCount: 0,
  });

  const conversation = await ctx.db.get(conversationId);
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  return { conversation, widget };
}

async function appendMessage(
  ctx: MutationCtx,
  args: {
    widgetId: Id<"widgets">;
    sessionId: string;
    channel: Doc<"conversations">["channel"];
    sender: Doc<"conversationMessages">["sender"];
    kind: Doc<"conversationMessages">["kind"];
    body: string;
    pageUrl?: string;
    audioStorageId?: Id<"_storage">;
    uploadthingFileKey?: string;
    uploadthingUrl?: string;
    expiresAt?: number;
    durationMs?: number;
  }
) {
  const { conversation } = await getOrCreateConversation(ctx, args);
  const createdAt = Date.now();

  await ctx.db.insert("conversationMessages", {
    conversationId: conversation._id,
    widgetId: args.widgetId,
    sender: args.sender,
    kind: args.kind,
    body: args.body,
    audioStorageId: args.audioStorageId,
    uploadthingFileKey: args.uploadthingFileKey,
    uploadthingUrl: args.uploadthingUrl,
    expiresAt: args.expiresAt,
    durationMs: args.durationMs,
    createdAt,
  });

  await ctx.db.patch(conversation._id, {
    channel: args.channel,
    lastMessageAt: createdAt,
    lastMessagePreview: args.body,
    unreadForOwner: args.sender === "visitor",
    status: args.sender === "visitor" ? "active" : "ongoing",
    messageCount: conversation.messageCount + 1,
    totalDurationMs: conversation.totalDurationMs + (args.durationMs ?? 0),
    recordingCount: conversation.recordingCount + (args.kind === "audio" ? 1 : 0),
    pageUrl: args.pageUrl ?? conversation.pageUrl,
  });

  return conversation._id;
}

export const listByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_and_lastMessageAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const widgetMap = new Map<Id<"widgets">, Doc<"widgets"> | null>();
    for (const conversation of conversations) {
      if (!widgetMap.has(conversation.widgetId)) {
        widgetMap.set(conversation.widgetId, await ctx.db.get(conversation.widgetId));
      }
    }

    return conversations.map((conversation) => {
      const widget = widgetMap.get(conversation.widgetId);
      return {
        ...conversation,
        widgetName: widget?.name ?? "Unknown Widget",
      };
    });
  },
});

export const getById = query({
  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== args.userId) {
      return null;
    }

    const widget = await ctx.db.get(conversation.widgetId);
    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_conversationId_and_createdAt", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("asc")
      .take(200);

    return {
      ...conversation,
      widgetName: widget?.name ?? "Unknown Widget",
      messages: messages.map((message) => ({
        ...message,
        audioUrl: message.uploadthingUrl ?? null,
      })),
    };
  },
});

export const listCallsByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_and_channel_and_lastMessageAt", (q) =>
        q.eq("userId", args.userId).eq("channel", "voice")
      )
      .order("desc")
      .take(limit);

    const widgetMap = new Map<Id<"widgets">, Doc<"widgets"> | null>();
    for (const conversation of conversations) {
      if (!widgetMap.has(conversation.widgetId)) {
        widgetMap.set(conversation.widgetId, await ctx.db.get(conversation.widgetId));
      }
    }

    return conversations.map((conversation) => ({
      ...conversation,
      widgetName: widgetMap.get(conversation.widgetId)?.name ?? "Unknown Widget",
    }));
  },
});

export const getDashboardSummary = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const recentConversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_and_lastMessageAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    const widgetMap = new Map<Id<"widgets">, Doc<"widgets"> | null>();
    for (const conversation of recentConversations) {
      if (!widgetMap.has(conversation.widgetId)) {
        widgetMap.set(conversation.widgetId, await ctx.db.get(conversation.widgetId));
      }
    }

    return {
      stats: {
        conversationCount: recentConversations.length,
        liveCount: recentConversations.filter((conversation) => conversation.status === "active").length,
        unreadCount: recentConversations.filter((conversation) => conversation.unreadForOwner).length,
        resolvedCount: recentConversations.filter((conversation) => conversation.status === "resolved").length,
      },
      recentConversations: recentConversations.slice(0, 6).map((conversation) => ({
        ...conversation,
        widgetName: widgetMap.get(conversation.widgetId)?.name ?? "Unknown Widget",
      })),
    };
  },
});

export const recordVisitorMessage = mutation({
  args: {
    widgetId: v.id("widgets"),
    sessionId: v.string(),
    channel: channelValidator,
    kind: messageKindValidator,
    text: v.string(),
    pageUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    uploadthingFileKey: v.optional(v.string()),
    uploadthingUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await appendMessage(ctx, {
      widgetId: args.widgetId,
      sessionId: args.sessionId,
      channel: args.channel,
      sender: "visitor",
      kind: args.kind,
      body: args.text,
      pageUrl: args.pageUrl,
      audioStorageId: args.audioStorageId,
      uploadthingFileKey: args.uploadthingFileKey,
      uploadthingUrl: args.uploadthingUrl,
      expiresAt: args.expiresAt,
      durationMs: args.durationMs,
    });
  },
});

export const recordAgentMessage = mutation({
  args: {
    widgetId: v.id("widgets"),
    sessionId: v.string(),
    channel: channelValidator,
    kind: messageKindValidator,
    text: v.string(),
    pageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await appendMessage(ctx, {
      widgetId: args.widgetId,
      sessionId: args.sessionId,
      channel: args.channel,
      sender: "agent",
      kind: args.kind,
      body: args.text,
      pageUrl: args.pageUrl,
    });
  },
});

export const markAsRead = mutation({
  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== args.userId) {
      throw new Error("Conversation not found or unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      unreadForOwner: false,
    });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
    status: conversationStatusValidator,
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== args.userId) {
      throw new Error("Conversation not found or unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: args.status,
    });
  },
});
