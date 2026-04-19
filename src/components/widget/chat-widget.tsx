'use client';
import * as React from 'react';
import { useMutation } from 'convex/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Paperclip, SendHorizonal, Mic, MessageSquare, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from 'convex/_generated/api';
import type { WidgetTheme } from '@/lib/themes';
import { defaultTheme } from '@/lib/themes';
import { uploadFiles } from '@/lib/uploadthing';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

// Voice Agent Imports
import { GoogleGenAI, Modality, Type, type LiveServerMessage, type Tool, type Content } from '@google/genai';
import { AgentAudioVisualizerAura } from '@/components/agent-audio-visualizer-aura';
import type { AgentVisualizerState } from '@/hooks/use-agent-audio-visualizer-aura';
import { AudioPlayer, AudioProcessor } from '@/lib/agent-live-audio';

interface ChatWidgetProps {
  widgetConfig: {
    id: string;
    webhook_url: string;
    type?: 'text' | 'voice';
    theme?: Partial<WidgetTheme>;
    brand?: {
      panelColor?: string;
      headerTitle?: string;
      welcomeMessage?: string;
    };
    config?: {
      defaultLanguage?: 'EN' | 'ES';
      recordingRetentionDays?: number;
    };
  };
  sessionId: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'audio';
  audioUrl?: string;
  durationMs?: number;
}

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

type ConnectionState = "disconnected" | "connecting" | "connected" | "listening" | "speaking" | "thinking";

type LiveSession = {
  close: () => void;
  sendRealtimeInput: (payload: { audio?: { data: string; mimeType: string }; text?: string }) => void;
  sendToolResponse: (payload: { functionResponses: Array<{ id?: string; name?: string; response: Record<string, unknown> }> }) => void;
};

function stateToVisualizerState(state: ConnectionState): AgentVisualizerState {
  if (state === "disconnected") return "disconnected";
  if (state === "connecting") return "connecting";
  if (state === "listening") return "listening";
  if (state === "speaking") return "speaking";
  if (state === "thinking") return "thinking";
  return "idle";
}

export function ChatWidgetComponent({
  widgetConfig,
  sessionId,
}: ChatWidgetProps) {
  const { toast } = useToast();
  
  // Text Chat State
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoadingText, setIsLoadingText] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recordVisitorMessage = useMutation(api.conversations.recordVisitorMessage);
  const recordAgentMessage = useMutation(api.conversations.recordAgentMessage);
  
  // Voice Agent State
  const [voiceState, setVoiceState] = React.useState<ConnectionState>("disconnected");
  const [timedOut, setTimedOut] = React.useState(false);
  const sessionRef = React.useRef<LiveSession | null>(null);
  const audioProcessorRef = React.useRef<AudioProcessor | null>(null);
  const audioPlayerRef = React.useRef<AudioPlayer | null>(null);
  const allowMicStreamingRef = React.useRef(false);
  const callRecorderRef = React.useRef<MediaRecorder | null>(null);
  const callChunksRef = React.useRef<Blob[]>([]);
  const callStartedAtRef = React.useRef<number | null>(null);
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // Theme State
  const [activeMode, setActiveMode] = React.useState<'light' | 'dark'>(
    widgetConfig.theme?.colorMode === 'dark' ? 'dark' : 'light'
  );
  
  const visitorPageUrl = React.useMemo(() => typeof document !== 'undefined' ? document.referrer || undefined : undefined, []);

  React.useEffect(() => {
    const configMode = widgetConfig.theme?.colorMode || 'light';
    if (configMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setActiveMode(mediaQuery.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => setActiveMode(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setActiveMode(configMode as 'light' | 'dark');
    }
  }, [widgetConfig.theme?.colorMode]);

  const theme = React.useMemo(() => {
    const baseTheme = { ...defaultTheme, ...widgetConfig.theme };
    if (activeMode === 'dark') {
      return {
        ...baseTheme,
        primaryColor: widgetConfig.theme?.darkPrimaryColor || baseTheme.primaryColor,
        secondaryColor: widgetConfig.theme?.darkSecondaryColor || '#1F2937',
        colorMode: 'dark' as const,
      };
    }
    return { ...baseTheme, colorMode: 'light' as const };
  }, [widgetConfig.theme, activeMode]);

  React.useEffect(() => {
    const welcomeMessage = theme.bubbleMessage || widgetConfig.brand?.welcomeMessage;
    if (welcomeMessage) {
      setMessages([{ id: 'welcome', text: welcomeMessage, sender: 'bot' }]);
    }
  }, [theme.bubbleMessage, widgetConfig.brand?.welcomeMessage]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- VOICE AGENT LOGIC ---
  const triggerCelebration = React.useCallback(() => {
    const style = theme.successConfetti || 'small-burst';
    
    if (style === 'small-burst') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme.accentColor || '#3CB993', '#ffffff', '#5D5DDF']
      });
    } else if (style === 'firework') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else if (style === 'golden-rain') {
      const end = Date.now() + (3 * 1000);
      const colors = ['#ffd700', '#ffa500', '#ff8c00'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [theme.accentColor, theme.successConfetti]);

  const flushRecordedCall = React.useCallback(async () => {
    const chunks = callChunksRef.current;
    const startedAt = callStartedAtRef.current;

    callChunksRef.current = [];
    callStartedAtRef.current = null;

    if (!chunks.length || !startedAt) {
      return;
    }

    const audioBlob = new Blob(chunks, { type: callRecorderRef.current?.mimeType || 'audio/webm' });
    const durationMs = Math.max(Date.now() - startedAt, 0);
    
    const retentionDays = widgetConfig.config?.recordingRetentionDays ?? RECORDING_RETENTION_DAYS;
    const expiresAt = Date.now() + retentionDays * 24 * 60 * 60 * 1000;

    let uploadthingFileKey: string | undefined;
    let uploadthingUrl: string | undefined;

    try {
      const extension = audioBlob.type.includes('ogg')
        ? 'ogg'
        : audioBlob.type.includes('mp4')
          ? 'm4a'
          : 'webm';

      const file = new File([audioBlob], `voice-call-${sessionId}-${Date.now()}.${extension}`, {
        type: audioBlob.type || 'audio/webm',
      });

      const uploaded = await uploadFiles('voiceRecording', {
        files: [file],
        input: {
          widgetId: String(widgetConfig.id),
          sessionId,
        },
      });

      const uploadedFile = uploaded[0];
      if (uploadedFile) {
        uploadthingFileKey = uploadedFile.key ?? undefined;
        uploadthingUrl = uploadedFile.url;
      }
    } catch (error) {
      console.error('Failed to upload call recording:', error);
    }

    await recordVisitorMessage({
      widgetId: widgetConfig.id as any,
      sessionId,
      channel: 'voice',
      kind: 'audio',
      text: 'Voice call recording',
      pageUrl: visitorPageUrl,
      uploadthingFileKey,
      uploadthingUrl,
      expiresAt,
      durationMs,
    });
  }, [recordVisitorMessage, sessionId, visitorPageUrl, widgetConfig.id]);

  const stopCallRecording = React.useCallback(() => {
    const recorder = callRecorderRef.current;
    if (!recorder) {
      return;
    }

    callRecorderRef.current = null;

    if (recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      void flushRecordedCall();
    }
  }, [flushRecordedCall]);

  const startCallRecording = React.useCallback((stream: MediaStream | null | undefined) => {
    if (!stream || typeof MediaRecorder === 'undefined') {
      return;
    }

    try {
      callChunksRef.current = [];
      callStartedAtRef.current = Date.now();
      const recorder = new MediaRecorder(stream);
      callRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          callChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        void flushRecordedCall();
      };

      recorder.start();
    } catch (error) {
      console.error('Failed to start call recording:', error);
    }
  }, [flushRecordedCall]);

  const cleanupVoiceResources = React.useCallback(() => {
    allowMicStreamingRef.current = false;
    stopCallRecording();
    audioProcessorRef.current?.stop();
    audioProcessorRef.current = null;
    audioPlayerRef.current?.stop();
    audioPlayerRef.current = null;
    setVoiceState("disconnected");
    setTimedOut(false);
  }, [stopCallRecording]);

  const disconnectVoice = React.useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    cleanupVoiceResources();
    session?.close();
  }, [cleanupVoiceResources]);

  const cleanupDisconnectedSession = React.useCallback(() => {
    sessionRef.current = null;
    cleanupVoiceResources();
  }, [cleanupVoiceResources]);

  const connectVoice = React.useCallback(async () => {
    if (!geminiApiKey) {
      toast({ variant: 'destructive', title: 'API Key Missing', description: "NEXT_PUBLIC_GEMINI_API_KEY is not set." });
      return;
    }

    try {
      setVoiceState("connecting");
      setTimedOut(false);

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      // Use a single AudioContext for both capture and playback to allow mixing/recording
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

              // Now that processor is started, we have a destination for mixing
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
              toast({ variant: 'destructive', title: 'Mic Error', description: "Microphone failed to start." });
              disconnectVoice();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Playback
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              allowMicStreamingRef.current = false;
              setVoiceState("speaking");
              await audioPlayerRef.current?.playChunk(base64Audio);
            }

            // Handle Transcripts
            if (message.serverContent?.inputTranscription?.text) {
              setVoiceState("thinking");
              void recordVisitorMessage({
                widgetId: widgetConfig.id as any,
                sessionId,
                channel: 'voice',
                kind: 'text',
                text: message.serverContent.inputTranscription.text,
                pageUrl: visitorPageUrl,
              });
            }

            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const textPart = modelParts.find(p => p.text);
              if (textPart?.text) {
                void recordAgentMessage({
                  widgetId: widgetConfig.id as any,
                  sessionId,
                  channel: 'voice',
                  kind: 'text',
                  text: textPart.text,
                  pageUrl: visitorPageUrl,
                });
              }
            }

            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls as any[]) {
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
          onerror: (error: unknown) => {
            toast({ variant: 'destructive', title: 'Live Error', description: "Gemini connection error." });
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
    } catch (error) {
      toast({ variant: 'destructive', title: 'Connection Failed', description: "Could not establish voice connection." });
      cleanupDisconnectedSession();
    }
  }, [cleanupDisconnectedSession, disconnectVoice, geminiApiKey, startCallRecording, theme.bubbleMessage, toast]);

  React.useEffect(() => {
    if (voiceState === "disconnected") return;
    const timer = setTimeout(() => setTimedOut(true), AGENT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [voiceState]);

  React.useEffect(() => () => disconnectVoice(), [disconnectVoice]);

  // --- TEXT CHAT LOGIC ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user', type: 'text' };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoadingText(true);

    void recordVisitorMessage({
      widgetId: widgetConfig.id as any,
      sessionId,
      channel: 'text',
      kind: 'text',
      text: inputValue,
      pageUrl: visitorPageUrl,
    });

    try {
      const response = await fetch(widgetConfig.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'sendMessage', chatInput: inputValue }),
      });

      if (!response.ok) throw new Error('Webhook failed');
      const responseData = await response.json();
      const output = responseData.output || "Sorry, I didn't understand that.";

      const botMessage: Message = { id: 'bot-' + Date.now().toString(), text: output, sender: 'bot' };
      void recordAgentMessage({
        widgetId: widgetConfig.id as any,
        sessionId,
        channel: 'text',
        kind: 'text',
        text: output,
        pageUrl: visitorPageUrl,
      });

      setTimeout(() => setMessages((prev) => [...prev, botMessage]), 500);
    } catch (error) {
      setMessages((prev) => [...prev, { id: 'error-' + Date.now().toString(), text: 'Sorry, something went wrong.', sender: 'bot' }]);
    } finally {
      setIsLoadingText(false);
    }
  };

  const widgetStyle: React.CSSProperties = {
    backgroundColor: theme.chatBackgroundColor || theme.secondaryColor,
    borderRadius: theme.borderRadius || `${theme.roundedCorners}px`,
    boxShadow: `0 0 ${theme.shadowIntensity / 5}px rgba(0,0,0,${theme.shadowIntensity / 100})`,
    fontFamily: theme.fontFamily,
    colorScheme: theme.colorMode === 'dark' ? 'dark' : 'light',
  };

  const userMessageStyle: React.CSSProperties = {
    backgroundColor: theme.accentColor || theme.primaryColor,
    color: theme.userTextColor || '#FFFFFF',
  };

  const botMessageStyle: React.CSSProperties = {
    backgroundColor: theme.botBubbleBgColor || 'rgba(var(--muted), 0.5)',
    color: theme.botTextColor || 'inherit',
  };

  const inputAreaStyle: React.CSSProperties = {
    backgroundColor: theme.inputBgColor || 'rgba(var(--background), 0.5)',
    borderColor: theme.inputBorderColor || 'rgba(var(--border), 0.4)',
    color: theme.inputTextColor || 'inherit',
  };

  const isVoiceActive = voiceState !== "disconnected" && voiceState !== "connecting";

  return (
    <div className="flex flex-col h-full bg-transparent w-full">
      <Card className="flex flex-col h-full w-full border border-border shadow-2xl overflow-hidden" style={widgetStyle}>
        
        {/* Header */}
        <CardHeader className="flex-shrink-0 p-4 border-b border-border/10">
          <div className="flex items-center gap-3">
            {theme.logoUrl ? (
              <Image src={theme.logoUrl} alt="Logo" width={40} height={40} className="h-10 w-10 object-cover rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme.accentColor || theme.primaryColor }}>
                <Bot size={24} />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg leading-tight" style={{ color: theme.headerTextColor || theme.headerTitleColor }}>{theme.headerTitle || "AI Assistant"}</h3>
              <p className="text-xs text-muted-foreground" style={{ color: theme.headerSubtextColor }}>{theme.headerSubtitle || theme.headerSubtext || "Online"}</p>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="text" className="flex-grow flex flex-col min-h-0 w-full" onValueChange={(val) => {
          if (val === 'text' && voiceState !== 'disconnected') disconnectVoice();
        }}>
          
          {/* Tabs Navigation */}
          <div className="px-4 pt-4 shrink-0">
            <TabsList className="w-full grid grid-cols-2 bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="text" className="rounded-lg text-xs font-medium data-[state=active]:shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Text Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="rounded-lg text-xs font-medium data-[state=active]:shadow-sm">
                <Mic className="w-3.5 h-3.5 mr-2" /> Voice Call
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TEXT TAB */}
          <TabsContent value="text" className="flex-grow flex flex-col min-h-0 outline-none m-0 data-[state=active]:flex">
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                      <Bot size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm`}
                    style={msg.sender === 'user' ? userMessageStyle : botMessageStyle}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoadingText && (
                <div className="flex items-start gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} className="text-muted-foreground" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted/50">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                      <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
                      <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-3 shrink-0 border-t border-border/10">
              <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 border" style={inputAreaStyle}>
                <Input
                  type="text"
                  placeholder={theme.placeholderText || "Type a message..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9"
                  disabled={isLoadingText}
                />
                <Button type="submit" size="icon" disabled={isLoadingText || !inputValue.trim()} className="rounded-full h-9 w-9 shrink-0 transition-transform active:scale-95" style={{ backgroundColor: theme.accentColor || theme.primaryColor, color: theme.userTextColor || '#fff' }}>
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          {/* VOICE TAB */}
          <TabsContent value="voice" className="flex-grow flex flex-col outline-none m-0 data-[state=active]:flex overflow-hidden relative">
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="h-[300px] w-[300px] rounded-full blur-[80px]" style={{ backgroundColor: theme.accentColor || theme.primaryColor }} />
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center p-6 z-10 relative">
              {!isVoiceActive ? (
                <div className="flex flex-col items-center justify-center text-center space-y-8 mt-[-20px]">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ backgroundColor: theme.accentColor || theme.primaryColor }} />
                    <div className="h-24 w-24 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md border border-white/10" style={{ backgroundColor: `${theme.accentColor || theme.primaryColor}20` }}>
                      <Mic size={36} style={{ color: theme.accentColor || theme.primaryColor }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Live Voice Agent</h2>
                    <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                      Tap connect to speak naturally with {theme.botName || "our AI Assistant"}.
                    </p>
                  </div>

                  <Button
                    disabled={voiceState === "connecting"}
                    onClick={connectVoice}
                    className="rounded-full h-12 px-8 font-bold shadow-lg transition-transform active:scale-95"
                    style={{ backgroundColor: theme.accentColor || theme.primaryColor, color: theme.userTextColor || '#fff' }}
                  >
                    {voiceState === "connecting" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Connect to Call</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full space-y-12">
                  {timedOut ? (
                    <div className="flex flex-col items-center gap-3 text-center text-amber-500">
                      <AlertCircle size={32} />
                      <span className="text-sm font-bold uppercase tracking-widest">Agent Not Responding</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center relative w-full h-[250px]">
                      <AgentAudioVisualizerAura
                        size="lg"
                        color={(theme.accentColor || theme.primaryColor) as `#${string}`}
                        state={stateToVisualizerState(voiceState)}
                        analyserNode={null}
                        themeMode={theme.colorMode as 'light' | 'dark'}
                        className="absolute inset-0 m-auto"
                      />
                      <Badge variant="outline" className="absolute bottom-[-30px] bg-background/50 backdrop-blur-md tracking-widest uppercase text-[10px] font-bold px-3 py-1">
                        {voiceState}
                      </Badge>
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    onClick={disconnectVoice}
                    className="rounded-full h-12 px-8 font-bold mt-auto shadow-lg"
                  >
                    End Call
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
