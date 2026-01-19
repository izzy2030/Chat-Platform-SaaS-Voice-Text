
'use client';

import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import Link from 'next/link';
import { Loader2, Edit, Code, Eye, Palette, MessageSquare, Mic, Trash2, Folder, Activity, Copy, Plus } from 'lucide-react';
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
  }, [user, projectId]);

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
      className="glass-card p-6 flex flex-col gap-6 group rounded-lg bg-black/20 border border-white/5"
    >
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-display font-bold text-premium group-hover:text-primary transition-colors duration-300">
              {widget.name}
            </h3>
            <span className="text-[10px] font-mono text-premium/40 uppercase tracking-widest">Agent ID: {widget.id.split('-')[0]}...</span>
          </div>
          <Badge
            variant="secondary"
            className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20"
          >
            <div className="flex items-center gap-2">
              {widget.type === 'voice' ? <Mic size={14} /> : <MessageSquare size={14} />}
              <span className="text-sm font-bold">{widget.type === 'voice' ? 'Voice Agent' : 'Chat Agent'}</span>
            </div>
          </Badge>
        </div>

        <div className="glass-panel p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex-none bg-primary shadow-lg shadow-primary/30 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[10px] font-bold text-premium/40 uppercase tracking-widest leading-none mb-1">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-sm font-bold text-premium">Active & Operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/admin/theming/${widget.id}`} />}
            className="cursor-pointer font-bold h-11 glass-button-ghost bg-white/5 hover:bg-white/10"
          >
            <Palette size={18} className="mr-1" /> Designer
          </Button>

          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/admin/widget/${widget.id}`} />}
            className="cursor-pointer font-bold h-11 glass-button-ghost bg-white/5 hover:bg-white/10"
          >
            <Edit size={18} className="mr-1" /> Configure
          </Button>

          <Button
            variant="ghost"
            className="cursor-pointer font-bold h-11 glass-button-ghost bg-white/5 hover:bg-white/10"
            onClick={() => {
              setSelectedWidget(widget);
              setTestModalOpen(true);
            }}
          >
            <Eye size={18} className="mr-1" /> Preview
          </Button>

          <Button
            variant="ghost"
            className="cursor-pointer font-bold h-11 glass-button-ghost bg-white/5 hover:bg-white/10"
            onClick={() => {
              setSelectedWidget(widget);
              setScriptModalOpen(true);
            }}
          >
            <Code size={18} className="mr-1" /> Embed
          </Button>

          <div />

          <Button
            variant="ghost"
            className="cursor-pointer font-bold h-11 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.1] text-red-400 transition-all rounded-lg"
            onClick={() => {
              setWidgetToDelete(widget);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 size={18} className="mr-1" /> Remove
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <section className="pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-premium text-vibrant mb-1 tracking-tightest">Agents</h1>
            <p className="text-sm text-premium/50 font-medium font-sans">Deployment center for your communication nodes.</p>
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
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <div className="bg-primary shadow-lg shadow-primary/20 p-1.5 rounded-lg flex items-center justify-center">
                    <Folder size={16} className="text-white fill-white" />
                  </div>
                  <h2 className="text-lg font-display font-bold text-premium uppercase tracking-[0.2em]">{project.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {widgetsByProject[project.id]?.map(renderWidgetCard)}
                  {(!widgetsByProject[project.id] || widgetsByProject[project.id].length === 0) && (
                    <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center bg-transparent">
                      <p className="text-lg text-premium/30 mb-6 font-medium">No active nodes in this project.</p>
                      <Button variant="outline" size="lg" nativeButton={false} className="rounded-lg px-8 glass-button-ghost opacity-100" render={<Link href="/admin/widget/create" />}>
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
                  <p className="text-lg text-gray-400">Create your first project to begin deploying AI agents.</p>
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
        <AlertDialogContent className="glass border-white/10">
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
