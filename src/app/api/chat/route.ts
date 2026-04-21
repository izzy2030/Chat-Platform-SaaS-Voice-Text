import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { resolveTextSystemInstruction } from "@/lib/widget-agent-prompt";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

const DEFAULT_MODEL = "gemini-2.5-flash";

async function convexQuery(name: string, args: Record<string, unknown>) {
  const url = `${CONVEX_URL}/api/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args, format: "json" }),
  });
  const json = await res.json();
  if (json.status === "error") {
    throw new Error(json.errorMessage || "Convex query failed");
  }
  return json.value;
}

async function fetchKbContext(knowledgeBaseId: string): Promise<string> {
  try {
    const chunks = await convexQuery("knowledgeBases:getChunksByKbId", {
      knowledgeBaseId,
    });
    if (!Array.isArray(chunks) || chunks.length === 0) return "";
    return (chunks as { text: string }[])
      .slice(0, 20)
      .map((c) => c.text)
      .join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  let body: {
    widgetId?: string;
    message?: string;
    history?: { role: string; text: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { widgetId, message, history = [] } = body;
  if (!widgetId || !message) {
    return NextResponse.json({ error: "Missing widgetId or message" }, { status: 400 });
  }

  try {
    const widget = await convexQuery("widgets:getPublicConfig", { id: widgetId });
    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    const model = (widget as any).config?.aiModel || DEFAULT_MODEL;
    const kbId = (widget as any).knowledgeBaseId;
    const botName = (widget as any).theme?.botName || "AI Assistant";
    const customPrompt = (widget as any).config?.systemPrompt;
    const kbContext = kbId ? await fetchKbContext(kbId) : "";

    const contents = history.map((h) => ({
      role: h.role === "bot" ? "model" : "user",
      parts: [{ text: h.text }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: resolveTextSystemInstruction({
          botName,
          customPrompt,
          knowledgeBaseContext: kbContext,
        }),
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const output = response.text || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ output });
  } catch (e: unknown) {
    console.error("Chat API error:", e);
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
