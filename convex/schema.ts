import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  conversations: defineTable({
    widgetId: v.id("widgets"),
    userId: v.string(),
    sessionId: v.string(),
    channel: v.union(v.literal("text"), v.literal("voice")),
    status: v.union(
      v.literal("active"),
      v.literal("ongoing"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    visitorLabel: v.string(),
    visitorEmail: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
    startedAt: v.number(),
    lastMessageAt: v.number(),
    lastMessagePreview: v.string(),
    unreadForOwner: v.boolean(),
    messageCount: v.number(),
    totalDurationMs: v.number(),
    recordingCount: v.number(),
  })
    .index("by_userId_and_lastMessageAt", ["userId", "lastMessageAt"])
    .index("by_userId_and_channel_and_lastMessageAt", ["userId", "channel", "lastMessageAt"])
    .index("by_widgetId_and_sessionId", ["widgetId", "sessionId"])
    .index("by_widgetId_and_lastMessageAt", ["widgetId", "lastMessageAt"]),

  conversationMessages: defineTable({
    conversationId: v.id("conversations"),
    widgetId: v.id("widgets"),
    sender: v.union(v.literal("visitor"), v.literal("agent")),
    kind: v.union(v.literal("text"), v.literal("audio")),
    body: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    durationMs: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_conversationId_and_createdAt", ["conversationId", "createdAt"]),

  widgets: defineTable({
    name: v.string(), // "Widget Title" in Content tab
    projectId: v.id("projects"),
    type: v.union(v.literal("text"), v.literal("voice")),
    webhookUrl: v.string(),
    allowedDomains: v.array(v.string()),
    userId: v.string(),
    theme: v.optional(
      v.object({
        // Content Tab
        headerTitle: v.optional(v.string()), // Alias for Widget Title
        headerSubtitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        placeholderText: v.optional(v.string()),
        botName: v.optional(v.string()),
        showBranding: v.optional(v.boolean()),

        // Design Tab
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

        // Legacy/Other Fields
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
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),
});
