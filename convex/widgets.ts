import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...fields } = args;
    const widget = await ctx.db.get(id);
    if (!widget || widget.userId !== userId) {
      throw new Error("Widget not found or unauthorized");
    }
    const updates: Record<string, any> = {};
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
    theme: v.any(),
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
