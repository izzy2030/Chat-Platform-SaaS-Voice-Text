'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare, Mic, Save, Eye, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatWidgetComponent } from '@/components/widget/chat-widget';

const widgetSchema = z.object({
  name: z.string().min(1, 'Widget Name is required'),
  projectId: z.string().min(1, 'Please select a project'),
  type: z.enum(['text', 'voice']).default('text'),
  webhookUrl: z.string().url('Please enter a valid URL'),
  webhookSecret: z.string().optional(),
  allowedDomains: z.string().min(1, 'At least one domain is required'),
  bubbleColor: z.string().optional(),
  bubbleIcon: z.string().optional(),
  panelColor: z.string().optional(),
  headerTitle: z.string().optional(),
  welcomeMessage: z.string().optional(),
  defaultLanguage: z.enum(['EN', 'ES']).default('EN'),
  position: z.enum(['left', 'right']).default('right'),
});

type WidgetFormData = z.infer<typeof widgetSchema>;

interface ChatWidget {
  id: string;
  name: string;
  project_id: string;
  type?: 'text' | 'voice';
  webhook_url: string;
  allowed_domains: string[];
  theme: {
    bubbleColor?: string;
    bubbleIcon?: string;
    panelColor?: string;
    headerTitle?: string;
    welcomeMessage?: string;
    position?: 'left' | 'right';
  };
  user_id: string;
  config?: {
    webhookSecret?: string;
    defaultLanguage?: 'EN' | 'ES';
  }
}

interface Project {
  id: string;
  name: string;
}

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-3">
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-sm hover:scale-105 transition-all duration-200 border-2 border-white ring-1 ring-border cursor-pointer bg-[url('https://transparenttextures.com/patterns/checkerboard.png')]">
        <div
          style={{ backgroundColor: value }}
          className="absolute inset-0 w-full h-full"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] p-0 opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm h-9 uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  </div>
);

function Preview({ widgetId, formValues }: { widgetId: string, formValues: WidgetFormData }) {
  // Construct a preview config that matches what ChatWidgetComponent expects
  const previewConfig = React.useMemo(() => {
    return {
      id: widgetId,
      webhook_url: formValues.webhookUrl || '',
      theme: {
        primaryColor: formValues.bubbleColor,
        secondaryColor: formValues.panelColor,
        headerTitle: formValues.headerTitle,
        bubbleMessage: formValues.welcomeMessage,
      },
      brand: { // Legacy fallback if needed
        welcomeMessage: formValues.welcomeMessage
      },
    };
  }, [widgetId, formValues]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 relative overflow-hidden rounded-2xl border border-border/40 shadow-inner">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Mock Window / Device Frame */}
      <div className={`relative transition-all duration-500 ease-in-out w-[380px] h-[600px] shadow-2xl rounded-[3rem] border-[8px] border-white bg-white overflow-hidden ring-1 ring-black/5`}>
        {/* Status Bar */}
        <div className="h-6 w-full bg-white flex items-center justify-between px-6 z-10 relative">
          <div className="text-[10px] font-bold">9:41</div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-black/10 rounded-full" />
            <div className="w-3 h-3 bg-black/10 rounded-full" />
          </div>
        </div>

        <ChatWidgetComponent
          widgetConfig={previewConfig}
          sessionId="preview-session"
        />
      </div>
    </div>
  );
}

export default function EditWidgetPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const [widget, setWidget] = useState<ChatWidget | null>(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchWidget = async () => {
      if (!user || !widgetId) return;
      setIsWidgetLoading(true);
      try {
        const { data, error } = await supabase
          .from('widgets')
          .select('*')
          .eq('id', widgetId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setWidget(data);
      } catch (error: any) {
        console.error('Error fetching widget:', error);
      } finally {
        setIsWidgetLoading(false);
      }
    };

    const fetchProjects = async () => {
      if (!user) return;
      setIsLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setProjects(data || []);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error loading projects', description: error.message });
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchWidget();
    fetchProjects();
  }, [user, widgetId]);

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: '',
      projectId: '',
      type: 'text',
      webhookUrl: '',
      webhookSecret: '',
      allowedDomains: '',
      bubbleColor: '#94B4E4',
      panelColor: '#F0F4F8',
      headerTitle: 'Chat with us!',
      welcomeMessage: 'Hello! How can we help you today?',
      defaultLanguage: 'EN',
      position: 'right',
    },
  });

  // Watch all values for real-time preview
  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    if (widget) {
      const defaults = {
        name: widget.name || '',
        projectId: widget.project_id || '',
        type: widget.type || 'text',
        webhookUrl: widget.webhook_url || '',
        webhookSecret: widget.config?.webhookSecret || '',
        allowedDomains: Array.isArray(widget.allowed_domains) ? widget.allowed_domains.join(', ') : '',
        bubbleColor: widget.theme?.bubbleColor || '#94B4E4',
        bubbleIcon: widget.theme?.bubbleIcon || '',
        panelColor: widget.theme?.panelColor || '#F0F4F8',
        headerTitle: widget.theme?.headerTitle || 'Chat with us!',
        welcomeMessage: widget.theme?.welcomeMessage || 'Hello! How can we help you today?',
        defaultLanguage: widget.config?.defaultLanguage || 'EN',
        position: widget.theme?.position || 'right',
      };
      form.reset(defaults);
    }
  }, [widget, form]);

  const onSubmit = async (data: WidgetFormData) => {
    if (!user || !widgetId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update a widget.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('widgets')
        .update({
          name: data.name,
          project_id: data.projectId,
          type: data.type,
          webhook_url: data.webhookUrl,
          allowed_domains: data.allowedDomains.split(',').map(d => d.trim()),
          theme: {
            bubbleColor: data.bubbleColor || '',
            bubbleIcon: data.bubbleIcon || '',
            panelColor: data.panelColor || '',
            headerTitle: data.headerTitle || '',
            welcomeMessage: data.welcomeMessage || '',
            position: data.position,
          },
          config: {
            webhookSecret: data.webhookSecret || '',
            defaultLanguage: data.defaultLanguage,
          }
        })
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Widget Updated!',
        description: 'Your chat widget has been updated successfully.',
      });

      // Optional: Refresh local state or router
      // router.refresh(); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating widget',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isWidgetLoading) {
    return (
      <div className="flex justify-center p-12 w-full h-full align-middle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!widget) return null;

  // We type cast formValues to WidgetFormData because useWatch returns Partial<DeepPartial<T>>
  // but we know it's seeded with default values.
  const currentValues = formValues as WidgetFormData;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-8 md:-m-12">
      {/* Header */}
      <div className="h-16 border-b bg-white/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/admin" />}>
            <span className="sr-only">Back</span>&larr;
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Widget Studio</h1>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Live Preview
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-[400px] border-r bg-white flex flex-col shrink-0 z-10 shadow-xl shadow-black/5">
          <Tabs defaultValue="visuals" className="w-full flex flex-col h-full">
            <div className="px-6 py-4 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="visuals">Design</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="visuals" className="space-y-8 mt-0 data-[state=inactive]:hidden">
                      {/* Color Section */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Color Palette</h3>
                          <div className="h-px bg-border flex-1"></div>
                        </div>

                        <FormField
                          control={form.control}
                          name="bubbleColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ColorPicker label="Primary Brand Color" value={field.value || '#94B4E4'} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="panelColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ColorPicker label="Background / Secondary" value={field.value || '#F0F4F8'} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>

                      {/* Text Section */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Messaging</h3>
                          <div className="h-px bg-border flex-1"></div>
                        </div>

                        <FormField
                          control={form.control}
                          name="headerTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Header Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Chat with us" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="welcomeMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Welcome Message</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Hi there!" className="min-h-[80px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>

                      {/* Positioning */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Position</h3>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="left" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">Bottom Left</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="right" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">Bottom Right</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-8 mt-0 data-[state=inactive]:hidden">
                      {/* Identity Section */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Identity</h3>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Widget Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="projectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingProjects ? (
                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                  ) : (
                                    projects?.map((project) => (
                                      <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>

                      {/* Configuration */}
                      <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Configuration</h3>
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interaction Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <div>
                                    <RadioGroupItem value="text" id="text" className="peer sr-only" />
                                    <Label
                                      htmlFor="text"
                                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                      <MessageSquare className="mb-2 h-5 w-5" />
                                      Text
                                    </Label>
                                  </div>
                                  <div>
                                    <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
                                    <Label
                                      htmlFor="voice"
                                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                      <Mic className="mb-2 h-5 w-5" />
                                      Voice
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allowedDomains"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allowed Domains</FormLabel>
                              <FormControl>
                                <Input placeholder="example.com" {...field} />
                              </FormControl>
                              <FormDescription>Comma-separated list of allowed hostnames.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="webhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="defaultLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="EN">English</SelectItem>
                                  <SelectItem value="ES">Spanish</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </section>
                    </TabsContent>
                  </form>
                </Form>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right - Preview Area */}
        <div className="flex-1 bg-gray-50/50 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden relative">
            <Preview widgetId={widgetId} formValues={currentValues} />
          </div>
        </div>
      </div>
    </div>
  );
}
