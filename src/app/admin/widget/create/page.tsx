'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Mic } from 'lucide-react';
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
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/projects`));
  }, [firestore, user]);

  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsQuery);

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
      const chatWidgetsCollection = collection(
        firestore,
        `users/${user.uid}/chatWidgets`
      );
      
      const newWidget = {
        name: data.name,
        projectId: data.projectId,
        type: data.type,
        webhookUrl: data.webhookUrl,
        webhookSecret: data.webhookSecret || '',
        allowedDomains: data.allowedDomains.split(',').map(d => d.trim()),
        brand: {
          bubbleColor: data.bubbleColor || '#000000',
          bubbleIcon: data.bubbleIcon || '',
          panelColor: data.panelColor || '#FFFFFF',
          headerTitle: data.headerTitle || '',
          welcomeMessage: data.welcomeMessage || '',
          position: data.position,
        },
        behavior: {
          defaultLanguage: data.defaultLanguage,
        },
        userId: user.uid,
      };

      await addDocumentNonBlocking(chatWidgetsCollection, newWidget);

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
     <div className="flex justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <Button asChild variant="outline" className="mb-4">
           <Link href="/admin">
            &larr; Back to Dashboard
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Create New Chat Widget</CardTitle>
            <CardDescription>
              Fill in the details to configure your new chat widget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Identity</h3>
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project for this widget" />
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Widget Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Queens Auto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Widget Type</FormLabel>
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
                                  <MessageSquare className="mb-3 h-6 w-6" />
                                  Text Chat
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
                                <Label
                                  htmlFor="voice"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <Mic className="mb-3 h-6 w-6" />
                                  Voice Agent
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
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
                            <Input placeholder="https://api.example.com/webhook" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="webhookSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••••••••" {...field} />
                          </FormControl>
                           <FormDescription>
                            Optional, but recommended for verifying webhook authenticity.
                          </FormDescription>
                          <FormMessage />
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
                            <Input placeholder="example.com, my-site.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of domains where this widget can be embedded.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Branding</h3>
                     <FormField
                      control={form.control}
                      name="bubbleColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bubble Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bubbleIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bubble Icon (Emoji or URL)</FormLabel>
                          <FormControl>
                            <Input placeholder="💬 or https://example.com/icon.png" {...field} />
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
                          <FormLabel>Panel Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="headerTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Chat with Queens Auto" {...field} />
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
                            <Textarea placeholder="Hello! How can we help you today?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Widget Position</FormLabel>
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
                                <FormLabel className="font-normal">Left</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="right" />
                                </FormControl>
                                <FormLabel className="font-normal">Right</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <h3 className="text-lg font-medium pt-4">Behavior</h3>
                     <FormField
                      control={form.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EN">English</SelectItem>
                              <SelectItem value="ES">Spanish</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => router.push('/admin')}>Cancel</Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Widget
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
