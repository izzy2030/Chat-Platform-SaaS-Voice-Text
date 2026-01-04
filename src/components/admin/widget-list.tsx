
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
  Flex,
  Grid,
  Text,
  Button,
  Badge,
  Heading,
  Box,
  Dialog,
  Separator,
  AlertDialog,
  Section,
  Container,
  IconButton,
  ScrollArea
} from '@radix-ui/themes';

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px" style={{ borderRadius: 'var(--radius)' }} className="glass">
        <Dialog.Title>Embed Your AI Agent</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Integrate this agent into your platform by adding this script before your closing body tag.
        </Dialog.Description>

        <Box className="bg-black/40 border border-white/5 rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto">
          <code>{scriptTag}</code>
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="ghost">Close</Button>
          </Dialog.Close>
          <Button onClick={handleCopy} className="bg-primary text-white font-bold px-6">
            <Copy className="mr-2 h-4 w-4" /> Copy Script
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
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
    <Box
      key={widget.id}
      className="glass-card p-6 flex flex-col gap-6 group rounded-[2rem]"
    >
      <Flex direction="column" gap="5">
        <Flex justify="between" align="start">
          <Flex direction="column" gap="1">
            <Heading size="6" className="font-display font-bold text-premium group-hover:text-primary transition-colors duration-300">
              {widget.name}
            </Heading>
            <Text size="1" className="font-mono text-premium/40 uppercase tracking-widest">Agent ID: {widget.id.split('-')[0]}...</Text>
          </Flex>
          <Badge
            variant="soft"
            color={widget.type === 'voice' ? 'iris' : 'violet'}
            size="2"
            radius="full"
            className="px-4 py-1.5"
          >
            <Flex align="center" gap="2">
              {widget.type === 'voice' ? <Mic size={14} /> : <MessageSquare size={14} />}
              <Text size="2" weight="bold">{widget.type === 'voice' ? 'Voice Agent' : 'Chat Agent'}</Text>
            </Flex>
          </Badge>
        </Flex>

        <Box className="glass-panel p-4">
          <Flex align="center" gap="4">
            <div className="w-10 h-10 flex-none bg-primary shadow-lg shadow-primary/30 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <Flex direction="column" gap="0">
              <Text size="1" weight="bold" className="text-premium/40 uppercase tracking-widest leading-none mb-1">Status</Text>
              <Flex align="center" gap="2">
                <Box style={{ width: '8px', height: '8px' }} className="bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <Text size="3" weight="bold" className="text-premium">Active & Operational</Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>

        <Grid columns="3" gap="3">
          <Button
            variant="ghost"
            asChild
            className="cursor-pointer font-bold h-11 glass-button-ghost"
          >
            <Link href={`/admin/theming/${widget.id}`}>
              <Palette size={18} className="mr-1" /> Designer
            </Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className="cursor-pointer font-bold h-11 glass-button-ghost"
          >
            <Link href={`/admin/widget/${widget.id}`}>
              <Edit size={18} className="mr-1" /> Configure
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="cursor-pointer font-bold h-11 glass-button-ghost"
            onClick={() => {
              setSelectedWidget(widget);
              setTestModalOpen(true);
            }}
          >
            <Eye size={18} className="mr-1" /> Preview
          </Button>

          <Button
            variant="ghost"
            className="cursor-pointer font-bold h-11 glass-button-ghost"
            onClick={() => {
              setSelectedWidget(widget);
              setScriptModalOpen(true);
            }}
          >
            <Code size={18} className="mr-1" /> Embed
          </Button>

          <Box />

          <Button
            variant="ghost"
            color="red"
            className="cursor-pointer font-bold h-11 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.1] text-red-400 transition-all rounded-xl"
            onClick={() => {
              setWidgetToDelete(widget);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 size={18} className="mr-1" /> Remove
          </Button>
        </Grid>
      </Flex>
    </Box>
  );

  return (
    <Box className="w-full">
      <Section size="1" pb="4">
        <Flex justify="between" align="center" mb="6">
          <Box>
            <Heading size="8" className="font-display font-bold text-premium text-vibrant mb-1 tracking-tightest">Agents</Heading>
            <Text size="2" className="text-premium/50 font-medium font-sans">Deployment center for your communication nodes.</Text>
          </Box>
          <Button size="3" className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95" asChild>
            <Link href="/admin/widget/create">
              <Plus size={18} className="mr-2" /> Deploys New Agent
            </Link>
          </Button>
        </Flex>

        {isLoading && (
          <Flex justify="center" py="9">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </Flex>
        )}

        {error && (
          <Box className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl mb-9 backdrop-blur-md">
            <Text color="red" weight="bold" size="4" mb="1">System Interruption</Text>
            <Text color="red" size="3" className="opacity-80 leading-relaxed">{error.message}</Text>
          </Box>
        )}

        {!isLoading && !error && (
          <Flex direction="column" gap="7">
            {projects.map((project) => (
              <Box key={project.id} className="space-y-6">
                <Flex align="center" gap="2" pb="3" className="border-b glass-separator">
                  <Box className="bg-primary shadow-lg shadow-primary/20 p-1.5 rounded-lg flex items-center justify-center">
                    <Folder size={16} className="text-white fill-white" />
                  </Box>
                  <Heading size="3" className="font-display font-bold text-premium uppercase tracking-[0.2em]">{project.name}</Heading>
                </Flex>

                <Grid columns={{ initial: '1', md: '1', lg: '2', xl: '3' }} gap="8">
                  {widgetsByProject[project.id]?.map(renderWidgetCard)}
                  {(!widgetsByProject[project.id] || widgetsByProject[project.id].length === 0) && (
                    <Box className="col-span-full py-20 border-2 border-dashed glass-separator rounded-[2.5rem] flex flex-col items-center justify-center bg-transparent">
                      <Text size="4" className="text-premium/30 mb-6 font-medium">No active nodes in this project.</Text>
                      <Button variant="outline" size="3" className="rounded-xl px-8 glass-button-ghost opacity-100" asChild>
                        <Link href="/admin/widget/create">Deploy Initial Node</Link>
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Box>
            ))}

            {projects.length === 0 && (
              <Card size="4" className="glass py-16 flex flex-col items-center justify-center gap-6 text-center">
                <Box style={{ width: '80px', height: '80px' }} className="bg-primary/10 rounded-3xl flex items-center justify-center mb-2 animate-float">
                  <Folder size={40} className="text-primary" />
                </Box>
                <Box>
                  <Heading size="6" mb="1">Platform Initialized</Heading>
                  <Text size="3" color="gray">Create your first project to begin deploying AI agents.</Text>
                </Box>
                <Button size="3" className="bg-primary font-bold px-8 h-12" asChild>
                  <Link href="/admin/projects">Create Your First Project</Link>
                </Button>
              </Card>
            )}
          </Flex>
        )}
      </Section>

      <ScriptTagDialog widget={selectedWidget} open={isScriptModalOpen} onOpenChange={setScriptModalOpen} />

      <Dialog.Root open={isTestModalOpen} onOpenChange={setTestModalOpen}>
        <Dialog.Content maxWidth="450px" style={{ padding: 0, borderRadius: 'var(--radius)', overflow: 'hidden' }} className="bg-transparent shadow-none border-0">
          <Box style={{ height: '80vh', position: 'relative' }}>
            {selectedWidget && (
              <ChatWidgetComponent
                widgetConfig={selectedWidget}
                sessionId={`test-session-${selectedWidget.id}`}
              />
            )}
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialog.Content maxWidth="450px" style={{ borderRadius: 'var(--radius)' }} className="glass">
          <AlertDialog.Title>Decommission Agent?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            This will permanently decommission <Text weight="bold" color="red">{widgetToDelete?.name}</Text>.
            All production traffic to this agent will be terminated immediately. This cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="6" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={async () => {
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
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
