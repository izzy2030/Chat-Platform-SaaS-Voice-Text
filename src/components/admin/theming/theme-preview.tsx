
'use client';
import type { WidgetTheme } from '@/app/admin/theming/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, MessageSquare, Send, Sparkles } from 'lucide-react';


interface ThemePreviewProps {
  theme: WidgetTheme;
}

export function ThemePreview({ theme }: ThemePreviewProps) {

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: theme.primaryColor,
    width: theme.bubbleSize === 'small' ? '48px' : theme.bubbleSize === 'large' ? '72px' : '60px',
    height: theme.bubbleSize === 'small' ? '48px' : theme.bubbleSize === 'large' ? '72px' : '60px',
  };

  const widgetStyle: React.CSSProperties = {
    backgroundColor: theme.secondaryColor,
    borderRadius: `${theme.roundedCorners}px`,
    boxShadow: `0 0 ${theme.shadowIntensity / 5}px rgba(0,0,0,${theme.shadowIntensity/100})`,
    border: `${theme.borderThickness}px solid ${theme.borderColor}`,
  };
  
  const headerStyle: React.CSSProperties = {
      fontFamily: theme.fontFamily,
  };
  
  const messageStyle: React.CSSProperties = {
    fontSize: `${theme.fontSize}px`,
    fontFamily: theme.fontFamily,
  };
  
  const avatarStyle: React.CSSProperties = {
      borderRadius: theme.avatarStyle === 'round' ? '9999px' : '4px',
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <Tabs defaultValue="widget" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bubble">Launcher</TabsTrigger>
            <TabsTrigger value="widget">Chat View</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
          </TabsList>
          <TabsContent value="bubble">
            <Card className="mt-4">
                <CardHeader><CardTitle>Launcher Bubble Preview</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                     <div style={bubbleStyle} className="rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg">
                        <MessageSquare size={32} />
                     </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="widget">
            <div style={widgetStyle} className="mt-4 flex flex-col h-[60vh] w-full max-w-sm mx-auto overflow-hidden">
                <header style={headerStyle} className="p-4 border-b">
                    <h3 className="font-bold text-lg">{theme.headerTitle}</h3>
                </header>
                <div className="flex-grow p-4 space-y-4">
                    {/* Placeholder messages */}
                </div>
                <footer className="p-2 border-t flex items-center gap-2">
                    <input type="text" placeholder="Type a message..." className="flex-grow bg-transparent focus:outline-none" />
                    <Button size="icon" style={{backgroundColor: theme.primaryColor}}>
                        <Send size={20} />
                    </Button>
                </footer>
            </div>
          </TabsContent>
          <TabsContent value="messages">
             <Card className="mt-4">
                <CardHeader><CardTitle>Message Animation Preview</CardTitle></CardHeader>
                <CardContent className="h-48 p-4 space-y-4" style={messageStyle}>
                    <div className="flex items-start gap-2">
                        <div style={avatarStyle} className="h-8 w-8 bg-gray-300 flex-shrink-0 flex items-center justify-center"><Bot size={20}/></div>
                        <div className="p-3 rounded-lg bg-gray-200">
                           <p>This is a message from the bot.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 justify-end">
                         <div className="p-3 rounded-lg" style={{backgroundColor: theme.primaryColor, color: 'white'}}>
                           <p>This is a message from the user.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="success">
             <Card className="mt-4">
                <CardHeader><CardTitle>Success Celebration Preview</CardTitle></CardHeader>
                <CardContent className="h-48 p-4 flex flex-col items-center justify-center text-center">
                    <Sparkles className="h-12 w-12 text-yellow-400 mb-4" />
                    <h3 className="font-bold text-xl">Success!</h3>
                    <p className="text-muted-foreground">You've unlocked a coupon!</p>
                    <div className="mt-2 p-2 border border-dashed rounded-lg" style={{borderColor: theme.accentColor}}>
                        <p style={{color: theme.accentColor}} className="font-mono font-bold">SAVE20</p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
