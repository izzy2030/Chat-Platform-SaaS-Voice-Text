import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

const knowledgeBaseSourceStatusValidator = v.union(
  v.literal("idle"),
  v.literal("crawling"),
  v.literal("ready"),
  v.literal("error"),
);

const factFieldsValidator = v.object({
  businessName: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  address: v.optional(v.string()),
  hours: v.optional(v.string()),
  summary: v.optional(v.string()),
});

const chunkValidator = v.object({
  chunkIndex: v.number(),
  sectionTitle: v.optional(v.string()),
  text: v.string(),
  charCount: v.number(),
});

const pageStatusValidator = v.union(
  v.literal("indexed"),
  v.literal("excluded"),
  v.literal("error"),
);

function coerceWebsiteUrl(url: string) {
  const trimmedValue = url.trim();
  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

export const listByUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const knowledgeBases = await ctx.db
      .query("knowledgeBases")
      .withIndex("by_userId_and_name", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(100);

    const items = [];
    for (const knowledgeBase of knowledgeBases) {
      const sources = await ctx.db
        .query("knowledgeBaseSources")
        .withIndex("by_knowledgeBaseId", (q) => q.eq("knowledgeBaseId", knowledgeBase._id))
        .take(20);

      const pages = await ctx.db
        .query("knowledgeBasePages")
        .withIndex("by_knowledgeBaseId_and_crawledAt", (q) => q.eq("knowledgeBaseId", knowledgeBase._id))
        .order("desc")
        .take(100);

      items.push({
        ...knowledgeBase,
        sources,
        pageStats: {
          pagesIndexed: pages.filter((page) => page.included && page.crawlStatus === "indexed").length,
          urlsDiscovered: pages.length,
          includedPages: pages.filter((page) => page.included).length,
        },
      });
    }

    return items;
  },
});

export const getById = query({
  args: {
    id: v.id("knowledgeBases"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      return null;
    }

    const sources = await ctx.db
      .query("knowledgeBaseSources")
      .withIndex("by_knowledgeBaseId", (q) => q.eq("knowledgeBaseId", args.id))
      .take(20);

    const pages = await ctx.db
      .query("knowledgeBasePages")
      .withIndex("by_knowledgeBaseId_and_crawledAt", (q) => q.eq("knowledgeBaseId", args.id))
      .order("desc")
      .take(250);

    return {
      ...knowledgeBase,
      sources,
      pages,
      pageStats: {
        pagesIndexed: pages.filter((page) => page.included && page.crawlStatus === "indexed").length,
        urlsDiscovered: pages.length,
        includedPages: pages.filter((page) => page.included).length,
      },
    };
  },
});

export const createWebsiteDraft = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    websiteUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== args.userId) {
      throw new Error("Project not found or unauthorized");
    }

    const websiteUrl = coerceWebsiteUrl(args.websiteUrl);
    const now = Date.now();
    const knowledgeBaseId = await ctx.db.insert("knowledgeBases", {
      projectId: args.projectId,
      userId: args.userId,
      name: args.name.trim(),
      websiteUrl,
      status: "crawling",
      published: false,
      crawlStatusMessage: "Queued for website crawl",
      sourceCount: 1,
    });

    const sourceId = await ctx.db.insert("knowledgeBaseSources", {
      knowledgeBaseId,
      userId: args.userId,
      type: "website",
      label: websiteUrl,
      status: "crawling",
      websiteUrl,
      lastSyncedAt: now,
      pageCount: 0,
    });

    return { knowledgeBaseId, sourceId };
  },
});

export const updateKnowledgeBase = mutation({
  args: {
    id: v.id("knowledgeBases"),
    userId: v.string(),
    name: v.optional(v.string()),
    locationName: v.optional(v.string()),
    vertical: v.optional(v.string()),
    published: v.optional(v.boolean()),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    const patch: Partial<Doc<"knowledgeBases">> = {};
    if (args.name !== undefined) {
      patch.name = args.name.trim();
    }
    if (args.locationName !== undefined) {
      patch.locationName = args.locationName.trim();
    }
    if (args.vertical !== undefined) {
      patch.vertical = args.vertical.trim();
    }
    if (args.websiteUrl !== undefined) {
      patch.websiteUrl = args.websiteUrl.trim() ? coerceWebsiteUrl(args.websiteUrl) : knowledgeBase.websiteUrl;
    }
    if (args.published !== undefined) {
      patch.published = args.published;
      if (args.published) {
        patch.publishedAt = Date.now();
      }
    }

    await ctx.db.patch(args.id, omitUndefined(patch));
  },
});

export const updateManualFacts = mutation({
  args: {
    id: v.id("knowledgeBases"),
    userId: v.string(),
    manualFacts: factFieldsValidator,
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      manualFacts: omitUndefined(args.manualFacts),
    });
  },
});

export const createTextSource = mutation({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    userId: v.string(),
    label: v.string(),
    textContent: v.string(),
    chunks: v.array(chunkValidator),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.knowledgeBaseId);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    const now = Date.now();
    const sourceId = await ctx.db.insert("knowledgeBaseSources", {
      knowledgeBaseId: args.knowledgeBaseId,
      userId: args.userId,
      type: "text",
      label: args.label.trim(),
      status: "ready",
      textContent: args.textContent,
      extractedText: args.textContent,
      lastSyncedAt: now,
      pageCount: 1,
    });

    for (const chunk of args.chunks) {
      await ctx.db.insert("knowledgeBaseChunks", {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId,
        chunkIndex: chunk.chunkIndex,
        sectionTitle: chunk.sectionTitle,
        text: chunk.text,
        charCount: chunk.charCount,
        embeddingStatus: "pending",
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.knowledgeBaseId, {
      sourceCount: knowledgeBase.sourceCount + 1,
    });

    return sourceId;
  },
});

export const registerFileSource = mutation({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    userId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    uploadthingFileKey: v.string(),
    uploadthingUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.knowledgeBaseId);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    const now = Date.now();
    const sourceId = await ctx.db.insert("knowledgeBaseSources", {
      knowledgeBaseId: args.knowledgeBaseId,
      userId: args.userId,
      type: "file",
      label: args.fileName,
      status: "idle",
      fileName: args.fileName,
      mimeType: args.mimeType,
      uploadthingFileKey: args.uploadthingFileKey,
      uploadthingUrl: args.uploadthingUrl,
      lastSyncedAt: now,
      pageCount: 0,
    });

    await ctx.db.patch(args.knowledgeBaseId, {
      sourceCount: knowledgeBase.sourceCount + 1,
    });

    return sourceId;
  },
});

export const setPageIncluded = mutation({
  args: {
    pageId: v.id("knowledgeBasePages"),
    userId: v.string(),
    included: v.boolean(),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Knowledge base page not found");
    }

    const knowledgeBase = await ctx.db.get(page.knowledgeBaseId);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    await ctx.db.patch(args.pageId, {
      included: args.included,
      crawlStatus: args.included ? "indexed" : "excluded",
    });
  },
});

export const setSourceRuntimeState = internalMutation({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    status: knowledgeBaseSourceStatusValidator,
    statusMessage: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source || source.knowledgeBaseId !== args.knowledgeBaseId) {
      throw new Error("Knowledge base source not found");
    }

    await ctx.db.patch(args.sourceId, {
      status: args.status,
      errorMessage: args.errorMessage,
      lastSyncedAt: Date.now(),
    });

    const nextStatus: Doc<"knowledgeBases">["status"] =
      args.status === "error" ? "error" : args.status === "crawling" ? "crawling" : "draft";

    await ctx.db.patch(args.knowledgeBaseId, {
      status: nextStatus,
      crawlStatusMessage: args.errorMessage ?? args.statusMessage,
    });
  },
});

export const replaceWebsitePages = internalMutation({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    sourceUrl: v.string(),
    crawledAt: v.number(),
    extractedFacts: factFieldsValidator,
    pages: v.array(
      v.object({
        url: v.string(),
        title: v.string(),
        summary: v.string(),
        contentSnippet: v.optional(v.string()),
        included: v.boolean(),
        crawlStatus: pageStatusValidator,
        discoveredAt: v.number(),
        crawledAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source || source.knowledgeBaseId !== args.knowledgeBaseId) {
      throw new Error("Knowledge base source not found");
    }

    const existingPages = await ctx.db
      .query("knowledgeBasePages")
      .withIndex("by_sourceId_and_crawledAt", (q) => q.eq("sourceId", args.sourceId))
      .take(512);

    for (const page of existingPages) {
      await ctx.db.delete(page._id);
    }

    for (const page of args.pages) {
      await ctx.db.insert("knowledgeBasePages", {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: args.sourceId,
        url: page.url,
        title: page.title,
        summary: page.summary,
        contentSnippet: page.contentSnippet,
        included: page.included,
        crawlStatus: page.crawlStatus,
        discoveredAt: page.discoveredAt,
        crawledAt: page.crawledAt,
      });
    }

    await ctx.db.patch(args.sourceId, {
      status: "ready",
      errorMessage: "",
      lastSyncedAt: args.crawledAt,
      pageCount: args.pages.length,
      label: args.sourceUrl,
      websiteUrl: args.sourceUrl,
    });

    await ctx.db.patch(args.knowledgeBaseId, {
      websiteUrl: args.sourceUrl,
      status: "ready",
      crawlStatusMessage: `Indexed ${args.pages.length} pages`,
      lastCrawledAt: args.crawledAt,
      extractedFacts: omitUndefined(args.extractedFacts),
    });
  },
});

export const replaceSourceChunks = internalMutation({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    extractedText: v.string(),
    status: knowledgeBaseSourceStatusValidator,
    errorMessage: v.string(),
    chunks: v.array(chunkValidator),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source || source.knowledgeBaseId !== args.knowledgeBaseId) {
      throw new Error("Knowledge base source not found");
    }

    const existingChunks = await ctx.db
      .query("knowledgeBaseChunks")
      .withIndex("by_sourceId_and_chunkIndex", (q) => q.eq("sourceId", args.sourceId))
      .take(512);

    for (const chunk of existingChunks) {
      await ctx.db.delete(chunk._id);
    }

    const now = Date.now();
    for (const chunk of args.chunks) {
      await ctx.db.insert("knowledgeBaseChunks", {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: args.sourceId,
        chunkIndex: chunk.chunkIndex,
        sectionTitle: chunk.sectionTitle,
        text: chunk.text,
        charCount: chunk.charCount,
        embeddingStatus: "pending",
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.sourceId, {
      status: args.status,
      extractedText: args.extractedText,
      errorMessage: args.errorMessage,
      lastSyncedAt: now,
      pageCount: args.chunks.length,
    });
  },
});

export const removeKnowledgeBase = mutation({
  args: {
    id: v.id("knowledgeBases"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase || knowledgeBase.userId !== args.userId) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    // 1. Delete all sources
    const sources = await ctx.db
      .query("knowledgeBaseSources")
      .withIndex("by_knowledgeBaseId", (q) => q.eq("knowledgeBaseId", args.id))
      .collect();

    for (const source of sources) {
      await ctx.db.delete(source._id);
    }

    // 2. Delete all pages
    const pages = await ctx.db
      .query("knowledgeBasePages")
      .withIndex("by_knowledgeBaseId_and_crawledAt", (q) => q.eq("knowledgeBaseId", args.id))
      .collect();

    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    // 3. Delete all chunks
    const chunks = await ctx.db
      .query("knowledgeBaseChunks")
      .withIndex("by_knowledgeBaseId_and_chunkIndex", (q) => q.eq("knowledgeBaseId", args.id))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    // 4. Finally delete the KB
    await ctx.db.delete(args.id);
  },
});

export const getChunksByKbId = query({
  args: { knowledgeBaseId: v.id("knowledgeBases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBaseChunks")
      .withIndex("by_knowledgeBaseId_and_chunkIndex", (q) =>
        q.eq("knowledgeBaseId", args.knowledgeBaseId)
      )
      .collect();
  },
});

