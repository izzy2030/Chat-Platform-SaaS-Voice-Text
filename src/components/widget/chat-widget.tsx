
'use client';
import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Paperclip, SendHorizonal, Mic } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { WidgetTheme } from '@/lib/themes';
import { defaultTheme } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';

interface ChatWidgetProps {
  widgetConfig: {
    id: string;
    webhook_url: string;
    type?: 'text' | 'voice';
    theme?: Partial<WidgetTheme>;
    // Legacy support
    brand?: {
      panelColor?: string;
      headerTitle?: string;
      welcomeMessage?: string;
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
}

export function ChatWidgetComponent({
  widgetConfig,
  sessionId,
}: ChatWidgetProps) {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [activeMode, setActiveMode] = React.useState<'light' | 'dark'>(
    widgetConfig.theme?.colorMode === 'dark' ? 'dark' : 'light'
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // Sync activeMode with config and system preferences
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

  // Listen for manual overrides from the host page
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_CHANGE' && (event.data.mode === 'light' || event.data.mode === 'dark')) {
        setActiveMode(event.data.mode);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const theme = React.useMemo(() => {
    const baseTheme = {
      ...defaultTheme,
      ...widgetConfig.theme
    };

    if (activeMode === 'dark') {
      return {
        ...baseTheme,
        primaryColor: widgetConfig.theme?.darkPrimaryColor || baseTheme.darkPrimaryColor || baseTheme.primaryColor,
        secondaryColor: widgetConfig.theme?.darkSecondaryColor || baseTheme.darkSecondaryColor || '#1F2937',
        accentColor: widgetConfig.theme?.darkAccentColor || baseTheme.darkAccentColor || baseTheme.accentColor,
        borderColor: widgetConfig.theme?.darkBorderColor || baseTheme.darkBorderColor || '#374151',
        colorMode: 'dark' as const,
      };
    }

    return {
      ...baseTheme,
      colorMode: 'light' as const,
    };
  }, [widgetConfig.theme, activeMode]);

  // Signal to the host that we are ready
  React.useEffect(() => {
    window.parent.postMessage('WIDGET_READY', '*');
  }, []);

  // Handle initial message
  React.useEffect(() => {
    const welcomeMessage = theme.bubbleMessage || widgetConfig.brand?.welcomeMessage;
    if (welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          text: welcomeMessage,
          sender: 'bot',
        },
      ]);
    }
  }, [theme.bubbleMessage, widgetConfig.brand?.welcomeMessage]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !window.MediaRecorder) {
        toast({
          variant: 'destructive',
          title: 'Not Supported',
          description: 'Voice recording is not supported in this browser.',
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const userMessage: Message = {
          id: Date.now().toString(),
          text: 'Voice message',
          sender: 'user',
          type: 'audio',
          audioUrl: audioUrl,
        };
        
        setMessages((prev) => [...prev, userMessage]);
        
        // In a real app, you would upload the blob and send the URL to the webhook
        // For now we just simulate it
        await handleVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access your microphone. Please check permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (blob: Blob) => {
    setIsLoading(true);
    try {
      // Convert blob to base64 for simulation if needed, or send as FormData
      // For this prototype, we'll just send a notification to the webhook
      const response = await fetch(widgetConfig.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          action: 'voiceMessage',
          // base64 would go here in a real impl
        }),
      });

      if (!response.ok) throw new Error('Webhook failed');
      const responseData = await response.json();

      const botMessage: Message = {
        id: 'bot-' + Date.now().toString(),
        text: responseData.output || "I received your voice message.",
        sender: 'bot',
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(widgetConfig.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          action: 'sendMessage',
          chatInput: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      const responseData = await response.json();

      const botMessage: Message = {
        id: 'bot-' + Date.now().toString(),
        text: responseData.output || "Sorry, I didn't understand that.",
        sender: 'bot',
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
      }, 500);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isVoiceMode = widgetConfig.type === 'voice';

  // Inline styles from theme
  const widgetStyle: React.CSSProperties = {
    backgroundColor: theme.secondaryColor,
    borderRadius: `${theme.roundedCorners}px`,
    boxShadow: `0 0 ${theme.shadowIntensity / 5}px rgba(0,0,0,${theme.shadowIntensity / 100})`,
    border: `${theme.borderThickness}px solid ${theme.borderColor}`,
    fontFamily: theme.fontFamily,
    colorScheme: theme.colorMode === 'dark' ? 'dark' : 'light',
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    borderBottom: `${theme.borderThickness}px solid ${theme.borderColor}`,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: `${theme.fontSize}px`,
  };

  const avatarStyle: React.CSSProperties = {
    borderRadius: theme.avatarStyle === 'round' ? '9999px' : '4px',
  };

  const userMessageStyle: React.CSSProperties = {
    backgroundColor: theme.primaryColor,
    color: parseInt(theme.primaryColor.substring(1, 3), 16) * 0.299 +
      parseInt(theme.primaryColor.substring(3, 5), 16) * 0.587 +
      parseInt(theme.primaryColor.substring(5, 7), 16) * 0.114 > 186
      ? '#000000' : '#FFFFFF',
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <Card
        className="flex flex-col h-full w-full border-0 shadow-none rounded-none overflow-hidden"
        style={widgetStyle}
      >
        <CardHeader className="flex-shrink-0 flex flex-row items-center gap-3 p-4" style={headerStyle}>
          {theme.logoUrl && (
            <Image
              src={theme.logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
              style={avatarStyle}
            />
          )}
          <div>
            <h3 className="font-bold text-lg leading-tight" style={{ color: theme.headerTitleColor }}>{theme.headerTitle}</h3>
            {theme.headerSubtext && (
              <p className="text-sm text-muted-foreground" style={{ color: theme.headerSubtextColor }}>
                {theme.headerSubtext}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4" style={messageStyle}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {msg.sender === 'bot' && (
                <div style={avatarStyle} className="h-8 w-8 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {theme.logoUrl ? (
                    <Image src={theme.logoUrl} alt="Bot Avatar" width={32} height={32} className="h-full w-full object-cover" />
                  ) : (
                    <Bot size={20} className="text-muted-foreground" />
                  )}
                </div>
              )}
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm md:max-w-md ${msg.sender === 'user' ? '' : 'bg-muted text-foreground'
                  }`}
                style={msg.sender === 'user' ? userMessageStyle : {}}
              >
                {msg.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : msg.type === 'audio' ? (
                  <audio src={msg.audioUrl} controls className="max-w-full h-8" />
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 justify-start">
              <div style={avatarStyle} className="h-8 w-8 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                {theme.logoUrl ? (
                  <Image src={theme.logoUrl} alt="Bot Avatar" width={32} height={32} className="h-full w-full object-cover" />
                ) : (
                  <Bot size={20} className="text-muted-foreground" />
                )}
              </div>
              <div className="max-w-xs rounded-lg px-3 py-2 text-sm md:max-w-md bg-muted text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-2" style={{ borderTop: `${theme.borderThickness}px solid ${theme.borderColor}` }}>
          {isVoiceMode && !isRecording ? (
            <div className="flex w-full flex-col items-center gap-4 py-4 animate-in fade-in slide-in-from-bottom-2">
               <Button 
                type="button" 
                size="lg" 
                className="rounded-full w-20 h-20 shadow-lg hover:scale-105 transition-all"
                style={{ backgroundColor: theme.primaryColor, color: userMessageStyle.color }}
                onClick={startRecording}
              >
                <Mic className="h-8 w-8" />
              </Button>
              <p className="text-xs font-medium text-muted-foreground">Tap to speak</p>
              <button 
                type="button" 
                className="text-xs text-primary underline"
                onClick={() => widgetConfig.type = 'text'} // Local override for switching back
              >
                Switch to text
              </button>
            </div>
          ) : isRecording ? (
            <div className="flex w-full flex-col items-center gap-4 py-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-1 h-12">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-primary rounded-full animate-pulse" 
                    style={{ 
                      height: `${20 + Math.random() * 80}%`, 
                      animationDelay: `${i * 0.1}s`,
                      backgroundColor: theme.primaryColor
                    }} 
                  />
                ))}
              </div>
              <Button 
                type="button" 
                variant="destructive"
                className="rounded-full h-12 px-6 gap-2 shadow-md animate-pulse"
                onClick={stopRecording}
              >
                <div className="h-3 w-3 rounded-full bg-white animate-ping" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="flex w-full items-center gap-2"
            >
              <Button type="button" size="icon" variant="ghost">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent focus:ring-0 focus:ring-offset-0 border-0"
                disabled={isLoading}
              />
              {isVoiceMode && (
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  onClick={startRecording}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
              <Button type="submit" size="icon" disabled={isLoading} style={{ backgroundColor: theme.primaryColor, color: userMessageStyle.color }}>
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

