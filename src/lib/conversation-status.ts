export type ConversationStatus =
  | "active"
  | "ongoing"
  | "resolved"
  | "escalated";

export type ConversationResolutionReason =
  | "manual"
  | "auto_inactive"
  | "auto_greeting"
  | null;

export type ConversationStatusInput = {
  status: ConversationStatus;
  lastMessageAt: number;
  lastMessagePreview: string;
  messageCount: number;
  now?: number;
};

export const GREETING_ONLY_RESOLVE_MS = 2 * 60 * 1000;
export const INACTIVE_RESOLVE_MS = 15 * 60 * 1000;

const greetingOnlyPattern =
  /^(hi|hello|hey|yo|hola|howdy|sup|good morning|good afternoon|good evening|hello there|hey there)[!.?]*$/i;

function normalizePreview(preview: string) {
  return preview.trim().replace(/\s+/g, " ");
}

export function isGreetingOnlyPreview(preview: string) {
  const normalizedPreview = normalizePreview(preview);
  if (!normalizedPreview || normalizedPreview.length > 40) {
    return false;
  }

  return greetingOnlyPattern.test(normalizedPreview);
}

export function getEffectiveConversationState({
  status,
  lastMessageAt,
  lastMessagePreview,
  messageCount,
  now = Date.now(),
}: ConversationStatusInput): {
  status: ConversationStatus;
  resolutionReason: ConversationResolutionReason;
} {
  if (status === "resolved") {
    return { status, resolutionReason: "manual" };
  }

  if (status === "escalated") {
    return { status, resolutionReason: null };
  }

  const inactiveForMs = Math.max(now - lastMessageAt, 0);

  if (
    status === "active" &&
    messageCount <= 1 &&
    isGreetingOnlyPreview(lastMessagePreview) &&
    inactiveForMs >= GREETING_ONLY_RESOLVE_MS
  ) {
    return { status: "resolved", resolutionReason: "auto_greeting" };
  }

  if (inactiveForMs >= INACTIVE_RESOLVE_MS) {
    return { status: "resolved", resolutionReason: "auto_inactive" };
  }

  return { status, resolutionReason: null };
}
