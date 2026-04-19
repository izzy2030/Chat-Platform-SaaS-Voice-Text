import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured on server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}
