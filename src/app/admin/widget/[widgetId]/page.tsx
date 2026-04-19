'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Loader2, Type, Palette, Code, Check, Copy, Globe, FlaskConical, Clock, Sparkles, ArrowLeft } from 'lucide-react';
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
import { useDebouncedAutosave } from '@/hooks/use-debounced-autosave';
import confetti from 'canvas-confetti';

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
  <div className="flex items-center justify-between group py-1">
    <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">{label}</FormLabel>
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5 rounded-sm shadow-sm border border-border/60 overflow-hidden shrink-0">
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
        className="h-7 w-[80px] font-mono text-[10px] uppercase bg-background border-border/60 text-foreground/80 px-2"
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
    <div className="w-full h-full flex flex-col items-center justify-start py-12 bg-muted/30 relative overflow-y-auto pretty-scrollbar">
      <div className="mb-6 flex items-center justify-between w-[400px] z-10 shrink-0 px-2">
        <div className="flex flex-col">
          <span className="text-foreground/80 text-[11px] font-bold uppercase tracking-[0.15em] leading-none">Live Preview</span>
          <span className="text-[9px] text-muted-foreground/50 font-medium mt-1">Real-time Rendering</span>
        </div>
        <Button size="sm" className="h-7 rounded-[4px_10px_4px_10px] border border-border/40 bg-background text-[10px] font-bold uppercase tracking-wider text-foreground/80 hover:bg-muted hover:text-foreground shadow-sm px-3 transition-all">
          Try it Live
        </Button>
      </div>

      <div className="relative w-[400px] h-[640px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[2.5rem] border-[10px] border-[#191C1A] bg-[#191C1A] overflow-hidden z-10 ring-1 ring-white/10 shrink-0 mb-12 isolate" style={{ colorScheme: 'light' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#191C1A] rounded-b-2xl z-20" />
        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[1.6rem] overflow-hidden light text-zinc-900 override-light-mode">
          <ChatWidgetComponent
            widgetConfig={previewConfig}
            sessionId="preview-session"
          />
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
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hasHydratedRef = React.useRef(false);
  const { user, isLoaded } = useUser();

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
      recordingRetentionDays: 60,
      
      accentColor: '#3b8332',
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
      successConfetti: 'small-burst',
    },
  });

  const formValues = useWatch({ control: form.control });

  const persistWidget = React.useCallback(
    async (data: WidgetFormData, showSuccessToast: boolean) => {
      if (!user || !widgetId) return;

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

      if (showSuccessToast) {
        toast({
          title: 'Widget Updated',
          description: 'Your widget settings have been saved.',
        });
      }
    },
    [updateWidget, user, widgetId]
  );

  const autosave = useDebouncedAutosave<WidgetFormData>({
    value: formValues as WidgetFormData,
    enabled: Boolean(user && widget && hasHydratedRef.current),
    isDirty: form.formState.isDirty,
    delayMs: 900,
    resetKey: widgetId,
    onSave: async (nextValues) => {
      const valid = await form.trigger();
      if (!valid) {
        return;
      }
      await persistWidget(nextValues, false);
      form.reset(nextValues);
      setLastSavedAt(new Date());
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Autosave failed.';
      toast({
        variant: 'destructive',
        title: 'Autosave Failed',
        description: message,
      });
    },
  });

  useEffect(() => {
    if (widget && !hasHydratedRef.current) {
      const initialValues: WidgetFormData = {
        name: widget.name || 'My Business Name',
        webhookUrl: widget.webhookUrl || '',
        headerSubtitle: widget.theme?.headerSubtitle || 'Ready to help you!',
        welcomeMessage: widget.theme?.welcomeMessage || 'Hi! How can I help you today?',
        placeholderText: widget.theme?.placeholderText || 'Type your message...',
        botName: widget.theme?.botName || 'AI Assistant',
        showBranding: widget.theme?.showBranding ?? true,

        accentColor: widget.theme?.accentColor || '#3b8332',
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
        recordingRetentionDays: widget.config?.recordingRetentionDays ?? 60,
      };
      form.reset(initialValues);
      autosave.markPersisted(initialValues);
      hasHydratedRef.current = true;
    }
  }, [autosave, form, widget]);

  const onSubmit = async (data: WidgetFormData) => {
    if (!user || !widgetId) return;

    setIsLoading(true);
    try {
      await persistWidget(data, true);
      form.reset(data);
      autosave.markPersisted(data);
      setLastSavedAt(new Date());
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
  const autosaveMeta =
    autosave.status === 'saving'
      ? {
          label: 'Saving',
          detail: 'Syncing',
          className: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 shadow-sm',
          dotClassName: 'bg-emerald-500 animate-pulse',
        }
      : autosave.status === 'pending'
        ? {
            label: 'Changed',
            detail: 'Pending',
            className: 'border-amber-500/20 bg-amber-500/5 text-amber-600 shadow-sm',
            dotClassName: 'bg-amber-500 animate-pulse',
          }
        : autosave.status === 'error'
          ? {
              label: 'Retrying',
              detail: 'Error',
              className: 'border-rose-500/20 bg-rose-500/5 text-rose-600 shadow-sm',
              dotClassName: 'bg-rose-500',
            }
          : {
              label: 'Saved',
              detail: lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Live',
              className: 'border-emerald-500/10 bg-emerald-500/5 text-emerald-600/80 shadow-none',
              dotClassName: 'bg-emerald-500/40',
            };
  const scriptSnippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-key="${widgetId}" id="chat-widget-script" async></script>`;
  const iframeSnippet = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${widgetId}" style="position:fixed;bottom:0;right:0;width:400px;height:600px;border:none;z-index:99999;" allow="microphone"></iframe>`;

  return (
    <div className="flex h-svh max-h-svh bg-background text-foreground overflow-hidden font-sans">
      
      {/* Left Sidebar - Builder */}
      <div className="w-[420px] bg-card border-r border-border flex flex-col h-full overflow-hidden shrink-0 z-10">
        
        <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full h-8 w-8 text-muted-foreground/60 transition-colors" nativeButton={false} render={<Link href="/admin/widget" />}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-[13px] font-bold text-foreground/90 uppercase tracking-[0.15em] leading-none">Studio</h1>
              <span className="text-[10px] text-muted-foreground/50 font-medium mt-1">Widget Configurator</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-[8px_2px_8px_2px] border px-2 py-1 transition-all duration-300 ${autosaveMeta.className}`}
              aria-live="polite"
            >
              <div className={`h-1.5 w-1.5 rounded-full ${autosaveMeta.dotClassName}`} />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="text-[9px] font-bold uppercase tracking-wider">{autosaveMeta.label}</span>
                <span className="text-[9px] font-medium opacity-60">{autosaveMeta.detail}</span>
              </div>
            </div>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isLoading} 
              className="h-8 rounded-[4px_12px_4px_12px] bg-foreground text-background px-4 text-[11px] font-bold uppercase tracking-wider shadow-none transition-all hover:bg-foreground/90 hover:text-background hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-3 w-3" />
              )}
              Save
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="flex flex-col flex-1 min-h-0 w-full px-6 pt-4">
          <TabsList className="w-full bg-muted/50 border border-border/20 rounded-[10px_3px_10px_3px] p-1 h-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="content" className="rounded-[8px_2px_8px_2px] text-[10px] py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground/60 font-bold uppercase tracking-wider shadow-none transition-all">
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="rounded-[8px_2px_8px_2px] text-[10px] py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground/60 font-bold uppercase tracking-wider shadow-none transition-all">
              Design
            </TabsTrigger>
            <TabsTrigger value="embed" className="rounded-[8px_2px_8px_2px] text-[10px] py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground/60 font-bold uppercase tracking-wider shadow-none transition-all">
              Embed
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pretty-scrollbar -mx-6 px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="pb-12">
                
                {/* CONTENT TAB */}
                <TabsContent value="content" className="mt-0 space-y-6 outline-none">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Widget Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Header Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Welcome Message</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Placeholder Text</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Bot Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mb-0">Webhook URL</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-500/5 hover:text-emerald-500 transition-colors"
                            onClick={onTestWebhook}
                            disabled={isTestingWebhook || !field.value}
                          >
                            {isTestingWebhook ? (
                              <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <FlaskConical className="mr-1 h-2.5 w-2.5" />
                            )}
                            Test
                          </Button>
                        </div>
                        <FormControl>
                          <div className="relative">
                             <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                             <Input {...field} placeholder="https://api.yoursite.com/webhook" className="h-9 pl-8 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
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
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Voice Retention (Days)</FormLabel>
                        <FormControl>
                          <div className="relative">
                             <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                             <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                className="h-9 pl-8 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" 
                             />
                          </div>
                        </FormControl>
                        <p className="text-[9px] text-muted-foreground/40 italic px-1">
                          Recordings auto-delete after this period. Max 365.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showBranding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg p-0 pt-2">
                        <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mt-0">Branding</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="scale-75"
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
                          <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Border Radius</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Font Family</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="successConfetti"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-xs text-muted-foreground font-medium mb-0">Success Celebration</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => {
                                const style = field.value || 'small-burst';
                                if (style === 'small-burst') {
                                  confetti({
                                    particleCount: 100,
                                    spread: 70,
                                    origin: { y: 0.6 },
                                    colors: [form.getValues('accentColor') || '#3b8332', '#ffffff', '#5D5DDF']
                                  });
                                } else if (style === 'firework') {
                                  const duration = 3 * 1000;
                                  const animationEnd = Date.now() + duration;
                                  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
                                  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
                                  const interval: any = setInterval(function() {
                                    const timeLeft = animationEnd - Date.now();
                                    if (timeLeft <= 0) return clearInterval(interval);
                                    const particleCount = 50 * (timeLeft / duration);
                                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                                  }, 250);
                                } else if (style === 'golden-rain') {
                                  const end = Date.now() + (3 * 1000);
                                  const colors = ['#ffd700', '#ffa500', '#ff8c00'];
                                  (function frame() {
                                    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
                                    confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
                                    if (Date.now() < end) requestAnimationFrame(frame);
                                  }());
                                }
                              }}
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              Test
                            </Button>
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 rounded-lg border-border/60 bg-background text-[13px] text-foreground shadow-none transition-all">
                                <SelectValue placeholder="Style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="small-burst" className="text-[13px]">Small Burst</SelectItem>
                              <SelectItem value="firework" className="text-[13px]">Firework Show</SelectItem>
                              <SelectItem value="golden-rain" className="text-[13px]">Golden Rain</SelectItem>
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
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">API Key</Label>
                    <div className="flex bg-background border border-border/60 rounded-lg overflow-hidden h-9">
                      <div className="flex-1 px-3 flex items-center text-[12px] font-mono text-foreground/80 truncate">
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

                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Script Tag</Label>
                    <div className="flex bg-background border border-border/60 rounded-lg overflow-hidden h-9 relative group">
                      <div className="flex-1 px-3 flex items-center text-[12px] font-mono text-foreground/80 overflow-x-auto whitespace-nowrap hide-scrollbar">
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
          </div>
        </Tabs>
      </div>

      {/* Right - Preview Area */}
      <div className="flex-1 bg-muted/30 flex flex-col min-w-0">
        <Preview widgetId={widgetId} formValues={currentValues} />
      </div>
    </div>
  );
}

