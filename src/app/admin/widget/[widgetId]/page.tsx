'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Type, Palette, Code, Check, Copy, Globe, FlaskConical, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatWidgetComponent } from '@/components/widget/chat-widget';
import Link from 'next/link';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const widgetSchema = z.object({
  // Content Tab
  name: z.string().min(1, 'Widget Title is required'),
  webhookUrl: z.string().url('Invalid Webhook URL').or(z.string().length(0)),
  recordingRetentionDays: z.number().min(1).max(365),
  headerSubtitle: z.string().optional(),
  welcomeMessage: z.string().optional(),
  placeholderText: z.string().optional(),
  botName: z.string().optional(),
  showBranding: z.boolean().default(true),

  // Design Tab
  accentColor: z.string().optional(),
  headerTextColor: z.string().optional(),
  chatBackgroundColor: z.string().optional(),
  botBubbleBgColor: z.string().optional(),
  botTextColor: z.string().optional(),
  userTextColor: z.string().optional(),
  inputBgColor: z.string().optional(),
  inputTextColor: z.string().optional(),
  inputBorderColor: z.string().optional(),
  borderRadius: z.string().optional(),
  fontFamily: z.string().optional(),
  successConfetti: z.enum(['small-burst', 'firework', 'golden-rain']).default('small-burst'),
});

type WidgetFormData = z.infer<typeof widgetSchema>;

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between group">
    <FormLabel className="text-sm text-muted-foreground font-normal">{label}</FormLabel>
    <div className="flex items-center gap-2">
      <div className="relative h-6 w-6 rounded shadow-sm border border-border overflow-hidden shrink-0">
        <div style={{ backgroundColor: value }} className="absolute inset-0 w-full h-full" />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] p-0 opacity-0 cursor-pointer"
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-[90px] font-mono text-xs uppercase bg-background border-border text-foreground"
      />
    </div>
  </div>
);

function Preview({ widgetId, formValues }: { widgetId: string, formValues: WidgetFormData }) {
  const previewConfig = React.useMemo(() => {
    return {
      id: widgetId,
      webhook_url: '',
      type: 'text' as const,
      theme: {
        // Content
        headerTitle: formValues.name,
        headerSubtitle: formValues.headerSubtitle,
        welcomeMessage: formValues.welcomeMessage,
        placeholderText: formValues.placeholderText,
        botName: formValues.botName,
        showBranding: formValues.showBranding,

        // Design
        accentColor: formValues.accentColor,
        headerTextColor: formValues.headerTextColor,
        chatBackgroundColor: formValues.chatBackgroundColor,
        botBubbleBgColor: formValues.botBubbleBgColor,
        botTextColor: formValues.botTextColor,
        userTextColor: formValues.userTextColor,
        inputBgColor: formValues.inputBgColor,
        inputTextColor: formValues.inputTextColor,
        inputBorderColor: formValues.inputBorderColor,
        borderRadius: formValues.borderRadius,
        fontFamily: formValues.fontFamily,
        successConfetti: formValues.successConfetti,

        // Internal mappings
        primaryColor: formValues.accentColor,
        secondaryColor: formValues.chatBackgroundColor,
      },
    };
  }, [widgetId, formValues]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/30 relative overflow-hidden">
      <div className="mb-8 flex items-center justify-center gap-4 z-10">
        <span className="text-muted-foreground text-sm font-medium">Live Preview</span>
        <Button variant="outline" size="sm" className="rounded-full bg-background text-foreground hover:bg-muted shadow-sm">
          Try it Live
        </Button>
      </div>

      <div className="relative w-[400px] h-[640px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2.5rem] border-[8px] border-[#191C1A] bg-[#191C1A] overflow-hidden z-10 ring-1 ring-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#191C1A] rounded-b-2xl z-20" />
        <div className="w-full h-full bg-background rounded-[1.8rem] overflow-hidden">
          <ChatWidgetComponent
            widgetConfig={previewConfig}
            sessionId="preview-session"
          />
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-6 text-muted-foreground/60">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Active Studio</span>
         </div>
      </div>
    </div>
  );
}

export default function BuilderPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const widget = useQuery(
    api.widgets.getById,
    isLoaded && user ? { id: widgetId as any, userId: user.id } : 'skip'
  );
  
  const updateWidget = useMutation(api.widgets.update);
  const runTestWebhook = useAction(api.widgets.testWebhook);

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: 'My Business Name',
      webhookUrl: '',
      headerSubtitle: 'Ready to help you!',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholderText: 'Type your message...',
      botName: 'AI Assistant',
      showBranding: true,
      
      accentColor: '#3CB993',
      headerTextColor: '#000000',
      chatBackgroundColor: '#ffffff',
      botBubbleBgColor: '#5D5DDF',
      botTextColor: '#E5E5E5',
      userTextColor: '#ffffff',
      inputBgColor: '#27272A',
      inputTextColor: '#E5E5E5',
      inputBorderColor: '#3F3F46',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
    },
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    if (widget) {
      form.reset({
        name: widget.name || 'My Business Name',
        webhookUrl: widget.webhookUrl || '',
        headerSubtitle: widget.theme?.headerSubtitle || 'Ready to help you!',
        welcomeMessage: widget.theme?.welcomeMessage || 'Hi! How can I help you today?',
        placeholderText: widget.theme?.placeholderText || 'Type your message...',
        botName: widget.theme?.botName || 'AI Assistant',
        showBranding: widget.theme?.showBranding ?? true,

        accentColor: widget.theme?.accentColor || '#3CB993',
        headerTextColor: widget.theme?.headerTextColor || '#000000',
        chatBackgroundColor: widget.theme?.chatBackgroundColor || '#ffffff',
        botBubbleBgColor: widget.theme?.botBubbleBgColor || '#5D5DDF',
        botTextColor: widget.theme?.botTextColor || '#E5E5E5',
        userTextColor: widget.theme?.userTextColor || '#ffffff',
        inputBgColor: widget.theme?.inputBgColor || '#27272A',
        inputTextColor: widget.theme?.inputTextColor || '#E5E5E5',
        inputBorderColor: widget.theme?.inputBorderColor || '#3F3F46',
        borderRadius: widget.theme?.borderRadius || '12px',
        fontFamily: widget.theme?.fontFamily || 'Inter, sans-serif',
        successConfetti: widget.theme?.successConfetti || 'small-burst',
      });

      if (widget.config?.recordingRetentionDays !== undefined) {
        form.setValue('recordingRetentionDays', widget.config.recordingRetentionDays);
      }
    }
  }, [widget, form]);

  const onSubmit = async (data: WidgetFormData) => {
    if (!user || !widgetId) return;

    setIsLoading(true);
    try {
      await updateWidget({
        id: widgetId as any,
        userId: user.id,
        name: data.name,
        webhookUrl: data.webhookUrl,
        config: {
          recordingRetentionDays: data.recordingRetentionDays,
        },
        theme: {
          headerTitle: data.name, 
          headerSubtitle: data.headerSubtitle,
          welcomeMessage: data.welcomeMessage,
          placeholderText: data.placeholderText,
          botName: data.botName,
          showBranding: data.showBranding,
          
          accentColor: data.accentColor,
          headerTextColor: data.headerTextColor,
          chatBackgroundColor: data.chatBackgroundColor,
          botBubbleBgColor: data.botBubbleBgColor,
          botTextColor: data.botTextColor,
          userTextColor: data.userTextColor,
          inputBgColor: data.inputBgColor,
          inputTextColor: data.inputTextColor,
          inputBorderColor: data.inputBorderColor,
          borderRadius: data.borderRadius,
          fontFamily: data.fontFamily,
          successConfetti: data.successConfetti,
        },
      });

      toast({
        title: 'Widget Updated',
        description: 'Your widget settings have been saved.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTestWebhook = async () => {
    const url = form.getValues('webhookUrl');
    if (!url) {
      toast({ variant: 'destructive', title: 'Webhook URL Missing', description: 'Please enter a webhook URL first.' });
      return;
    }

    setIsTestingWebhook(true);
    try {
      const result = await runTestWebhook({ webhookUrl: url });
      if (result.success) {
        toast({
          title: 'Webhook Success',
          description: `Received ${result.status} ${result.statusText}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Webhook Failed',
          description: `Result: ${result.status} ${result.statusText}. ${result.body}`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Test Failed',
        description: error.message || 'Could not reach webhook.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (widget === undefined) {
    return (
      <div className="flex justify-center items-center p-12 w-full h-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!widget) return null;

  const currentValues = formValues as WidgetFormData;
  const scriptSnippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-key="${widgetId}" id="chat-widget-script" async></script>`;
  const iframeSnippet = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${widgetId}" style="position:fixed;bottom:0;right:0;width:400px;height:600px;border:none;z-index:99999;" allow="microphone"></iframe>`;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Left Sidebar - Builder */}
      <div className="w-[420px] bg-card border-r border-border flex flex-col shrink-0 z-10">
        
        <div className="h-20 px-8 flex items-center justify-between shrink-0 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full h-8 w-8 text-muted-foreground" nativeButton={false} render={<Link href="/admin/widget" />}>
              &larr;
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Widget Builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isLoading} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="flex flex-col flex-1 min-h-0 w-full px-6 pt-6">
          <TabsList className="w-full bg-muted border border-border/80 rounded-xl p-1.5 h-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="content" className="rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground font-medium tracking-wide shadow-sm">
              <Type className="w-3.5 h-3.5 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="design" className="rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground font-medium tracking-wide shadow-sm">
              <Palette className="w-3.5 h-3.5 mr-2" /> Design
            </TabsTrigger>
            <TabsTrigger value="embed" className="rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground font-medium tracking-wide shadow-sm">
              <Code className="w-3.5 h-3.5 mr-2" /> Embed
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="pb-12">
                
                {/* CONTENT TAB */}
                <TabsContent value="content" className="mt-0 space-y-6 outline-none">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground font-medium">Widget Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground font-medium">Header Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
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
                        <FormLabel className="text-xs text-muted-foreground font-medium">Welcome Message</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="placeholderText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground font-medium">Placeholder Text</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="botName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground font-medium">Bot Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
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
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel className="text-xs text-muted-foreground font-medium mb-0">Webhook URL</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={onTestWebhook}
                            disabled={isTestingWebhook || !field.value}
                          >
                            {isTestingWebhook ? (
                              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            ) : (
                              <FlaskConical className="mr-1.5 h-3 w-3" />
                            )}
                            Test
                          </Button>
                        </div>
                        <FormControl>
                          <div className="relative">
                             <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                             <Input {...field} placeholder="https://api.yoursite.com/webhook" className="h-11 pl-10 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recordingRetentionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground font-medium">Voice Recording Retention (Days)</FormLabel>
                        <FormControl>
                          <div className="relative">
                             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                             <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                className="h-11 pl-10 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" 
                             />
                          </div>
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground italic px-1">
                          Recordings will be automatically deleted after this period. Max 365 days.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showBranding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg p-0 pt-4">
                        <FormLabel className="text-xs text-muted-foreground font-medium mt-0">Show Branding</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* DESIGN TAB */}
                <TabsContent value="design" className="mt-0 space-y-4 outline-none">
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Accent Color" value={field.value || '#10b981'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Header Text" value={field.value || '#ffffff'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chatBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Chat Background" value={field.value || '#ffffff'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="botBubbleBgColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Bot Bubble BG" value={field.value || '#f4f4f5'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="botTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Bot Text" value={field.value || '#18181b'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="User Text" value={field.value || '#ffffff'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inputBgColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Input BG" value={field.value || '#ffffff'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inputTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Input Text" value={field.value || '#18181b'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inputBorderColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker label="Input Border" value={field.value || '#e4e4e7'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 space-y-4 border-t border-border mt-6">
                    <FormField
                      control={form.control}
                      name="borderRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground font-medium">Border Radius</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground font-medium">Font Family</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-lg border-border bg-background text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="successConfetti"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground font-medium">Success Celebration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-lg border-border bg-background text-sm text-foreground">
                                <SelectValue placeholder="Select a celebration style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="small-burst">Small Burst</SelectItem>
                              <SelectItem value="firework">Firework Show</SelectItem>
                              <SelectItem value="golden-rain">Golden Rain</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* EMBED TAB */}
                <TabsContent value="embed" className="mt-0 space-y-6 outline-none">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">API Key</Label>
                    <div className="flex bg-background border border-border rounded-lg overflow-hidden h-11">
                      <div className="flex-1 px-3 flex items-center text-sm font-mono text-foreground truncate">
                        {widgetId}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-none border-l border-border hover:bg-muted text-muted-foreground"
                        onClick={() => copyToClipboard(widgetId, setCopiedKey)}
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Script Tag (Recommended)</Label>
                    <div className="flex bg-background border border-border rounded-lg overflow-hidden h-11 relative group">
                      <div className="flex-1 px-3 flex items-center text-sm font-mono text-foreground overflow-x-auto whitespace-nowrap hide-scrollbar">
                        {scriptSnippet}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-full absolute right-0 bg-background/80 backdrop-blur-sm rounded-none border-l border-border hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(scriptSnippet, setCopiedScript)}
                      >
                        {copiedScript ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">iFrame Embed</Label>
                    <div className="relative border border-border rounded-lg bg-background p-3 pt-8 group">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(iframeSnippet, setCopiedIframe)}
                      >
                        {copiedIframe ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all hide-scrollbar">
                        {iframeSnippet}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Right - Preview Area */}
      <div className="flex-1 bg-muted/30 flex flex-col min-w-0">
        <Preview widgetId={widgetId} formValues={currentValues} />
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
