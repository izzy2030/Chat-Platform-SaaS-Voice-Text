
'use client';
import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Paperclip, SendHorizonal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { WidgetTheme } from '@/app/admin/theming/[widgetId]/page';
import { defaultTheme } from '@/lib/themes';

interface ChatWidgetProps {
  widgetConfig: {
    id: string;
    webhook_url: string;
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
}

export function ChatWidgetComponent({
  widgetConfig,
  sessionId,
}: ChatWidgetProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const theme = React.useMemo(() => ({
    ...defaultTheme,
    ...widgetConfig.theme
  }), [widgetConfig.theme]);

  // Handle initial message (from new theme or legacy field)
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
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
    // A simple brightness check to determine text color
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
            <h3 className="font-bold text-lg leading-tight">{theme.headerTitle}</h3>
            {theme.headerSubtext && <p className="text-sm text-muted-foreground">{theme.headerSubtext}</p>}
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
            <Button type="submit" size="icon" disabled={isLoading} style={{ backgroundColor: theme.primaryColor, color: userMessageStyle.color }}>
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
