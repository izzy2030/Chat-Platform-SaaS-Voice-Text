'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, SendHorizonal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatWidgetProps {
  widgetConfig: {
    id: string;
    webhookUrl: string;
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

  React.useEffect(() => {
    if (widgetConfig.brand?.welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          text: widgetConfig.brand.welcomeMessage,
          sender: 'bot',
        },
      ]);
    }
  }, [widgetConfig.brand?.welcomeMessage]);

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
      // Send message to the webhook
      const response = await fetch(widgetConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        text: responseData.output || "Sorry, I didn't understand that.", // Fallback text
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

  return (
    <div className="flex flex-col h-full bg-background">
      <Card
        className="flex flex-col h-full w-full border-0 shadow-none rounded-none"
        style={{ backgroundColor: widgetConfig.brand?.panelColor }}
      >
        <CardHeader className="flex-shrink-0">
          <CardTitle>{widgetConfig.brand?.headerTitle || 'Chat'}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm md:max-w-md ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-end gap-2 justify-start">
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
        <CardFooter className="border-t p-2">
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
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
