
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, deleteDoc, doc, where } from 'firebase/firestore';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Loader2, Edit, Code, Eye, Palette, MessageSquare, Mic, Trash2, Folder, Calendar } from 'lucide-react';
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
  projectId: string;
  type?: 'text' | 'voice';
  userId: string;
  webhookUrl: string;
  allowedDomains: string[];
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
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedWidget, setSelectedWidget] = useState<ChatWidget | null>(null);
  const [isScriptModalOpen, setScriptModalOpen] = useState(false);
  const [isTestModalOpen, setTestModalOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<ChatWidget | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/projects`));
  }, [firestore, user]);

  const widgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const baseQuery = query(collection(firestore, `users/${user.uid}/chatWidgets`));
    if (projectId) {
      return query(baseQuery, where('projectId', '==', projectId));
    }
    return baseQuery;
  }, [firestore, user, projectId]);

  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsQuery);
  const { data: widgets, isLoading: isLoadingWidgets, error } = useCollection<ChatWidget>(widgetsQuery);

  const widgetsByProject = useMemo(() => {
    if (!widgets || !projects) return {};
    const grouped: { [key: string]: ChatWidget[] } = {};
    widgets.forEach((widget) => {
      const pId = widget.projectId || 'unassigned';
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
      await deleteDoc(doc(firestore, `users/${user.uid}/chatWidgets/${widgetToDelete.id}`));
      toast({ title: 'Widget deleted successfully' });
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({ variant: 'destructive', title: 'Error deleting widget', description: 'Please try again.' });
    } finally {
      setDeleteConfirmOpen(false);
      setWidgetToDelete(null);
    }
  };
  
  const renderWidgetCard = (widget: ChatWidget) => (
      <Card key={widget.id} className="overflow-hidden bg-white shadow-sm border border-indigo-100 rounded-2xl hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-6 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-bold text-gray-900">{widget.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <Calendar className="w-3 h-3" />
                    <span>Created recently</span>
                  </div>
               </div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                   widget.type === 'voice' 
                   ? 'bg-purple-100 text-purple-700' 
                   : 'bg-blue-100 text-blue-700'
               }`}>
                   {widget.type === 'voice' ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                   {widget.type === 'voice' ? 'Voice Agent' : 'Text Chat'}
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 truncate max-w-[200px]">
                 ID: {widget.id}
               </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-indigo-50 flex items-center justify-between gap-2">
             <div className="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg font-medium transition-colors"
                    onClick={() => handleViewScript(widget)}
                >
                    <Code className="mr-1.5 h-3.5 w-3.5" /> Script
                </Button>
                <Link href={`/admin/widget/${widget.id}`} passHref>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-medium transition-colors"
                    >
                        <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                </Link>
             </div>
             
             <div className="flex gap-1">
                <Link href={`/admin/theming/${widget.id}`} passHref>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Customize">
                        <Palette className="h-4 w-4" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Test" onClick={() => handleTestWidget(widget)}>
                    <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete" onClick={() => handleDeleteClick(widget)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
  );

  const isLoading = isLoadingProjects || isLoadingWidgets;

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
