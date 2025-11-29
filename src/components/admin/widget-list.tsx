
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Edit, Code, Eye, Copy, Palette, MessageSquare, Mic } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ChatWidgetComponent } from '../widget/chat-widget';
import type { WidgetTheme } from '@/app/admin/theming/[widgetId]/page';


interface ChatWidget {
  id: string;
  name: string;
  type?: 'text' | 'voice';
  userId: string;
  webhookUrl: string;
  allowedDomains: string[];
  theme?: Partial<WidgetTheme>;
  // Legacy fields
  brand?: {
    bubbleColor?: string;
    bubbleIcon?: string;
    panelColor?: string;
    headerTitle?: string;
    welcomeMessage?: string;
    position?: 'left' | 'right';
  };
  behavior?: {
    defaultLanguage?: 'EN' | 'ES';
  };
}

function ScriptTagDialog({ widget, open, onOpenChange }: { widget: ChatWidget | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!widget) return null;

  const scriptTag = `<script
  src="${window.location.origin}/widget.js"
  data-key="${widget.id}"
  data-site="${widget.name.toUpperCase().replace(/\s+/g, '-')}"
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag)
      .then(() => {
        toast({ title: "Copied to clipboard!" });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy text to clipboard. Please copy it manually.",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed Your Widget</DialogTitle>
          <DialogDescription>
            Copy and paste this script tag into your website's HTML just before the closing &lt;/body&gt; tag.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 my-4">
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
            <code>{scriptTag}</code>
          </pre>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Script</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function WidgetList() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedWidget, setSelectedWidget] = useState<ChatWidget | null>(null);
  const [isScriptModalOpen, setScriptModalOpen] = useState(false);
  const [isTestModalOpen, setTestModalOpen] = useState(false);

  const chatWidgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/chatWidgets`));
  }, [firestore, user]);

  const {
    data: widgets,
    isLoading,
    error,
  } = useCollection<ChatWidget>(chatWidgetsQuery);

  const handleViewScript = (widget: ChatWidget) => {
    setSelectedWidget(widget);
    setScriptModalOpen(true);
  };
  
  const handleTestWidget = (widget: ChatWidget) => {
    setSelectedWidget(widget);
    setTestModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-transparent text-foreground p-2">
           <h3 className="text-2xl font-semibold leading-none tracking-tight">Chat Widgets</h3>
           <p className="text-sm text-muted-foreground mt-2">A list of your created chat widgets.</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error loading widgets</AlertTitle>
                <AlertDescription>
                {error.message}
                </AlertDescription>
            </Alert>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {widgets && widgets.length > 0 ? (
              widgets.map((widget) => (
                <Card key={widget.id} className="overflow-hidden shadow-sm border-0">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                           <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</h3>
                           <div className="flex items-center gap-2">
                             {widget.type === 'voice' ? (
                               <Mic className="h-5 w-5 text-primary" />
                             ) : (
                               <MessageSquare className="h-5 w-5 text-primary" />
                             )}
                             <div className="text-lg font-bold text-foreground">{widget.name}</div>
                           </div>
                        </div>
                         <div>
                           <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Widget ID</h3>
                           <code className="text-sm font-mono text-foreground">{widget.id}</code>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-2 flex gap-2 border-t border-border/50">
                        <Button variant="ghost" className="flex-1 h-9 bg-background/50 hover:bg-accent hover:text-accent-foreground group" onClick={() => handleViewScript(widget)}>
                            <Code className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" /> Script
                        </Button>
                        <Button asChild variant="ghost" className="flex-1 h-9 bg-background/50 hover:bg-accent hover:text-accent-foreground group">
                            <Link href={`/admin/widget/${widget.id}`}>
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" /> Edit
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="flex-1 h-9 bg-background/50 hover:bg-accent hover:text-accent-foreground group">
                            <Link href={`/admin/theming/${widget.id}`}>
                                <Palette className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" /> Customize
                            </Link>
                        </Button>
                         <Button variant="ghost" className="flex-1 h-9 bg-background/50 hover:bg-accent hover:text-accent-foreground group" onClick={() => handleTestWidget(widget)}>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" /> Test
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                   <div className="rounded-full bg-muted p-4 mb-4">
                      <Palette className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-medium">No widgets created yet</h3>
                   <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first widget to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <ScriptTagDialog widget={selectedWidget} open={isScriptModalOpen} onOpenChange={setScriptModalOpen} />
      <Dialog open={isTestModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 border-0 bg-transparent shadow-none">
           <DialogHeader className="sr-only">
            <DialogTitle>Test Widget</DialogTitle>
            <DialogDescription>A preview of your configured chat widget.</DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] w-full">
            {selectedWidget && (
              <ChatWidgetComponent
                widgetConfig={selectedWidget}
                sessionId={`test-session-${selectedWidget.id}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
