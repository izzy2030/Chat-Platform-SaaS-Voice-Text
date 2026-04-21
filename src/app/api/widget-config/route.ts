import { NextRequest, NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

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

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Missing widget id" }, { status: 400 });
  }

  try {
    const raw = await convexQuery("widgets:getPublicConfig", { id });
    if (!raw) {
      return NextResponse.json({ message: "Widget not found" }, { status: 404 });
    }
    const w = raw as Record<string, unknown>;
    const widget = {
      id: w.id,
      webhook_url: w.webhookUrl || "",
      type: w.type,
      theme: w.theme,
      brand: w.brand,
      config: w.config,
      knowledgeBaseId: w.knowledgeBaseId,
    };
    return NextResponse.json({ widget });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch widget config";
    return NextResponse.json({ message }, { status: 500 });
  }
}
