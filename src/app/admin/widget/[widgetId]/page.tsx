'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Type, Palette, Code, Check, Copy } from 'lucide-react';
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

const widgetSchema = z.object({
  // Content Tab
  name: z.string().min(1, 'Widget Title is required'),
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
});

type WidgetFormData = z.infer<typeof widgetSchema>;

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between group">
    <FormLabel className="text-sm text-zinc-400 font-normal">{label}</FormLabel>
    <div className="flex items-center gap-2">
      <div className="relative h-6 w-6 rounded shadow-sm border border-zinc-800 overflow-hidden shrink-0">
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
        className="h-8 w-[90px] font-mono text-xs uppercase bg-zinc-900 border-zinc-800 text-zinc-300"
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
        // Map form values to the component's expected theme properties
        primaryColor: formValues.accentColor,
        secondaryColor: formValues.chatBackgroundColor,
        headerTitle: formValues.name,
        headerTitleColor: formValues.headerTextColor,
        headerSubtext: formValues.headerSubtitle,
        bubbleMessage: formValues.welcomeMessage,
        fontFamily: formValues.fontFamily,
        // The component might need these explicit names based on how it's built internally
        darkPrimaryColor: formValues.accentColor,
        darkSecondaryColor: formValues.chatBackgroundColor,
      },
    };
  }, [widgetId, formValues]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0a] relative overflow-hidden">
      <div className="mb-8 flex items-center justify-center gap-4 z-10">
        <span className="text-zinc-500 text-sm">Preview</span>
        <Button variant="outline" size="sm" className="rounded-full border-zinc-800 bg-transparent text-white hover:bg-zinc-900">
          Try it Live
        </Button>
      </div>

      <div className="relative w-[380px] h-[600px] shadow-2xl rounded-2xl border border-zinc-800/50 bg-[#18181b] overflow-hidden z-10">
        <ChatWidgetComponent
          widgetConfig={previewConfig}
          sessionId="preview-session"
        />
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

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      name: 'Chat with BuildLoop AI',
      headerSubtitle: 'Online',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholderText: 'Type your message...',
      botName: 'AI Assistant',
      showBranding: true,
      
      accentColor: '#e4ff04',
      headerTextColor: '#ffffff',
      chatBackgroundColor: '#18181b',
      botBubbleBgColor: '#27272a',
      botTextColor: '#e5e5e5',
      userTextColor: '#ffffff',
      inputBgColor: '#27272a',
      inputTextColor: '#e5e5e5',
      inputBorderColor: '#3f3f46',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
    },
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    if (widget) {
      form.reset({
        name: widget.name || 'Chat with BuildLoop AI',
        headerSubtitle: widget.theme?.headerSubtitle || 'Online',
        welcomeMessage: widget.theme?.welcomeMessage || 'Hi! How can I help you today?',
        placeholderText: widget.theme?.placeholderText || 'Type your message...',
        botName: widget.theme?.botName || 'AI Assistant',
        showBranding: widget.theme?.showBranding ?? true,

        accentColor: widget.theme?.accentColor || '#e4ff04',
        headerTextColor: widget.theme?.headerTextColor || '#ffffff',
        chatBackgroundColor: widget.theme?.chatBackgroundColor || '#18181b',
        botBubbleBgColor: widget.theme?.botBubbleBgColor || '#27272a',
        botTextColor: widget.theme?.botTextColor || '#e5e5e5',
        userTextColor: widget.theme?.userTextColor || '#ffffff',
        inputBgColor: widget.theme?.inputBgColor || '#27272a',
        inputTextColor: widget.theme?.inputTextColor || '#e5e5e5',
        inputBorderColor: widget.theme?.inputBorderColor || '#3f3f46',
        borderRadius: widget.theme?.borderRadius || '12px',
        fontFamily: widget.theme?.fontFamily || 'Inter, sans-serif',
      });
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
        theme: {
          headerTitle: data.name, // Keep legacy fields in sync
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

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (widget === undefined) {
    return (
      <div className="flex justify-center items-center p-12 w-full h-full bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!widget) return null;

  const currentValues = formValues as WidgetFormData;
  const scriptSnippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-key="${widgetId}" id="chat-widget-script" async></script>`;
  const iframeSnippet = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${widgetId}" style="position:fixed;bottom:0;right:0;width:400px;height:600px;border:none;z-index:99999;" allow="microphone"></iframe>`;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* Left Sidebar - Builder */}
      <div className="w-[420px] bg-[#121214] border-r border-zinc-800 flex flex-col shrink-0 z-10">
        
        <div className="h-20 px-8 flex items-center justify-between shrink-0 border-b border-zinc-800/50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-full h-8 w-8 text-zinc-400" nativeButton={false} render={<Link href="/admin/widget" />}>
              &larr;
            </Button>
            <h1 className="text-xl font-semibold text-zinc-100">Widget Builder</h1>
          </div>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading} 
            className="bg-[#10b981] hover:bg-[#059669] text-black font-semibold h-9 px-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save'}
          </Button>
        </div>

        <Tabs defaultValue="content" className="flex flex-col flex-1 min-h-0 w-full px-6 pt-6">
          <TabsList className="w-full bg-[#18181b] border border-zinc-800/80 rounded-xl p-1.5 h-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="content" className="rounded-lg text-xs py-2 data-[state=active]:bg-[#27272a] data-[state=active]:text-white text-zinc-400 font-medium tracking-wide">
              <Type className="w-3.5 h-3.5 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="design" className="rounded-lg text-xs py-2 data-[state=active]:bg-[#27272a] data-[state=active]:text-white text-zinc-400 font-medium tracking-wide">
              <Palette className="w-3.5 h-3.5 mr-2" /> Design
            </TabsTrigger>
            <TabsTrigger value="embed" className="rounded-lg text-xs py-2 data-[state=active]:bg-[#27272a] data-[state=active]:text-white text-zinc-400 font-medium tracking-wide">
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
                        <FormLabel className="text-xs text-zinc-400 font-medium">Widget Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
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
                        <FormLabel className="text-xs text-zinc-400 font-medium">Header Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-emerald-500/50 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]" />
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
                        <FormLabel className="text-xs text-zinc-400 font-medium">Welcome Message</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
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
                        <FormLabel className="text-xs text-zinc-400 font-medium">Placeholder Text</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
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
                        <FormLabel className="text-xs text-zinc-400 font-medium">Bot Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="showBranding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg p-0 pt-4">
                        <FormLabel className="text-xs text-zinc-400 font-medium mt-0">Show Branding</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald-500"
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
                          <ColorPicker label="Accent Color" value={field.value || '#e4ff04'} onChange={field.onChange} />
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
                          <ColorPicker label="Chat Background" value={field.value || '#18181b'} onChange={field.onChange} />
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
                          <ColorPicker label="Bot Bubble BG" value={field.value || '#27272a'} onChange={field.onChange} />
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
                          <ColorPicker label="Bot Text" value={field.value || '#e5e5e5'} onChange={field.onChange} />
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
                          <ColorPicker label="Input BG" value={field.value || '#27272a'} onChange={field.onChange} />
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
                          <ColorPicker label="Input Text" value={field.value || '#e5e5e5'} onChange={field.onChange} />
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
                          <ColorPicker label="Input Border" value={field.value || '#3f3f46'} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 space-y-4 border-t border-zinc-800/50 mt-6">
                    <FormField
                      control={form.control}
                      name="borderRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-zinc-400 font-medium">Border Radius</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-zinc-400 font-medium">Font Family</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-lg border-zinc-800 bg-[#0a0a0a] text-sm text-zinc-200 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* EMBED TAB */}
                <TabsContent value="embed" className="mt-0 space-y-6 outline-none">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 font-medium">API Key</Label>
                    <div className="flex bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden h-11">
                      <div className="flex-1 px-3 flex items-center text-sm font-mono text-zinc-300 truncate">
                        {widgetId}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-none border-l border-zinc-800 hover:bg-zinc-900 text-zinc-400"
                        onClick={() => copyToClipboard(widgetId, setCopiedKey)}
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 font-medium">Script Tag (Recommended)</Label>
                    <div className="flex bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden h-11 relative group">
                      <div className="flex-1 px-3 flex items-center text-sm font-mono text-zinc-300 overflow-x-auto whitespace-nowrap hide-scrollbar">
                        {scriptSnippet}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-full absolute right-0 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-none border-l border-zinc-800 hover:bg-zinc-900 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(scriptSnippet, setCopiedScript)}
                      >
                        {copiedScript ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400 font-medium">iFrame Embed</Label>
                    <div className="relative border border-zinc-800 rounded-lg bg-[#0a0a0a] p-3 pt-8 group">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 rounded-md hover:bg-zinc-900 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(iframeSnippet, setCopiedIframe)}
                      >
                        {copiedIframe ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <pre className="text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all hide-scrollbar">
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
      <div className="flex-1 bg-[#0a0a0a] flex flex-col min-w-0">
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
