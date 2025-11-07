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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Edit, Code, Send } from 'lucide-react';
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

interface ChatWidget {
  id: string;
  name: string;
  userId: string;
  webhookUrl: string;
  allowedDomains: string[];
  brand: {
    bubbleColor?: string;
    bubbleIcon?: string;
    panelColor?: string;
    headerTitle?: string;
    welcomeMessage?: string;
    position?: 'left' | 'right';
  };
  behavior: {
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptTag);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed Your Widget</DialogTitle>
          <DialogDescription>
            Copy and paste this script tag into your website's HTML.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 my-4">
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
            <code>{scriptTag}</code>
          </pre>
        </div>
        <DialogFooter>
          <Button onClick={copyToClipboard}>Copy Script</Button>
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
  
  const handleTestMessage = async (widget: ChatWidget) => {
    toast({ title: "Sending test message..." });
    try {
      // In a real app, this would be a server-side call to securely use the webhook secret
      // for signing the request. For now, we are just sending a test payload.
      const testPayload = {
        event: 'test_message',
        widgetId: widget.id,
        sender: {
          id: 'test-user-123',
          role: 'user',
        },
        message: {
          id: `test-message-${Date.now()}`,
          text: 'This is a test message from your Chat Widget Factory dashboard.',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await fetch(widget.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast({ title: "Test message sent successfully!", description: "Check your webhook endpoint." });
      } else {
        const errorBody = await response.text();
        throw new Error(`Webhook returned status ${response.status}. Response: ${errorBody}`);
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to send test message",
        description: e.message || "Please check the webhook URL and your server's logs.",
      });
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Chat Widgets</CardTitle>
          <CardDescription>
            A list of your created chat widgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Widget ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {widgets && widgets.length > 0 ? (
                  widgets.map((widget) => (
                    <TableRow key={widget.id}>
                      <TableCell className="font-medium">{widget.name}</TableCell>
                      <TableCell>
                        <code>{widget.id}</code>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewScript(widget)}>
                           <Code className="mr-2 h-4 w-4" /> View Script
                        </Button>
                         <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/widget/${widget.id}`}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTestMessage(widget)}>
                           <Send className="mr-2 h-4 w-4" /> Test
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center"
                    >
                      No widgets found. Create one to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ScriptTagDialog widget={selectedWidget} open={isScriptModalOpen} onOpenChange={setScriptModalOpen} />
    </>
  );
}
