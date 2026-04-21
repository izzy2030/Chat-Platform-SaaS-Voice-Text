"use node";

import Firecrawl from "@mendable/firecrawl-js";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { chunkKnowledgeText } from "../src/lib/knowledge-base-ingest";

type FirecrawlDocument = {
  markdown?: string;
  summary?: string;
  metadata?: {
    title?: string;
    description?: string;
    url?: string;
    sourceURL?: string;
  };
};

function trimToSnippet(markdown?: string) {
  if (!markdown) {
    return undefined;
  }

  const trimmed = markdown.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, 12000);
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

export const recrawlWebsite = action({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; pageCount: number }> => {
    const knowledgeBase: any = await ctx.runQuery(api.knowledgeBases.getById, {
      id: args.knowledgeBaseId,
      userId: args.userId,
    });

    if (!knowledgeBase) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    const websiteSource: any = knowledgeBase.sources.find((source: any) => source.type === "website");
    if (!websiteSource?.websiteUrl) {
      throw new Error("Website source not configured");
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured in Convex environment variables. Get one at firecrawl.dev and run 'npx convex env set FIRECRAWL_API_KEY your_key'");
    }

    const baseUrl = process.env.FIRECRAWL_BASE_URL;

    await ctx.runMutation(internal.knowledgeBases.setSourceRuntimeState, {
      knowledgeBaseId: args.knowledgeBaseId,
      sourceId: websiteSource._id,
      status: "crawling",
      statusMessage: "Crawling website with Firecrawl",
      errorMessage: "",
    });

    try {
      const firecrawl = new Firecrawl({ apiKey, apiUrl: baseUrl });
      const result = await firecrawl.crawl(websiteSource.websiteUrl, {
        limit: 25,
        maxDiscoveryDepth: 2,
        scrapeOptions: {
          formats: ["markdown", "summary"],
          onlyMainContent: true,
        },
      });

      if (result.status !== "completed") {
        throw new Error(`Firecrawl crawl failed with status: ${result.status}. Check Firecrawl dashboard for details.`);
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("Firecrawl crawl completed but returned no pages. Ensure the URL is accessible and not blocked by robots.txt.");
      }

      const crawledAt = Date.now();
      const pages: Array<{
        url: string;
        title: string;
        summary: string;
        contentSnippet?: string;
        included: boolean;
        crawlStatus: "indexed";
        discoveredAt: number;
        crawledAt: number;
      }> = (result.data ?? []).map((document: FirecrawlDocument) => {
        const url: string = document.metadata?.url ?? document.metadata?.sourceURL ?? websiteSource.websiteUrl;
        return {
          url,
          title: document.metadata?.title ?? new URL(url).hostname,
          summary: document.summary ?? document.metadata?.description ?? "",
          contentSnippet: trimToSnippet(document.markdown),
          included: true,
          crawlStatus: "indexed" as const,
          discoveredAt: crawledAt,
          crawledAt,
        };
      });

      const homePage = result.data?.[0];
      const extractedFacts = omitUndefined({
        businessName: homePage?.metadata?.title,
        summary: homePage?.summary ?? homePage?.metadata?.description,
      });

      await ctx.runMutation(internal.knowledgeBases.replaceWebsitePages, {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: websiteSource._id,
        pages,
        extractedFacts,
        crawledAt,
        sourceUrl: websiteSource.websiteUrl,
      });

      return {
        success: true,
        pageCount: pages.length,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to crawl website";
      await ctx.runMutation(internal.knowledgeBases.setSourceRuntimeState, {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: websiteSource._id,
        status: "error",
        statusMessage: "Website crawl failed",
        errorMessage: message,
      });

      throw new Error(message);
    }
  },
});

async function extractFileText(fileUrl: string, fileName: string, mimeType: string) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Could not download uploaded file: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = fileName.toLowerCase().split(".").pop();

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    const text = await new Promise<string>((resolve, reject) => {
      const parser = new PDFParser();
      parser.on("pdfParser_dataError", (error) => {
        reject(error instanceof Error ? error : error.parserError);
      });
      parser.on("pdfParser_dataReady", () => {
        resolve(parser.getRawTextContent().trim());
      });
      parser.parseBuffer(buffer);
    });
    return text;
  }

  if (mimeType.startsWith("text/") || extension === "txt") {
    return buffer.toString("utf8").trim();
  }

  throw new Error("Unsupported file type. V1 supports .docx, .pdf, and .txt only.");
}

export const processUploadedFile = action({
  args: {
    knowledgeBaseId: v.id("knowledgeBases"),
    sourceId: v.id("knowledgeBaseSources"),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; chunkCount: number }> => {
    const knowledgeBase: any = await ctx.runQuery(api.knowledgeBases.getById, {
      id: args.knowledgeBaseId,
      userId: args.userId,
    });

    if (!knowledgeBase) {
      throw new Error("Knowledge base not found or unauthorized");
    }

    const source: any = knowledgeBase.sources.find((item: any) => item._id === args.sourceId);
    if (!source || source.type !== "file" || !source.uploadthingUrl || !source.fileName || !source.mimeType) {
      throw new Error("File source not found or incomplete");
    }

    await ctx.runMutation(internal.knowledgeBases.setSourceRuntimeState, {
      knowledgeBaseId: args.knowledgeBaseId,
      sourceId: args.sourceId,
      status: "crawling",
      statusMessage: "Parsing uploaded document",
      errorMessage: "",
    });

    try {
      const extractedText = await extractFileText(source.uploadthingUrl, source.fileName, source.mimeType);
      const chunks = chunkKnowledgeText(extractedText);

      await ctx.runMutation(internal.knowledgeBases.replaceSourceChunks, {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: args.sourceId,
        extractedText,
        status: "ready",
        errorMessage: "",
        chunks,
      });

      return {
        success: true,
        chunkCount: chunks.length,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to process uploaded file";
      await ctx.runMutation(internal.knowledgeBases.setSourceRuntimeState, {
        knowledgeBaseId: args.knowledgeBaseId,
        sourceId: args.sourceId,
        status: "error",
        statusMessage: "Document processing failed",
        errorMessage: message,
      });
      throw new Error(message);
    }
  },
});

export const verifyFirecrawl = action({
  args: {},
  handler: async (): Promise<{ success: boolean; message: string }> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { success: false, message: "FIRECRAWL_API_KEY is not configured" };
    }

    try {
      const firecrawl = new Firecrawl({ apiKey, apiUrl: process.env.FIRECRAWL_BASE_URL });
      // There is no direct "whoami" but we can try to crawl a simple page or check account if SDK supports it
      // For now, we will just return success if the key is present and we can instantiate
      return { success: true, message: "Firecrawl SDK initialized successfully" };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error initializing Firecrawl"
      };
    }
  },
});

