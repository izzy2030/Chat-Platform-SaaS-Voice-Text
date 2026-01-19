'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { toast } from '@/hooks/use-toast';
import {
  Loader2,
  MessageSquare,
  Mic,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

interface Project {
  id: string;
  name: string;
}

export default function CreateWidgetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
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

    fetchProjects();
  }, [user]);

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: '',
      projectId: '',
      type: 'text',
      webhookUrl: '',
      webhookSecret: '',
      allowedDomains: '',
      bubbleColor: '#000000',
      panelColor: '#FFFFFF',
      headerTitle: 'Chat with us!',
      welcomeMessage: 'Hello! How can we help you today?',
      defaultLanguage: 'EN',
      position: 'right',
    },
  });

  const onSubmit = async (data: WidgetFormData) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a widget.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('widgets')
        .insert([{
          name: data.name,
          project_id: data.projectId,
          type: data.type,
          webhook_url: data.webhookUrl,
          allowed_domains: data.allowedDomains.split(',').map(d => d.trim()),
          theme: {
            bubbleColor: data.bubbleColor || '#000000',
            bubbleIcon: data.bubbleIcon || '',
            panelColor: data.panelColor || '#FFFFFF',
            headerTitle: data.headerTitle || '',
            welcomeMessage: data.welcomeMessage || '',
            position: data.position,
          },
          user_id: user.id,
          config: {
            webhookSecret: data.webhookSecret || '',
            defaultLanguage: data.defaultLanguage,
          }
        }]);

      if (error) throw error;

      toast({
        title: 'Widget Created!',
        description: 'Your new chat widget has been created successfully.',
      });
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating widget',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" nativeButton={false} className="mb-8 glass-button-ghost" render={<Link href="/admin" />}>
        &larr; Operations Console
      </Button>

      <div className="glass-card-premium p-8 rounded-lg bg-black/20 border border-white/5 backdrop-blur-xl">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-premium text-vibrant mb-2 tracking-tight">Deploy New Node</h1>
          <p className="text-lg text-premium/40">Configure the parameters for your autonomous communication node.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identity Section */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-premium/50 mb-4 border-b border-white/5 pb-2">System Identity</h3>
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Project Cluster</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-input h-12 w-full">
                                <SelectValue placeholder="Access Cluster..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass border-primary/10 rounded-lg">
                              {isLoadingProjects ? (
                                <SelectItem value="loading" disabled>Loading Clusters...</SelectItem>
                              ) : (
                                projects?.map((project) => (
                                  <SelectItem key={project.id} value={project.id} className="hover:bg-primary/20 focus:bg-primary/20 rounded-lg">
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

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Node Identifier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Primary Support Node" {...field} className="glass-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Interaction Protocol</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <div className="relative">
                                <RadioGroupItem value="text" id="text" className="peer sr-only" />
                                <Label
                                  htmlFor="text"
                                  className="flex flex-col items-center justify-center rounded-lg border border-primary/5 bg-primary/5 p-6 hover:bg-primary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-300"
                                >
                                  <MessageSquare className="mb-2 h-6 w-6 text-primary" />
                                  <span className="text-sm font-bold text-premium">Text Stream</span>
                                </Label>
                              </div>
                              <div className="relative">
                                <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
                                <Label
                                  htmlFor="voice"
                                  className="flex flex-col items-center justify-center rounded-lg border border-primary/5 bg-primary/5 p-6 hover:bg-primary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-300"
                                >
                                  <Mic className="mb-2 h-6 w-6 text-accent" />
                                  <span className="text-sm font-bold text-premium">Voice Matrix</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-premium/50 mb-4 border-b border-white/5 pb-2">Security & Routing</h3>
                  <div className="flex flex-col gap-5">
                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Endpoint URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.matrix.io/endpoint" {...field} className="glass-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allowedDomains"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Authorized Domains</FormLabel>
                          <FormControl>
                            <Input placeholder="matrix.com, nodes.io" {...field} className="glass-input" />
                          </FormControl>
                          <FormDescription className="text-[10px] text-premium/20 mt-1">Comma-separated authorized origin domains.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Branding Section */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-premium/50 mb-4 border-b border-white/5 pb-2">Visual Core</h3>
                    <div className="flex flex-col gap-5">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bubbleColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="glass-label">Interface Accent</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-3 glass-input h-12 px-4 rounded-lg">
                                  <Input type="color" {...field} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer p-0" />
                                  <span className="text-xs text-premium/60 font-mono uppercase">{field.value}</span>
                                </div>
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
                              <FormLabel className="glass-label">Base Surface</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-3 glass-input h-12 px-4 rounded-lg">
                                  <Input type="color" {...field} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer p-0" />
                                  <span className="text-xs text-premium/60 font-mono uppercase">{field.value}</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="headerTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="glass-label">Display Heading</FormLabel>
                            <FormControl>
                              <Input placeholder="Autonomous Interface" {...field} className="glass-input" />
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
                            <FormLabel className="glass-label">Initialization Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="System ready for interaction..." {...field} className="glass-input min-h-[120px] py-4 resize-none" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-premium/50 mb-4 border-b border-white/5 pb-2">Localization</h3>
                    <FormField
                      control={form.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="glass-label">Core Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-input h-12 w-full">
                                <SelectValue placeholder="Select Base Matrix Language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass border-primary/10 rounded-lg">
                              <SelectItem value="EN" className="hover:bg-primary/20 focus:bg-primary/20 rounded-lg">English (EN)</SelectItem>
                              <SelectItem value="ES" className="hover:bg-primary/20 focus:bg-primary/20 rounded-lg">Spanish (ES)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin')} className="glass-button-ghost px-8 h-12 font-bold uppercase tracking-widest text-[11px]">
                Abort Mission
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white px-10 h-12 rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Initialize Node'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
