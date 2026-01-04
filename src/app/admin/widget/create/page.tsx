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
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid
} from '@radix-ui/themes';

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
    <Box className="w-full max-w-5xl mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-8 glass-button-ghost">
        <Link href="/admin">
          &larr; Operations Console
        </Link>
      </Button>

      <Box className="glass-card-premium">
        <Box mb="8">
          <Heading size="8" className="font-display font-bold text-premium text-vibrant mb-2">Deploy New Node</Heading>
          <Text size="3" className="text-premium/40">Configure the parameters for your autonomous communication node.</Text>
        </Box>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <Grid columns={{ initial: '1', md: '2' }} gap="8">
              {/* Identity Section */}
              <Flex direction="column" gap="6">
                <Box>
                  <Heading size="3" className="glass-label mb-4 border-b pb-2 glass-separator">System Identity</Heading>
                  <Flex direction="column" gap="6">
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
                            <SelectContent className="glass border-primary/10 rounded-xl">
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
                              <Box>
                                <RadioGroupItem value="text" id="text" className="peer sr-only" />
                                <Label
                                  htmlFor="text"
                                  className="flex flex-col items-center justify-center rounded-2xl border border-primary/5 bg-primary/5 p-6 hover:bg-primary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-300"
                                >
                                  <MessageSquare className="mb-2 h-6 w-6 text-primary" />
                                  <Text size="2" weight="bold" className="text-premium">Text Stream</Text>
                                </Label>
                              </Box>
                              <Box>
                                <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
                                <Label
                                  htmlFor="voice"
                                  className="flex flex-col items-center justify-center rounded-2xl border border-primary/5 bg-primary/5 p-6 hover:bg-primary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-300"
                                >
                                  <Mic className="mb-2 h-6 w-6 text-accent" />
                                  <Text size="2" weight="bold" className="text-premium">Voice Matrix</Text>
                                </Label>
                              </Box>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Flex>
                </Box>

                <Box>
                  <Heading size="3" className="glass-label mb-4 border-b pb-2 glass-separator">Security & Routing</Heading>
                  <Flex direction="column" gap="5">
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
                  </Flex>
                </Box>
              </Flex>

              {/* Branding Section */}
              <Flex direction="column" gap="6">
                <Box>
                  <Heading size="3" className="glass-label mb-4 border-b pb-2 glass-separator">Visual Core</Heading>
                  <Flex direction="column" gap="5">
                    <Grid columns="2" gap="4">
                      <FormField
                        control={form.control}
                        name="bubbleColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="glass-label">Interface Accent</FormLabel>
                            <FormControl>
                              <Flex align="center" gap="3" className="glass-input">
                                <Input type="color" {...field} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                                <Text size="1" className="text-premium/60 font-mono uppercase">{field.value}</Text>
                              </Flex>
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
                              <Flex align="center" gap="3" className="glass-input">
                                <Input type="color" {...field} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                                <Text size="1" className="text-premium/60 font-mono uppercase">{field.value}</Text>
                              </Flex>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Grid>

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
                  </Flex>
                </Box>

                <Box>
                  <Heading size="3" className="glass-label mb-4 border-b pb-2 glass-separator">Localization</Heading>
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
                          <SelectContent className="glass border-primary/10 rounded-xl">
                            <SelectItem value="EN" className="hover:bg-primary/20 focus:bg-primary/20 rounded-lg">English (EN)</SelectItem>
                            <SelectItem value="ES" className="hover:bg-primary/20 focus:bg-primary/20 rounded-lg">Spanish (ES)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Box>
              </Flex>
            </Grid>

            <Flex justify="end" gap="4" pt="8" className="border-t glass-separator">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin')} className="glass-button-ghost px-8 h-12 font-bold uppercase tracking-widest text-[11px]">
                Abort Mission
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white px-10 h-12 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Initialize Node'}
              </Button>
            </Flex>
          </form>
        </Form>
      </Box>
    </Box>
  );
}
