"use client";

import * as React from "react";
import { GoogleGenAI, Modality, Type, type LiveServerMessage, type Tool } from "@google/genai";
import { AudioPlayer, AudioProcessor } from "@/lib/agent-live-audio";
import { uploadFiles } from "@/lib/uploadthing";
import confetti from "canvas-confetti";
import type { WidgetTheme } from "@/lib/themes";

const AGENT_TIMEOUT_MS = 20_000;
const GEMINI_MODEL = "gemini-3.1-flash-live-preview";
const GEMINI_VOICE = "Zephyr";
const RECORDING_RETENTION_DAYS = 60;

const SYSTEM_INSTRUCTION = `
You are a helpful virtual assistant for our website.
Your primary task is to answer user questions cheerfully and conversationally.
Speak in a warm, natural accent and keep responses brief.
When the user says goodbye, thanks you and indicates they're done, or clearly wants to end the conversation, use the endSession tool to close the session.
`.trim();

const GEMINI_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "endSession",
        description: "End the voice session. Use when the user says goodbye or the conversation is complete.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "celebrate",
        description: "Trigger a visual celebration (confetti) when the user achieves a goal, completes a task, or expresses great satisfaction.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
    ],
  },
];

export type ConnectionState = "disconnected" | "connecting" | "connected" | "listening" | "speaking" | "thinking";

type LiveSession = {
  close: () => void;
  sendRealtimeInput: (payload: { audio?: { data: string; mimeType: string }; text?: string }) => void;
  sendToolResponse: (payload: { functionResponses: Array<{ id?: string; name?: string; response: Record<string, unknown> }> }) => void;
};

interface UseVoiceAgentOptions {
  widgetId: string;
  sessionId: string;
  visitorPageUrl: string | undefined;
  theme: WidgetTheme;
  recordingRetentionDays?: number;
  apiKey: string | null;
  recordVisitorMessage: (args: { widgetId: string; sessionId: string; channel: string; kind: string; text: string; pageUrl?: string }) => Promise<unknown>;
  recordAgentMessage: (args: { widgetId: string; sessionId: string; channel: string; kind: string; text: string; pageUrl?: string }) => Promise<unknown>;
  toast: (args: { variant: string; title: string; description: string }) => void;
}

export function useVoiceAgent({
  widgetId,
  sessionId,
  visitorPageUrl,
  theme,
  recordingRetentionDays,
  apiKey,
  recordVisitorMessage,
  recordAgentMessage,
  toast,
}: UseVoiceAgentOptions) {
  const [voiceState, setVoiceState] = React.useState<ConnectionState>("disconnected");
  const [timedOut, setTimedOut] = React.useState(false);

  const sessionRef = React.useRef<LiveSession | null>(null);
  const audioProcessorRef = React.useRef<AudioProcessor | null>(null);
  const audioPlayerRef = React.useRef<AudioPlayer | null>(null);
  const allowMicStreamingRef = React.useRef(false);
  const callRecorderRef = React.useRef<MediaRecorder | null>(null);
  const callChunksRef = React.useRef<Blob[]>([]);
  const callStartedAtRef = React.useRef<number | null>(null);

  const triggerCelebration = React.useCallback(() => {
    const style = theme.successConfetti || "small-burst";

    if (style === "small-burst") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme.accentColor || "#3b8332", "#ffffff", "#5D5DDF"],
      });
    } else if (style === "firework") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else if (style === "golden-rain") {
      const end = Date.now() + 3 * 1000;
      const colors = ["#ffd700", "#ffa500", "#ff8c00"];
      (function frame() {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [theme.accentColor, theme.successConfetti]);

  const flushRecordedCall = React.useCallback(async () => {
    const chunks = callChunksRef.current;
    const startedAt = callStartedAtRef.current;
    callChunksRef.current = [];
    callStartedAtRef.current = null;

    if (!chunks.length || !startedAt) return;

    const audioBlob = new Blob(chunks, { type: callRecorderRef.current?.mimeType || "audio/webm" });
    const durationMs = Math.max(Date.now() - startedAt, 0);
    const retention = recordingRetentionDays ?? RECORDING_RETENTION_DAYS;
    const expiresAt = Date.now() + retention * 24 * 60 * 60 * 1000;

    let uploadthingFileKey: string | undefined;
    let uploadthingUrl: string | undefined;

    try {
      const extension = audioBlob.type.includes("ogg") ? "ogg" : audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const file = new File([audioBlob], `voice-call-${sessionId}-${Date.now()}.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });

      const uploaded = await uploadFiles("voiceRecording", {
        files: [file],
        input: { widgetId, sessionId },
      });

      uploadthingFileKey = uploaded?.[0]?.key ?? undefined;
      uploadthingUrl = uploaded?.[0]?.ufsUrl ?? undefined;
    } catch (error) {
      console.error("Failed to upload call recording:", error);
    }

    void recordAgentMessage({
      widgetId,
      sessionId,
      channel: "voice",
      kind: "audio",
      text: `[Voice recording – ${Math.round(durationMs / 1000)}s]`,
      pageUrl: visitorPageUrl,
    });

    return { uploadthingFileKey, uploadthingUrl, expiresAt, durationMs };
  }, [widgetId, sessionId, visitorPageUrl, recordingRetentionDays, recordAgentMessage]);

  const stopCallRecording = React.useCallback(() => {
    if (callRecorderRef.current && callRecorderRef.current.state !== "inactive") {
      callRecorderRef.current.stop();
    }
  }, []);

  const startCallRecording = React.useCallback((stream: MediaStream | null | undefined) => {
    if (!stream) return;
    try {
      const recorder = new MediaRecorder(stream);
      callChunksRef.current = [];
      callStartedAtRef.current = Date.now();
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) callChunksRef.current.push(e.data);
      };
      recorder.start(1000);
      callRecorderRef.current = recorder;
    } catch (error) {
      console.error("Failed to start call recording:", error);
    }
  }, []);

  const cleanupVoiceResources = React.useCallback(() => {
    allowMicStreamingRef.current = false;
    audioProcessorRef.current?.stop();
    audioPlayerRef.current?.stop();
    stopCallRecording();
    void flushRecordedCall();
  }, [stopCallRecording, flushRecordedCall]);

  const disconnectVoice = React.useCallback(() => {
    setVoiceState("disconnected");
    sessionRef.current?.close();
    cleanupVoiceResources();
  }, [cleanupVoiceResources]);

  const cleanupDisconnectedSession = React.useCallback(() => {
    setVoiceState("disconnected");
    cleanupVoiceResources();
  }, [cleanupVoiceResources]);

  const connectVoice = React.useCallback(async () => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "API Key Missing", description: "Gemini API key is not configured." });
      return;
    }

    try {
      setVoiceState("connecting");
      setTimedOut(false);

      const ai = new GoogleGenAI({ apiKey });
      const sharedContext = new AudioContext({ sampleRate: 16000 });
      audioProcessorRef.current = new AudioProcessor(sharedContext);

      const sessionPromise = ai.live.connect({
        model: GEMINI_MODEL,
        callbacks: {
          onopen: async () => {
            setVoiceState("connected");
            try {
              allowMicStreamingRef.current = true;
              await audioProcessorRef.current?.start((base64Data) => {
                const session = sessionRef.current;
                if (!session || !allowMicStreamingRef.current) return;
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" },
                });
              });

              audioPlayerRef.current = new AudioPlayer(sharedContext, audioProcessorRef.current?.getDestination() || undefined);
              startCallRecording(audioProcessorRef.current?.getCombinedStream());
              setVoiceState("listening");

              sessionPromise.then((session) => {
                setTimeout(() => {
                  session.sendRealtimeInput({
                    text: `Hello! ${theme.bubbleMessage || "I'm your AI assistant."} How can I help you today?`,
                  });
                }, 500);
              });
            } catch (error) {
              toast({ variant: "destructive", title: "Mic Error", description: "Microphone failed to start." });
              disconnectVoice();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              allowMicStreamingRef.current = false;
              setVoiceState("speaking");
              await audioPlayerRef.current?.playChunk(base64Audio);
            }

            if (message.serverContent?.inputTranscription?.text) {
              setVoiceState("thinking");
              void recordVisitorMessage({
                widgetId,
                sessionId,
                channel: "voice",
                kind: "text",
                text: message.serverContent.inputTranscription.text,
                pageUrl: visitorPageUrl,
              });
            }

            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const textPart = modelParts.find((p) => p.text);
              if (textPart?.text) {
                void recordAgentMessage({
                  widgetId,
                  sessionId,
                  channel: "voice",
                  kind: "text",
                  text: textPart.text,
                  pageUrl: visitorPageUrl,
                });
              }
            }

            if (message.toolCall?.functionCalls) {
              for (const call of (message.toolCall.functionCalls ?? []) as Array<{ id?: string; name?: string }>) {
                if (call.name === "endSession") {
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{ id: call.id, name: call.name, response: { success: true } }],
                  });
                  disconnectVoice();
                }
                if (call.name === "celebrate") {
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{ id: call.id, name: call.name, response: { success: true } }],
                  });
                  triggerCelebration();
                }
              }
            }
            if (message.serverContent?.interrupted || message.serverContent?.turnComplete) {
              allowMicStreamingRef.current = true;
              if (message.serverContent?.interrupted) audioPlayerRef.current?.stop();
              setVoiceState("listening");
            }
          },
          onerror: () => {
            toast({ variant: "destructive", title: "Live Error", description: "Gemini connection error." });
            cleanupDisconnectedSession();
          },
          onclose: () => {
            cleanupDisconnectedSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: GEMINI_TOOLS,
        },
      });

      sessionRef.current = (await sessionPromise) as LiveSession;
    } catch {
      toast({ variant: "destructive", title: "Connection Failed", description: "Could not establish voice connection." });
      cleanupDisconnectedSession();
    }
  }, [apiKey, cleanupDisconnectedSession, disconnectVoice, startCallRecording, theme.bubbleMessage, toast, triggerCelebration, widgetId, sessionId, visitorPageUrl, recordVisitorMessage, recordAgentMessage]);

  React.useEffect(() => {
    if (voiceState === "disconnected") return;
    const timer = setTimeout(() => setTimedOut(true), AGENT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [voiceState]);

  React.useEffect(() => () => disconnectVoice(), [disconnectVoice]);

  return {
    voiceState,
    timedOut,
    connectVoice,
    disconnectVoice,
    isVoiceActive: voiceState !== "disconnected" && voiceState !== "connecting",
  };
}
