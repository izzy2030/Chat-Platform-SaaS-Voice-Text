
'use client';

import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Loader2, Edit, Code, Eye, Palette, MessageSquare, Mic, Trash2, Folder, Calendar, Copy } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { ChatWidgetComponent } from '../widget/chat-widget';
import type { WidgetTheme } from '@/app/admin/theming/[widgetId]/page';
import { Badge } from '@/components/ui/badge';


interface ChatWidget {
  id: string;
  name: string;
  project_id: string; // Updated from projectId
  type?: 'text' | 'voice';
  user_id: string;    // Updated from userId
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
  behavior?: {
    defaultLanguage?: 'EN' | 'ES';
  };
}

interface Project {
  id: string;
  name: string;
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
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch widgets
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
    if (!widgets || !projects) return {};
    const grouped: { [key: string]: ChatWidget[] } = {};
    widgets.forEach((widget) => {
      const pId = widget.project_id || 'unassigned';
      if (!grouped[pId]) {
        grouped[pId] = [];
      }
      grouped[pId].push(widget);
    });
    return grouped;
  }, [widgets, projects]);


  const handleDeleteClick = (widget: ChatWidget) => {
    setWidgetToDelete(widget);
    setDeleteConfirmOpen(true);
  };

  const handleViewScript = (widget: ChatWidget) => {
    setSelectedWidget(widget);
    setScriptModalOpen(true);
  };

  const handleTestWidget = (widget: ChatWidget) => {
    setSelectedWidget(widget);
    setTestModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!widgetToDelete || !user) return;

    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Widget deleted successfully' });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting widget:', error);
      toast({ variant: 'destructive', title: 'Error deleting widget', description: error.message });
    } finally {
      setDeleteConfirmOpen(false);
      setWidgetToDelete(null);
    }
  };

  const renderWidgetCard = (widget: ChatWidget) => (
    <Card key={widget.id} className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-5 text-center">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{widget.name}</h3>

          <Badge variant="secondary" className={`w-full justify-center py-2.5 text-sm font-bold border-0 rounded-lg ${widget.type === 'voice'
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}>
            {widget.type === 'voice' ? <Mic className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            {widget.type === 'voice' ? 'Voice Agent' : 'Text Chat'}
          </Badge>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/60 flex flex-col items-center justify-center space-y-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 font-medium uppercase tracking-wider">Created Recently</span>
            </div>
            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/60 flex flex-col items-center justify-center space-y-1.5">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">ID</span>
              <code className="font-mono text-gray-700 truncate w-full">{widget.id}</code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div
              className="bg-indigo-50 text-indigo-700 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-indigo-100 transition-colors"
              onClick={() => handleViewScript(widget)}
            >
              <Code className="h-6 w-6" />
              <span className="text-sm font-semibold">Script</span>
            </div>

            <Link href={`/admin/widget/${widget.id}`} passHref>
              <div className="bg-gray-50/80 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-gray-100 transition-colors h-full">
                <Edit className="h-6 w-6 text-gray-500" />
                <span className="text-sm font-semibold text-gray-600">Edit</span>
              </div>
            </Link>

            <div
              className="bg-gray-50/80 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleTestWidget(widget)}
            >
              <Eye className="h-6 w-6 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">Preview</span>
            </div>

            <div
              className="bg-gray-50/80 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-red-50 transition-colors"
              onClick={() => handleDeleteClick(widget)}
            >
              <Trash2 className="h-6 w-6 text-red-500" />
              <span className="text-sm font-semibold text-red-500">Delete</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isLoadingLocal = isLoading; // No redeclaration

  return (
    <>
      <div className="space-y-8">
        {!projectId && (
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h3>
            <p className="text-md text-muted-foreground">Manage your AI agents and chat widgets.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <div className="space-y-10">
            {projectId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {widgets && widgets.length > 0 ? (
                  widgets.map(renderWidgetCard)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground pt-8">No widgets found in this project.</p>
                )}
              </div>
            ) : (
              <>
                {projects && projects.map((project) => (
                  <div key={project.id} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Folder className="h-5 w-5 text-indigo-500 fill-indigo-100" />
                      <h4 className="text-xl font-bold text-gray-800">{project.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {widgetsByProject[project.id]?.map(renderWidgetCard)}
                      {(!widgetsByProject[project.id] || widgetsByProject[project.id].length === 0) && (
                        <div className="col-span-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                          <p className="text-sm">No widgets in this project yet.</p>
                          <Button asChild variant="link" className="text-indigo-600">
                            <Link href="/admin/widget/create">Create one now</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!projects || projects.length === 0) && (
                  <Card className="border-0 shadow-sm bg-white rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="rounded-full bg-indigo-50 p-6 mb-6">
                        <Folder className="h-12 w-12 text-indigo-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects created yet</h3>
                      <p className="text-gray-500 mb-8 max-w-sm mx-auto">Projects allow you to organize your widgets efficiently. Create your first project to get started.</p>
                      <Button asChild size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href="/admin/projects">Create Project</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
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

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the widget
              <span className="font-bold text-foreground"> {widgetToDelete?.name} </span>
              and remove its data from our servers. Any websites using this widget will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
