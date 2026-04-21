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
import { useToast } from '@/hooks/use-toast';
import { AgentAudioVisualizerAura } from '@/components/agent-audio-visualizer-aura';
import type { AgentVisualizerState } from '@/hooks/use-agent-audio-visualizer-aura';
import { useVoiceAgent, type ConnectionState } from '@/hooks/use-voice-agent';

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
      aiModel?: string;
      systemPrompt?: string;
    };
    knowledgeBaseId?: string;
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

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoadingText, setIsLoadingText] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recordVisitorMessage = useMutation(api.conversations.recordVisitorMessage);
  const recordAgentMessage = useMutation(api.conversations.recordAgentMessage);

  const [geminiApiKey, setGeminiApiKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/gemini-session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.apiKey) setGeminiApiKey(data.apiKey);
      })
      .catch(() => {});
  }, []);

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

  const themeVars = React.useMemo(() => {
    const isDark = theme.colorMode === 'dark';
    return {
      // Isolate Shadcn UI variables so they use the widget's theme
      '--background': theme.chatBackgroundColor || theme.secondaryColor || (isDark ? '#1F2937' : '#FFFFFF'),
      '--foreground': theme.botTextColor || (isDark ? '#F9FAFB' : '#111827'),
      '--card': theme.chatBackgroundColor || theme.secondaryColor || (isDark ? '#1F2937' : '#FFFFFF'),
      '--card-foreground': theme.botTextColor || (isDark ? '#F9FAFB' : '#111827'),
      '--muted': isDark ? '#374151' : '#F3F4F6',
      '--muted-foreground': isDark ? '#9CA3AF' : '#6B7280',
      '--border': theme.inputBorderColor || (isDark ? '#374151' : '#E5E7EB'),
      '--input': theme.inputBgColor || (isDark ? '#374151' : '#FFFFFF'),
      '--primary': theme.accentColor || theme.primaryColor || '#10b981',
      '--primary-foreground': theme.userTextColor || '#FFFFFF',
      '--ring': theme.accentColor || theme.primaryColor || '#10b981',

      // Original Widget custom variables
      '--widget-bg': theme.chatBackgroundColor || theme.secondaryColor || (isDark ? '#1F2937' : '#FFFFFF'),
      '--widget-user-bg': theme.accentColor || theme.primaryColor || '#10b981',
      '--widget-user-text': theme.userTextColor || '#FFFFFF',
      '--widget-bot-bg': theme.botBubbleBgColor || (isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)'),
      '--widget-bot-text': theme.botTextColor || 'inherit',
      '--widget-input-bg': theme.inputBgColor || (isDark ? '#1F2937' : '#FFFFFF'),
      '--widget-input-border': theme.inputBorderColor || (isDark ? '#374151' : '#E5E7EB'),
      '--widget-input-text': theme.inputTextColor || 'inherit',
      '--widget-header-text': theme.headerTextColor || theme.headerTitleColor || 'var(--foreground)',
      '--widget-accent': theme.accentColor || theme.primaryColor || '#10b981',
      '--widget-accent-text': theme.userTextColor || '#FFFFFF',
      '--widget-tabs-bg': isDark ? '#374151' : '#F3F4F6',
      '--widget-tabs-text': isDark ? '#D1D5DB' : '#4B5563',
      '--widget-tabs-active-bg': theme.chatBackgroundColor || theme.secondaryColor || (isDark ? '#1F2937' : '#FFFFFF'),
      '--widget-tabs-active-text': theme.headerTextColor || theme.botTextColor || (isDark ? '#F9FAFB' : '#111827'),
      '--widget-avatar-bg': isDark ? '#374151' : '#F3F4F6',
      '--widget-avatar-icon': isDark ? '#9CA3AF' : '#6B7280',
    } as React.CSSProperties;
  }, [theme]);

  const { voiceState, timedOut, connectVoice, disconnectVoice, isVoiceActive } = useVoiceAgent({
    widgetId: widgetConfig.id,
    sessionId,
    visitorPageUrl,
    theme,
    recordingRetentionDays: widgetConfig.config?.recordingRetentionDays,
    systemPrompt: widgetConfig.config?.systemPrompt,
    apiKey: geminiApiKey,
    recordVisitorMessage: async (args) => { void recordVisitorMessage(args as Parameters<typeof recordVisitorMessage>[0]); },
    recordAgentMessage: async (args) => { void recordAgentMessage(args as Parameters<typeof recordAgentMessage>[0]); },
    toast: (args) => toast(args as Parameters<typeof toast>[0]),
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user', type: 'text' };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoadingText(true);

    void recordVisitorMessage({
      widgetId: widgetConfig.id as Parameters<typeof recordVisitorMessage>[0]["widgetId"],
      sessionId,
      channel: 'text',
      kind: 'text',
      text: inputValue,
      pageUrl: visitorPageUrl,
    });

    try {
      let output: string;

      if (widgetConfig.webhook_url) {
        const response = await fetch(widgetConfig.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, action: 'sendMessage', chatInput: inputValue }),
        });

        if (!response.ok) throw new Error('Webhook failed');
        const responseData = await response.json();
        output = responseData.output || "Sorry, I didn't understand that.";
      } else {
        const chatHistory = messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'bot',
          text: m.text,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId: widgetConfig.id,
            message: inputValue,
            history: chatHistory,
          }),
        });

        if (!response.ok) throw new Error('Chat API failed');
        const responseData = await response.json();
        output = responseData.output || "Sorry, I didn't understand that.";
      }

      const botMessage: Message = { id: 'bot-' + Date.now().toString(), text: output, sender: 'bot' };
      void recordAgentMessage({
        widgetId: widgetConfig.id as Parameters<typeof recordAgentMessage>[0]["widgetId"],
        sessionId,
        channel: 'text',
        kind: 'text',
        text: output,
        pageUrl: visitorPageUrl,
      });

      setTimeout(() => setMessages((prev) => [...prev, botMessage]), 500);
    } catch {
      setMessages((prev) => [...prev, { id: 'error-' + Date.now().toString(), text: 'Sorry, something went wrong.', sender: 'bot' }]);
    } finally {
      setIsLoadingText(false);
    }
  };

  return (
    <div className="override-light-mode flex flex-col h-full bg-transparent w-full" style={themeVars}>
      <Card
        className="flex flex-col h-full w-full border border-border shadow-2xl overflow-hidden widget-bg"
        style={{
          borderRadius: theme.borderRadius || `${theme.roundedCorners}px`,
          boxShadow: `0 0 ${theme.shadowIntensity / 5}px rgba(0,0,0,${theme.shadowIntensity / 100})`,
          fontFamily: theme.fontFamily,
          colorScheme: theme.colorMode === 'dark' ? 'dark' : 'light',
        }}
      >
        <CardHeader className="flex-shrink-0 p-4 border-b border-border/10">
          <div className="flex items-center gap-3">
            {theme.logoUrl ? (
              <Image src={theme.logoUrl} alt="Logo" width={40} height={40} className="h-10 w-10 object-cover rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white widget-accent">
                <Bot size={24} />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg leading-tight widget-header-text">{theme.headerTitle || "AI Assistant"}</h3>
              <p className="text-xs text-muted-foreground" style={{ color: theme.headerSubtextColor }}>{theme.headerSubtitle || theme.headerSubtext || "Online"}</p>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="text" className="flex-grow flex flex-col min-h-0 w-full" onValueChange={(val) => {
          if (val === 'text' && voiceState !== 'disconnected') disconnectVoice();
        }}>
          <div className="px-4 pt-4 shrink-0">
            <TabsList className="w-full grid grid-cols-2 rounded-xl p-1 widget-tabs-bg">
              <TabsTrigger value="text" className="widget-tabs-trigger rounded-lg text-xs font-medium transition-all">
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Text Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="widget-tabs-trigger rounded-lg text-xs font-medium transition-all">
                <Mic className="w-3.5 h-3.5 mr-2" /> Voice Call
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="text" className="flex-grow flex flex-col min-h-0 outline-none m-0 data-[state=active]:flex">
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 scrollable-content">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center widget-avatar-bg">
                      <Bot size={16} className="widget-avatar-icon" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'widget-user-message' : 'widget-bot-message'}`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoadingText && (
                <div className="flex items-start gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center widget-avatar-bg">
                    <Bot size={16} className="widget-avatar-icon" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 widget-bot-message">
                    <div className="flex gap-1 opacity-60">
                      <div className="h-1.5 w-1.5 rounded-full animate-bounce bg-current" />
                      <div className="h-1.5 w-1.5 rounded-full animate-bounce delay-150 bg-current" />
                      <div className="h-1.5 w-1.5 rounded-full animate-bounce delay-300 bg-current" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-3 shrink-0 border-t border-border/10">
              <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 border widget-input-area">
                <Input
                  type="text"
                  placeholder={theme.placeholderText || "Type a message..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 !bg-transparent border-0 px-0 h-9 outline-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:!bg-transparent placeholder:text-inherit placeholder:opacity-60"
                  style={{ color: 'inherit', caretColor: 'currentColor' }}
                  disabled={isLoadingText}
                />
                <Button type="submit" size="icon" disabled={isLoadingText || !inputValue.trim()} className="rounded-full h-9 w-9 shrink-0 transition-transform active:scale-95 widget-accent">
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent value="voice" className="flex-grow flex flex-col outline-none m-0 data-[state=active]:flex overflow-hidden relative">
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="h-[300px] w-[300px] rounded-full blur-[80px] widget-accent" />
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 z-10 relative">
              {!isVoiceActive ? (
                <div className="flex flex-col items-center justify-center text-center space-y-8 mt-[-20px]">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full opacity-20 widget-accent" />
                    <div className="h-24 w-24 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md border border-white/10" style={{ backgroundColor: 'var(--widget-accent)20' }}>
                      <Mic size={36} className="widget-accent" />
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
                    className="rounded-full h-12 px-8 font-bold shadow-lg transition-transform active:scale-95 widget-accent"
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
