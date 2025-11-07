'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import Link from 'next/link';

const widgetSchema = z.object({
  name: z.string().min(1, 'Widget Name is required'),
  webhookUrl: z.string().url('Please enter a valid URL'),
  webhookSecret: z.string().min(1, 'Webhook Secret is required'),
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
  webhookUrl: string;
  webhookSecret: string;
  allowedDomains: string[];
  brand: {
    bubbleColor?: string;
    bubbleIcon?: string;
    panelColor?: string;
    headerTitle?: string;
    welcomeMessage?: string;
    position?: 'left' | 'right';
  };
  behavior: {
    defaultLanguage?: 'EN' | 'ES';
  };
  userId: string;
}

export default function EditWidgetPage({
  params,
}: {
  params: { widgetId: string };
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const widgetDocRef = useMemoFirebase(() => {
    if (!user || !params.widgetId) return null;
    return doc(firestore, `users/${user.uid}/chatWidgets/${params.widgetId}`);
  }, [firestore, user, params.widgetId]);

  const { data: widget, isLoading: isWidgetLoading } =
    useDoc<ChatWidget>(widgetDocRef);

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: '',
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

  React.useEffect(() => {
    if (widget) {
      form.reset({
        name: widget.name,
        webhookUrl: widget.webhookUrl,
        webhookSecret: widget.webhookSecret,
        allowedDomains: widget.allowedDomains.join(', '),
        bubbleColor: widget.brand?.bubbleColor,
        bubbleIcon: widget.brand?.bubbleIcon,
        panelColor: widget.brand?.panelColor,
        headerTitle: widget.brand?.headerTitle,
        welcomeMessage: widget.brand?.welcomeMessage,
        defaultLanguage: widget.behavior?.defaultLanguage,
        position: widget.brand?.position,
      });
    }
  }, [widget, form]);

  const onSubmit = async (data: WidgetFormData) => {
    if (!user || !widgetDocRef) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to update a widget.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const updatedWidget = {
        name: data.name,
        webhookUrl: data.webhookUrl,
        webhookSecret: data.webhookSecret,
        allowedDomains: data.allowedDomains.split(',').map(d => d.trim()),
        brand: {
          bubbleColor: data.bubbleColor,
          bubbleIcon: data.bubbleIcon,
          panelColor: data.panelColor,
          headerTitle: data.headerTitle,
          welcomeMessage: data.welcomeMessage,
          position: data.position,
        },
        behavior: {
          defaultLanguage: data.defaultLanguage,
        },
        userId: user.uid,
      };

      await updateDocumentNonBlocking(widgetDocRef, updatedWidget);

      toast({
        title: 'Widget Updated!',
        description: 'Your chat widget has been updated successfully.',
      });
      router.push('/admin');
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
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!widget) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Widget Not Found</CardTitle>
            <CardDescription>
              The widget you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin">Go Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle>Edit Chat Widget</CardTitle>
            <CardDescription>
              Update the settings for your chat widget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Identity</h3>
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
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://api.example.com/webhook"
                              {...field}
                            />
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
                            <Input
                              type="password"
                              placeholder="••••••••••••••"
                              {...field}
                            />
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
                          <FormLabel>Allowed Domains</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example.com, my-site.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of domains where this widget
                            can be embedded.
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
                            <Input
                              placeholder="💬 or https://example.com/icon.png"
                              {...field}
                            />
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
                            <Input
                              placeholder="Chat with Queens Auto"
                              {...field}
                            />
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
                            <Textarea
                              placeholder="Hello! How can we help you today?"
                              {...field}
                            />
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
                                <FormLabel className="font-normal">
                                  Left
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="right" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Right
                                </FormLabel>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/admin')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
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
