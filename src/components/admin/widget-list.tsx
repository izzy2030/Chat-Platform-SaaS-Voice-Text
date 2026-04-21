'use client';

import { useMemo, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import Link from 'next/link';
import { Loader2, Edit, Code, Eye, Palette, MessageSquare, Mic, Trash2, Folder, Activity, Copy, Plus, LineChart, Settings, Zap, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChatWidgetComponent } from '../widget/chat-widget';
import type { WidgetTheme } from '@/lib/themes';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ScriptTagDialog({ widget, open, onOpenChange }: { widget: any | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!widget) return null;

  const scriptTag = `<script
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"
  data-key="${widget._id}"
  data-site="${widget.name.toUpperCase().replace(/\s+/g, '-')}"
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag)
      .then(() => {
        toast({ title: "Copied to clipboard!" });
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy text to clipboard.",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] glass border-white/10">
        <DialogHeader>
          <DialogTitle>Embed Agent</DialogTitle>
          <DialogDescription>
            Add this script before your closing body tag.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black/40 border border-white/5 rounded p-3 my-3 font-mono text-xs overflow-x-auto">
          <code>{scriptTag}</code>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            Close
          </DialogClose>
          <Button onClick={handleCopy} size="sm" className="bg-primary text-white font-semibold">
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WidgetList({ projectId }: { projectId?: string }) {
  const { user, isLoaded } = useUser();
  const deleteWidget = useMutation(api.widgets.remove);
  const convex = useConvex();

  const [convexReady, setConvexReady] = useState(false);

  useEffect(() => {
    convex.query(api.projects.getByUserId, { userId: 'probe' })
      .then(() => setConvexReady(true))
      .catch(() => setConvexReady(true));
  }, [convex]);

  const projects = useQuery(
    api.projects.getByUserId,
    convexReady && isLoaded && user ? { userId: user.id } : 'skip'
  );

  const projectWidgets = useQuery(
    api.widgets.getByProjectId,
    convexReady && isLoaded && user && projectId
      ? { userId: user.id, projectId: projectId as any }
      : 'skip'
  );

  const userWidgets = useQuery(
    api.widgets.getByUserId,
    convexReady && isLoaded && user && !projectId
      ? { userId: user.id }
      : 'skip'
  );

  const allWidgets = projectId ? projectWidgets : userWidgets;

  const [selectedWidget, setSelectedWidget] = useState<any | null>(null);
  const [isScriptModalOpen, setScriptModalOpen] = useState(false);
  const [isTestModalOpen, setTestModalOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const widgetsByProject = useMemo(() => {
    if (!allWidgets) return {};
    const grouped: { [key: string]: any[] } = {};
    allWidgets.forEach((widget) => {
      const pId = widget.projectId || 'unassigned';
      if (!grouped[pId]) grouped[pId] = [];
      grouped[pId].push(widget);
    });
    return grouped;
  }, [allWidgets]);

  const renderWidgetCard = (widget: any) => (
    <div
      key={widget._id}
      className="group bg-card hover:bg-card/80 rounded-lg transition-all duration-300 border border-border/70 overflow-hidden flex flex-col"
    >
      <div className="p-4 pb-3 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {widget.name}
            </h3>
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.1em]">
              {String(widget._id).slice(0, 8)}...
            </p>
          </div>
          <div className="bg-muted/50 px-2 py-1 rounded-full flex items-center gap-1.5 border border-border/70">
            {widget.type === 'voice' ? <Mic size={12} className="text-foreground" /> : <MessageSquare size={12} className="text-foreground" />}
            <span className="text-xs font-medium text-foreground">{widget.type === 'voice' ? 'Voice' : 'Chat'}</span>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-3 border border-border/60">
          <div className="w-8 h-8 bg-background rounded border border-border/70 flex items-center justify-center shrink-0">
            <LineChart className="text-primary w-4 h-4" />
          </div>
          <div className="space-y-0">
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.1em]">Status</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-medium text-foreground text-xs">Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/admin/theming/${widget._id}`} />}
            className="h-14 flex-col gap-1 rounded-lg border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
          >
            <Palette className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-medium text-xs">Design</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/admin/widget/${widget._id}`} />}
            className="h-14 flex-col gap-1 rounded-lg border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-medium text-xs">Config</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-14 flex-col gap-1 rounded-lg border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
            onClick={() => {
              setSelectedWidget(widget);
              setTestModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-medium text-xs">Preview</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-14 flex-col gap-1 rounded-lg border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
            onClick={() => {
              setSelectedWidget(widget);
              setScriptModalOpen(true);
            }}
          >
            <Code className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-medium text-xs">Embed</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full bg-red-500/5 text-red-600 hover:bg-red-500/10 hover:text-red-700 rounded-lg font-medium"
          onClick={() => {
            setWidgetToDelete(widget);
            setDeleteConfirmOpen(true);
          }}
        >
          <Trash2 size={14} className="mr-1.5" /> Remove
        </Button>
      </div>

      <div className="bg-muted/15 px-4 py-2.5 border-t border-border/60 flex justify-between items-center mt-auto">
        <p className="text-[10px] font-medium text-muted-foreground">
          {formatDistanceToNow(new Date(widget._creationTime), { addSuffix: true })}
        </p>
        <Avatar className="w-6 h-6 rounded border border-border/50">
          <AvatarImage src={user?.imageUrl || ''} />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[8px] font-semibold">
            {user?.fullName?.substring(0, 2).toUpperCase() || user?.emailAddresses?.[0]?.emailAddress?.substring(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <section className="pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground font-medium">Deploy and manage your communication nodes.</p>
          </div>
          <Button size="sm" nativeButton={false} className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg" render={<Link href="/admin/widget/create" />}>
            <Plus size={14} className="mr-1.5" /> Deploy
          </Button>
        </div>

        {!isLoaded ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {(projects ?? []).map((project) => (
              <div key={project._id} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="bg-primary/10 p-1.5 rounded flex items-center justify-center border border-primary/20">
                    <Folder size={14} className="text-primary fill-primary/20" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-[0.15em]">{project.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {widgetsByProject[project._id]?.map(renderWidgetCard)}
                  {(!widgetsByProject[project._id] || widgetsByProject[project._id].length === 0) && (
                    <div className="col-span-full py-10 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center bg-muted/20">
                      <p className="text-sm text-muted-foreground/50 mb-4 font-medium">No agents in this project.</p>
                      <Button variant="outline" size="sm" nativeButton={false} className="rounded-lg" render={<Link href="/admin/widget/create" />}>
                        Deploy Agent
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(projects ?? []).length === 0 && (
              <Card className="py-12 flex flex-col items-center justify-center gap-4 text-center border-white/5">
                <div className="bg-primary/10 p-3 rounded-lg flex items-center justify-center">
                  <Folder size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold mb-1">No projects yet</h2>
                  <p className="text-sm text-muted-foreground">Create a project to start deploying agents.</p>
                </div>
                <Button size="sm" nativeButton={false} className="bg-primary font-semibold rounded-lg" render={<Link href="/admin/projects" />}>
                  Create Project
                </Button>
              </Card>
            )}
          </div>
        )}
      </section>

      <ScriptTagDialog widget={selectedWidget} open={isScriptModalOpen} onOpenChange={setScriptModalOpen} />

      <Dialog open={isTestModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <div className="h-[80vh] relative">
            {selectedWidget && (
              <ChatWidgetComponent
                widgetConfig={selectedWidget}
                sessionId={`test-session-${selectedWidget._id}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold text-red-500">{widgetToDelete?.name}</span>.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="ghost" size="sm" />}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction render={<Button variant="destructive" size="sm" />}>
              <span onClick={async () => {
                if (!widgetToDelete || !user) return;
                try {
                  await deleteWidget({ id: widgetToDelete._id, userId: user.id });
                  toast({ title: 'Agent removed.' });
                } catch (err: any) {
                  toast({ variant: 'destructive', title: 'Error', description: err.message });
                } finally {
                  setDeleteConfirmOpen(false);
                  setWidgetToDelete(null);
                }
              }}>
                Remove
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
