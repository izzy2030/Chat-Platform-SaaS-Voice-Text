export const DEFAULT_VOICE_SYSTEM_PROMPT = `
You are a helpful virtual assistant for our website.
Your primary task is to answer user questions cheerfully and conversationally.
Speak in a warm, natural accent and keep responses brief.
When the user says goodbye, thanks you and indicates they're done, or clearly wants to end the conversation, use the endSession tool to close the session.
`.trim();

export function normalizeSystemPrompt(prompt?: string | null) {
  const trimmedPrompt = prompt?.trim();
  return trimmedPrompt ? trimmedPrompt : undefined;
}

export function buildDefaultTextSystemPrompt(botName: string) {
  return [
    `You are ${botName}, a helpful and friendly customer support chatbot.`,
    "Be concise, accurate, and helpful. If you don't know something, say so honestly.",
  ].join("\n\n");
}

export function resolveTextSystemInstruction({
  botName,
  customPrompt,
  knowledgeBaseContext,
}: {
  botName: string;
  customPrompt?: string | null;
  knowledgeBaseContext?: string;
}) {
  const resolvedPrompt =
    normalizeSystemPrompt(customPrompt) ?? buildDefaultTextSystemPrompt(botName);
  const resolvedKnowledgeBaseContext = knowledgeBaseContext?.trim();

  if (!resolvedKnowledgeBaseContext) {
    return resolvedPrompt;
  }

  return [
    resolvedPrompt,
    "Use the following knowledge base context to answer questions. Prioritize this information over general knowledge:",
    resolvedKnowledgeBaseContext,
  ].join("\n\n");
}

export function resolveVoiceSystemInstruction(customPrompt?: string | null) {
  return normalizeSystemPrompt(customPrompt) ?? DEFAULT_VOICE_SYSTEM_PROMPT;
}
