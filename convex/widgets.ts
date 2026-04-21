import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { UTApi } from "uploadthing/server";

export const deleteStorageFiles = action({
  args: {
    fileKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      console.warn("UPLOADTHING_TOKEN is not configured.");
      return { success: false, error: "UPLOADTHING_TOKEN missing" };
    }
    const utapi = new UTApi({ token });
    try {
      await utapi.deleteFiles(args.fileKeys);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete files from UploadThing:", error);
      return { success: false, error: String(error) };
    }
  },
});

export const testWebhook = action({
  args: {
    webhookUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const samplePayload = {
      sessionId: "test-session-123",
      action: "sendMessage",
      chatInput: "This is a test message from the Widget Studio.",
      metadata: {
        source: "Widget Studio",
        type: "test_ping",
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BuildLoop-Webhook-Tester/1.0",
        },
        body: JSON.stringify(samplePayload),
      });

      const responseText = await response.text();

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: responseText.slice(0, 500),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        status: 0,
        statusText: "Fetch Error",
        body: message,
      };
    }
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("widgets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByProjectId = query({
  args: { userId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("widgets")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("widgets"), userId: v.string() },
  handler: async (ctx, args) => {
    const widget = await ctx.db.get(args.id);
    if (!widget || widget.userId !== args.userId) return null;
    return widget;
  },
});

export const getPublicConfig = query({
  args: { id: v.id("widgets") },
  handler: async (ctx, args) => {
    const widget = await ctx.db.get(args.id);
    if (!widget) return null;
    return {
      id: widget._id,
      webhookUrl: widget.webhookUrl,
      type: widget.type,
      theme: widget.theme,
      brand: widget.brand,
      config: widget.config,
      knowledgeBaseId: widget.knowledgeBaseId,
    };
  },
});

export const getTheme = query({
  args: { id: v.id("widgets"), userId: v.string() },
  handler: async (ctx, args) => {
    const widget = await ctx.db.get(args.id);
    if (!widget || widget.userId !== args.userId) return null;
    return widget.theme ?? null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    knowledgeBaseId: v.optional(v.id("knowledgeBases")),
    type: v.union(v.literal("text"), v.literal("voice")),
    webhookUrl: v.string(),
    allowedDomains: v.array(v.string()),
    userId: v.string(),
    theme: v.optional(
      v.object({
        headerTitle: v.optional(v.string()),
        headerSubtitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        placeholderText: v.optional(v.string()),
        botName: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        logoKey: v.optional(v.string()),
        showBranding: v.optional(v.boolean()),
        accentColor: v.optional(v.string()),
        headerTextColor: v.optional(v.string()),
        chatBackgroundColor: v.optional(v.string()),
        botBubbleBgColor: v.optional(v.string()),
        botTextColor: v.optional(v.string()),
        userTextColor: v.optional(v.string()),
        inputBgColor: v.optional(v.string()),
        inputTextColor: v.optional(v.string()),
        inputBorderColor: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        successConfetti: v.optional(v.union(v.literal("small-burst"), v.literal("firework"), v.literal("golden-rain"))),
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
    brand: v.optional(
      v.object({
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        headerTitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
    config: v.optional(
      v.object({
        webhookSecret: v.optional(v.string()),
        defaultLanguage: v.optional(v.union(v.literal("EN"), v.literal("ES"))),
        recordingRetentionDays: v.optional(v.number()),
        aiModel: v.optional(v.string()),
        systemPrompt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("widgets", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("widgets"),
    userId: v.string(),
    name: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    knowledgeBaseId: v.optional(v.id("knowledgeBases")),
    type: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    webhookUrl: v.optional(v.string()),
    allowedDomains: v.optional(v.array(v.string())),
    theme: v.optional(
      v.object({
        headerTitle: v.optional(v.string()),
        headerSubtitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        placeholderText: v.optional(v.string()),
        botName: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        logoKey: v.optional(v.string()),
        showBranding: v.optional(v.boolean()),
        accentColor: v.optional(v.string()),
        headerTextColor: v.optional(v.string()),
        chatBackgroundColor: v.optional(v.string()),
        botBubbleBgColor: v.optional(v.string()),
        botTextColor: v.optional(v.string()),
        userTextColor: v.optional(v.string()),
        inputBgColor: v.optional(v.string()),
        inputTextColor: v.optional(v.string()),
        inputBorderColor: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        successConfetti: v.optional(v.union(v.literal("small-burst"), v.literal("firework"), v.literal("golden-rain"))),
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
    config: v.optional(
      v.object({
        webhookSecret: v.optional(v.string()),
        defaultLanguage: v.optional(v.union(v.literal("EN"), v.literal("ES"))),
        recordingRetentionDays: v.optional(v.number()),
        aiModel: v.optional(v.string()),
        systemPrompt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...fields } = args;
    const widget = await ctx.db.get(id);
    if (!widget || widget.userId !== userId) {
      throw new Error("Widget not found or unauthorized");
    }
    const updates: Record<string, string | boolean | number | string[] | object | undefined> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const updateTheme = mutation({
  args: {
    id: v.id("widgets"),
    userId: v.string(),
    theme: v.optional(
      v.object({
        headerTitle: v.optional(v.string()),
        headerSubtitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        placeholderText: v.optional(v.string()),
        botName: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        logoKey: v.optional(v.string()),
        showBranding: v.optional(v.boolean()),
        accentColor: v.optional(v.string()),
        headerTextColor: v.optional(v.string()),
        chatBackgroundColor: v.optional(v.string()),
        botBubbleBgColor: v.optional(v.string()),
        botTextColor: v.optional(v.string()),
        userTextColor: v.optional(v.string()),
        inputBgColor: v.optional(v.string()),
        inputTextColor: v.optional(v.string()),
        inputBorderColor: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        successConfetti: v.optional(v.union(v.literal("small-burst"), v.literal("firework"), v.literal("golden-rain"))),
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const widget = await ctx.db.get(args.id);
    if (!widget || widget.userId !== args.userId) {
      throw new Error("Widget not found or unauthorized");
    }
    await ctx.db.patch(args.id, { theme: args.theme });
  },
});

export const remove = mutation({
  args: { id: v.id("widgets"), userId: v.string() },
  handler: async (ctx, args) => {
    const widget = await ctx.db.get(args.id);
    if (!widget || widget.userId !== args.userId) {
      throw new Error("Widget not found or unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
