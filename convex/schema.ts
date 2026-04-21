import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  knowledgeBases: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    name: v.string(),
    businessName: v.optional(v.string()),
    locationName: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    vertical: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("crawling"),
      v.literal("ready"),
      v.literal("error")
    ),
    published: v.boolean(),
    lastCrawledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    crawlStatusMessage: v.optional(v.string()),
    sourceCount: v.number(),
    extractedFacts: v.optional(
      v.object({
        businessName: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
        hours: v.optional(v.string()),
        summary: v.optional(v.string()),
      })
    ),
    manualFacts: v.optional(
      v.object({
        businessName: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
        hours: v.optional(v.string()),
        summary: v.optional(v.string()),
      })
    ),
  })
    .index("by_userId_and_name", ["userId", "name"])
    .index("by_projectId_and_name", ["projectId", "name"]),

  knowledgeBaseSources: defineTable({
    knowledgeBaseId: v.id("knowledgeBases"),
    userId: v.string(),
    type: v.union(v.literal("website"), v.literal("file"), v.literal("text")),
    label: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("crawling"),
      v.literal("ready"),
      v.literal("error")
    ),
    websiteUrl: v.optional(v.string()),
    textContent: v.optional(v.string()),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    uploadthingFileKey: v.optional(v.string()),
    uploadthingUrl: v.optional(v.string()),
    extractedText: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    pageCount: v.number(),
  })
    .index("by_knowledgeBaseId", ["knowledgeBaseId"])
    .index("by_userId_and_type", ["userId", "type"]),

  knowledgeBaseChunks: defineTable({
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    chunkIndex: v.number(),
    sectionTitle: v.optional(v.string()),
    text: v.string(),
    charCount: v.number(),
    embeddingStatus: v.union(
      v.literal("pending"),
      v.literal("ready"),
      v.literal("error")
    ),
    pinecodeId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_knowledgeBaseId_and_chunkIndex", ["knowledgeBaseId", "chunkIndex"])
    .index("by_sourceId_and_chunkIndex", ["sourceId", "chunkIndex"]),

  knowledgeBasePages: defineTable({
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    url: v.string(),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    contentSnippet: v.optional(v.string()),
    included: v.boolean(),
    crawlStatus: v.union(
      v.literal("indexed"),
      v.literal("excluded"),
      v.literal("error")
    ),
    discoveredAt: v.number(),
    crawledAt: v.number(),
  })
    .index("by_knowledgeBaseId_and_crawledAt", ["knowledgeBaseId", "crawledAt"])
    .index("by_knowledgeBaseId_and_url", ["knowledgeBaseId", "url"])
    .index("by_sourceId_and_crawledAt", ["sourceId", "crawledAt"]),

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
    uploadthingFileKey: v.optional(v.string()),
    uploadthingUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_conversationId_and_createdAt", ["conversationId", "createdAt"])
    .index("by_expiresAt", ["expiresAt"]),

  widgets: defineTable({
    name: v.string(), // "Widget Title" in Content tab
    projectId: v.id("projects"),
    knowledgeBaseId: v.optional(v.id("knowledgeBases")),
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
        successConfetti: v.optional(v.union(v.literal("small-burst"), v.literal("firework"), v.literal("golden-rain"))),

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
        recordingRetentionDays: v.optional(v.number()),
        aiModel: v.optional(v.string()),
        systemPrompt: v.optional(v.string()),
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),
});
