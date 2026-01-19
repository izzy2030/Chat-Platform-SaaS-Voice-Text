
'use client';

import { useMemo, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import Link from 'next/link';
import { Loader2, Edit, Code, Eye, Palette, MessageSquare, Mic, Trash2, Folder, Activity, Copy, Plus, LineChart, Settings, Zap, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChatWidgetComponent } from '../widget/chat-widget';
import type { WidgetTheme } from '@/app/admin/theming/[widgetId]/page';
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

interface ChatWidget {
  id: string;
  name: string;
  project_id: string;
  type?: 'text' | 'voice';
  user_id: string;
  webhook_url: string;
  allowed_domains: string[];
  theme?: Partial<WidgetTheme>;
  brand?: {
    bubbleColor?: string;
    bubbleIcon?: string;
    panelColor?: string;
    headerTitle?: string;
    welcomeMessage?: string;
    position?: 'left' | 'right';
  };
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
}

function ScriptTagDialog({ widget, open, onOpenChange }: { widget: ChatWidget | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!widget) return null;

  const scriptTag = `<script
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"
  data-key="${widget.id}"
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
      <DialogContent className="sm:max-w-[500px] glass border-white/10">
        <DialogHeader>
          <DialogTitle>Embed Your AI Agent</DialogTitle>
          <DialogDescription>
            Integrate this agent into your platform by adding this script before your closing body tag.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto">
          <code>{scriptTag}</code>
        </div>

        <DialogFooter className="gap-3">
          <DialogClose render={<Button variant="ghost" />}>
            Close
          </DialogClose>
          <Button onClick={handleCopy} className="bg-primary text-white font-bold px-6">
            <Copy className="mr-2 h-4 w-4" /> Copy Script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WidgetList({ projectId }: { projectId?: string }) {
  const { user } = useUser();
  const [selectedWidget, setSelectedWidget] = useState<ChatWidget | null>(null);
  const [isScriptModalOpen, setScriptModalOpen] = useState(false);
  const [isTestModalOpen, setTestModalOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<ChatWidget | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [widgets, setWidgets] = useState<ChatWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      let widgetsQuery = supabase
        .from('widgets')
        .select('*')
        .eq('user_id', user.id);

      if (projectId) {
        widgetsQuery = widgetsQuery.eq('project_id', projectId);
      }

      const { data: widgetsData, error: widgetsError } = await widgetsQuery;
      if (widgetsError) throw widgetsError;
      setWidgets(widgetsData || []);

    } catch (err: any) {
      setError(err);
      toast({ variant: 'destructive', title: 'Error loading data', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, projectId]);

  const widgetsByProject = useMemo(() => {
    if (!widgets) return {};
    const grouped: { [key: string]: ChatWidget[] } = {};
    widgets.forEach((widget) => {
      const pId = widget.project_id || 'unassigned';
      if (!grouped[pId]) grouped[pId] = [];
      grouped[pId].push(widget);
    });
    return grouped;
  }, [widgets]);

  const renderWidgetCard = (widget: ChatWidget) => (
    <div
      key={widget.id}
      className="group bg-card hover:bg-card/80 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-border/70 overflow-hidden flex flex-col"
    >
      <div className="p-6 pb-5 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {widget.name}
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
              AGENT ID: {widget.id.split('-')[0]}...
            </p>
          </div>
          <div className="bg-muted/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-border/70">
            {widget.type === 'voice' ? <Mic size={14} className="text-foreground" /> : <MessageSquare size={14} className="text-foreground" />}
            <span className="text-xs font-semibold text-foreground">{widget.type === 'voice' ? 'Voice Agent' : 'Chat Agent'}</span>
          </div>
        </div>

        {/* Status Box */}
        <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-4 border border-border/60">
          <div className="w-12 h-12 bg-background rounded-lg shadow-sm border border-border/70 flex items-center justify-center shrink-0">
            <LineChart className="text-primary w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Current Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse" />
              <p className="font-bold text-foreground text-sm">Active & Operational</p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/admin/theming/${widget.id}`} />}
            className="h-20 flex-col gap-2 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
          >
            <Palette className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-semibold text-sm">Designer</span>
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/admin/widget/${widget.id}`} />}
            className="h-20 flex-col gap-2 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
          >
            <Settings className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-semibold text-sm">Configure</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
            onClick={() => {
              setSelectedWidget(widget);
              setTestModalOpen(true);
            }}
          >
            <Eye className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-semibold text-sm">Preview</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all group/btn"
            onClick={() => {
              setSelectedWidget(widget);
              setScriptModalOpen(true);
            }}
          >
            <Code className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            <span className="font-semibold text-sm">Embed</span>
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          className="h-12 w-full bg-red-500/5 text-red-600 hover:bg-red-500/10 hover:text-red-700 rounded-xl font-semibold"
          onClick={() => {
            setWidgetToDelete(widget);
            setDeleteConfirmOpen(true);
          }}
        >
          <Trash2 size={16} className="mr-2" /> Remove Agent
        </Button>
      </div>

      {/* Footer */}
      <div className="bg-muted/15 px-6 py-4 border-t border-border/60 flex justify-between items-center mt-auto">
        <p className="text-xs font-medium text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(widget.updated_at), { addSuffix: true })}
        </p>
        <Avatar className="w-7 h-7 rounded-lg border border-border/50">
          <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
            {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <section className="pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1 tracking-tightest">Agents</h1>
            <p className="text-sm text-muted-foreground font-medium">Deployment center for your communication nodes.</p>
          </div>
          <Button size="lg" nativeButton={false} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-xl shadow-primary/20 rounded-lg transition-all hover:scale-105 active:scale-95" render={<Link href="/admin/widget/create" />}>
            <Plus size={18} className="mr-2" /> Deploys New Agent
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg mb-9 backdrop-blur-md">
            <h3 className="text-red-500 font-bold text-lg mb-1">System Interruption</h3>
            <p className="text-red-500 text-sm opacity-80 leading-relaxed">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col gap-12">
            {projects.map((project) => (
              <div key={project.id} className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center border border-primary/20">
                    <Folder size={18} className="text-primary fill-primary/20" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-[0.2em]">{project.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {widgetsByProject[project.id]?.map(renderWidgetCard)}
                  {(!widgetsByProject[project.id] || widgetsByProject[project.id].length === 0) && (
                    <div className="col-span-full py-20 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center bg-muted/20">
                      <p className="text-lg text-muted-foreground/50 mb-6 font-medium">No active nodes in this project.</p>
                      <Button variant="outline" size="lg" nativeButton={false} className="rounded-xl px-8" render={<Link href="/admin/widget/create" />}>
                        Deploy Initial Node
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <Card className="glass py-16 flex flex-col items-center justify-center gap-6 text-center border-white/5">
                <div style={{ width: '80px', height: '80px' }} className="bg-primary/10 rounded-lg flex items-center justify-center mb-2 animate-float">
                  <Folder size={40} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Platform Initialized</h2>
                  <p className="text-lg text-muted-foreground">Create your first project to begin deploying AI agents.</p>
                </div>
                <Button size="lg" nativeButton={false} className="bg-primary font-bold px-8 h-12" render={<Link href="/admin/projects" />}>
                  Create Your First Project
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
                sessionId={`test-session-${selectedWidget.id}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Decommission Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently decommission <span className="font-bold text-red-500">{widgetToDelete?.name}</span>.
              All production traffic to this agent will be terminated immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="ghost" />}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction render={<Button variant="destructive" />}>
              <span onClick={async () => {
                if (!widgetToDelete || !user) return;
                try {
                  const { error } = await supabase.from('widgets').delete().eq('id', widgetToDelete.id).eq('user_id', user.id);
                  if (error) throw error;
                  toast({ title: 'Agent decommissioned.' });
                  fetchData();
                } catch (err: any) {
                  toast({ variant: 'destructive', title: 'Error', description: err.message });
                } finally {
                  setDeleteConfirmOpen(false);
                  setWidgetToDelete(null);
                }
              }}>
                Confirm Termination
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
