'use client';

import * as React from 'react';
import { useUser } from '@/supabase';
import { supabase } from '@/lib/supabase';
import { defaultTheme, darkTheme, playfulTheme } from '@/lib/themes';
import { ChatWidgetComponent } from '@/components/widget/chat-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, Save, Smartphone, Palette, Zap, LayoutTemplate, Volume2, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Re-using the interfaces for consistency
export interface WidgetTheme {
  // Branding
  logoUrl?: string;
  headerTitle: string;
  headerTitleColor?: string;
  headerSubtext: string;
  headerSubtextColor?: string;
  fontFamily: string;
  fontSize: number;
  avatarStyle: 'round' | 'square';
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderColor: string;
  // Dark Mode Overrides
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  darkAccentColor?: string;
  darkBorderColor?: string;
  backgroundBlur: number;
  colorMode: 'light' | 'dark' | 'auto';
  // Bubble
  bubbleMessage: string;
  conversationStarters: string[];
  // Bubble Animation
  idlePulse: boolean;
  idlePulseStrength: number;
  hoverRipple: boolean;
  hoverRippleSize: number;
  iconSpinOnHover: boolean;
  idleNudgeSeconds: number;
  bubbleSize: 'small' | 'normal' | 'large';
  bubblePosition: 'bottom-left' | 'bottom-right';
  // Open Animation
  openAnimation: 'scale-fade' | 'particle-burst' | 'slide-up' | 'flip-open';
  openBackgroundBlur: boolean;
  openAnimationSpeed: 'slow' | 'normal' | 'fast';
  // Message Animations
  messageEntryStyle: 'bounce' | 'slide-in' | 'liquid-shimmer' | 'none';
  shimmerIntensity: number;
  typingIndicatorStyle: 'dots' | 'waveform' | 'orbiting';
  // Send Button Animation
  sendButtonStyle: 'normal' | 'suck-in' | 'spark-burst';
  sendButtonSound: boolean;
  sendConfettiOnSuccess: boolean;
  // Success Celebration
  successConfetti: 'small-burst' | 'firework' | 'golden-rain';
  couponRevealStyle: 'fade-in' | 'neon-typewriter';
  celebrationDuration: number;
  // Close Animation
  closeAnimation: 'shrink' | 'paper-plane' | 'drop-bounce';
  winkAfterClose: boolean;
  // Widget Shape & Layout
  roundedCorners: number;
  shadowIntensity: number;
  borderThickness: number;
  windowSize: 'small' | 'medium' | 'large';
  // Sound & Haptics
  soundEffects: boolean;
  soundVolume: number;
  soundTheme: 'soft-pops' | 'arcade-clicks' | 'garage';
  hapticFeedback: boolean;
}

const ColorPicker = ({ label, value, onChange, onReset }: { label: string, value: string, onChange: (val: string) => void, onReset?: () => void }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{value}</span>
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-destructive p-0 rounded-full"
            onClick={onReset}
            title="Reset to default"
            nativeButton={true}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-full rounded-md overflow-hidden shadow-sm border border-input ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
        <div
          style={{ backgroundColor: value }}
          className="absolute inset-0 w-full h-full"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  </div>
);

const TinyColorPicker = ({ value, onChange, onReset }: { value: string, onChange: (val: string) => void, onReset?: () => void }) => (
  <div className="flex items-center gap-1">
    <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden shadow-sm border border-input ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
      <div
        style={{ backgroundColor: value }}
        className="absolute inset-0 w-full h-full"
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Choose color"
      />
    </div>
    {onReset && (
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
        title="Reset to default"
        nativeButton={true}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
  </div>
);

function Preview({ theme, configId }: { theme: WidgetTheme, configId: string }) {
  // Transform WidgetTheme to ChatWidgetComponent's expected structure
  const previewConfig = React.useMemo(() => {
    return {
      id: configId,
      webhook_url: '',
      theme: {
        ...theme,
        // Explicitly mapping overrides to ensure preview works accurately
        colorMode: theme.colorMode === 'auto' ? 'light' : theme.colorMode,
      },
    };
  }, [theme, configId]);

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-950/50 dark:to-slate-900/50 relative overflow-hidden mt-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Device Frame */}
      <div className="relative w-[380px] h-[700px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-white ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex flex-col transition-all duration-300">
        {/* Status Bar */}
        <div className="h-7 w-full bg-white flex items-center justify-between px-6 z-10 relative shrink-0">
          <div className="text-[10px] font-bold text-gray-900">9:41</div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-white">
          {/* We use a key to force re-render on major theme changes if needed, but props usually handle it */}
          <ChatWidgetComponent
            widgetConfig={previewConfig}
            sessionId="preview-session"
          />
        </div>
      </div>
    </div>
  );
}


export default function ThemingPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = React.use(params);
  const [theme, setTheme] = React.useState<WidgetTheme>(defaultTheme);
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUser();
  const [isWidgetLoading, setIsWidgetLoading] = React.useState(true);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchWidget = async () => {
      if (!user || !widgetId) return;
      setIsWidgetLoading(true);
      try {
        const { data, error } = await supabase
          .from('widgets')
          .select('theme')
          .eq('id', widgetId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data?.theme) {
          setTheme(prevTheme => ({ ...prevTheme, ...data.theme }));
        }
      } catch (error: any) {
        console.error('Error fetching widget theme:', error);
      } finally {
        setIsWidgetLoading(false);
      }
    };

    fetchWidget();
  }, [user?.id, widgetId]);

  const updateTheme = (newValues: Partial<WidgetTheme>) => {
    setTheme((prevTheme) => ({ ...prevTheme, ...newValues }));
  };

  const handleValueChange = (key: keyof WidgetTheme) => (value: any) => {
    updateTheme({ [key]: value });
  };

  const handleColorChange = (key: keyof WidgetTheme) => (value: string) => {
    updateTheme({ [key]: value });
  };

  const handleSliderChange = (key: keyof WidgetTheme) => (value: number | readonly number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    updateTheme({ [key]: val });
  };

  const saveTheme = async () => {
    if (!user || !widgetId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot save theme. Authentication or reference missing.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('widgets')
        .update({ theme: theme })
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Theme Saved!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Theme',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 2MB.',
        });
        return;
      }

      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === 'string') {
          updateTheme({ logoUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isWidgetLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background overflow-hidden">
      {/* Studio Header */}
      <div className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/admin" />}>
            <span className="sr-only">Back</span>&larr;
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Theming Lab</h1>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Visual Identity
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setTheme(defaultTheme); setSelectedFileName(null); }} className="rounded-lg">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Lab
          </Button>
          <Button onClick={saveTheme} disabled={isSaving} className="rounded-lg shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
          </Button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-[400px] border-r bg-card flex flex-col shrink-0 z-10 shadow-lg relative">


          {/* Tabs & Content */}
          <Tabs defaultValue="visuals" className="flex flex-col flex-1 min-h-0 w-full">
            <div className="px-2 py-2 border-b bg-muted/20">
              <TabsList className="w-full grid grid-cols-4 p-1 h-9 bg-muted/50">
                <TabsTrigger value="presets" className="text-[10px] sm:text-xs">Presets</TabsTrigger>
                <TabsTrigger value="visuals" className="text-[10px] sm:text-xs">Visuals</TabsTrigger>
                <TabsTrigger value="behavior" className="text-[10px] sm:text-xs">Content</TabsTrigger>
                <TabsTrigger value="effects" className="text-[10px] sm:text-xs">Effects</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-8 pb-24">
                {/* PRESETS TAB */}
                <TabsContent value="presets" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" /> Ready-made Themes
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div
                        onClick={() => setTheme(defaultTheme)}
                        className="cursor-pointer group relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <h4 className="font-bold text-primary">Standard Blue</h4>
                        <p className="text-xs text-muted-foreground mt-1">Clean, professional default look.</p>
                      </div>
                      <div
                        onClick={() => setTheme(darkTheme)}
                        className="cursor-pointer group relative overflow-hidden rounded-lg border bg-gradient-to-br from-gray-900 to-slate-800 p-4 hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <h4 className="font-bold text-white">Dark Mode</h4>
                        <p className="text-xs text-gray-400 mt-1">Sleek dark aesthetics for modern sites.</p>
                      </div>
                      <div
                        onClick={() => setTheme(playfulTheme)}
                        className="cursor-pointer group relative overflow-hidden rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 p-4 hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <h4 className="font-bold text-orange-600">Playful & Fun</h4>
                        <p className="text-xs text-muted-foreground mt-1">Bouncy animations and bright colors.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* VISUALS TAB */}
                <TabsContent value="visuals" className="mt-0 space-y-8">
                  {/* Branding Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Branding
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <label
                          className="flex h-10 w-full items-center rounded-lg border border-input bg-card text-sm shadow-sm cursor-pointer overflow-hidden group transition-all hover:border-primary/30"
                        >
                          <span className="bg-[#001f2d] text-white h-full px-5 flex items-center font-semibold text-xs tracking-wide transition-colors group-hover:bg-[#00111a]">
                            Browse
                          </span>
                          <span className="px-4 text-muted-foreground text-xs truncate">
                            {selectedFileName || "Choose file"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Header Title</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={theme.headerTitle}
                            onChange={(e) => updateTheme({ headerTitle: e.target.value })}
                            className="flex-1 h-10 rounded-xl border-border/60 bg-muted/20"
                          />
                          <TinyColorPicker
                            value={theme.headerTitleColor || '#000000'}
                            onChange={(val) => updateTheme({ headerTitleColor: val })}
                            onReset={() => updateTheme({ headerTitleColor: undefined })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">Subtext</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={theme.headerSubtext}
                            onChange={(e) => updateTheme({ headerSubtext: e.target.value })}
                            className="flex-1 h-10 rounded-xl border-border/60 bg-muted/20"
                          />
                          <TinyColorPicker
                            value={theme.headerSubtextColor || '#6b7280'}
                            onChange={(val) => updateTheme({ headerSubtextColor: val })}
                            onReset={() => updateTheme({ headerSubtextColor: undefined })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Colors */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Color Scheme
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Primary"
                        value={theme.primaryColor}
                        onChange={handleColorChange('primaryColor')}
                        onReset={() => handleColorChange('primaryColor')(defaultTheme.primaryColor)}
                      />
                      <ColorPicker
                        label="Secondary"
                        value={theme.secondaryColor}
                        onChange={handleColorChange('secondaryColor')}
                        onReset={() => handleColorChange('secondaryColor')(defaultTheme.secondaryColor)}
                      />
                      <ColorPicker
                        label="Accent"
                        value={theme.accentColor}
                        onChange={handleColorChange('accentColor')}
                        onReset={() => handleColorChange('accentColor')(defaultTheme.accentColor)}
                      />
                      <ColorPicker
                        label="Border"
                        value={theme.borderColor}
                        onChange={handleColorChange('borderColor')}
                        onReset={() => handleColorChange('borderColor')(defaultTheme.borderColor)}
                      />
                    </div>

                    <div className="pt-2">
                      <Label className="mb-2 block">Theme Mode</Label>
                      <Select value={theme.colorMode} onValueChange={handleValueChange('colorMode')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Shape */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Shape & Form</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between"><Label>Roundness</Label> <span className="text-xs text-muted-foreground">{theme.roundedCorners}px</span></div>
                        <Slider value={[theme.roundedCorners]} onValueChange={handleSliderChange('roundedCorners')} min={0} max={32} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between"><Label>Shadow</Label> <span className="text-xs text-muted-foreground">{theme.shadowIntensity}%</span></div>
                        <Slider value={[theme.shadowIntensity]} onValueChange={handleSliderChange('shadowIntensity')} min={0} max={100} step={5} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* BEHAVIOR TAB */}
                <TabsContent value="behavior" className="mt-0 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Widget Content</h3>
                    <div className="space-y-3">
                      <Label>Greeting Bubble Message</Label>
                      <Textarea
                        value={theme.bubbleMessage}
                        onChange={(e) => updateTheme({ bubbleMessage: e.target.value })}
                        placeholder="👋 Hi there!"
                        className="resize-none h-20"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Launcher Size</Label>
                      <Select value={theme.bubbleSize} onValueChange={handleValueChange('bubbleSize')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Compact</SelectItem>
                          <SelectItem value="normal">Standard</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Position</Label>
                      <Select value={theme.bubblePosition} onValueChange={handleValueChange('bubblePosition')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* EFFECTS TAB */}
                <TabsContent value="effects" className="mt-0 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Motion
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Idle Pulse</Label>
                        <Switch checked={theme.idlePulse} onCheckedChange={handleValueChange('idlePulse')} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Hover Ripple</Label>
                        <Switch checked={theme.hoverRipple} onCheckedChange={handleValueChange('hoverRipple')} />
                      </div>
                      <div className="space-y-2 pt-2">
                        <Label>Animation Style</Label>
                        <Select value={theme.openAnimation} onValueChange={handleValueChange('openAnimation')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scale-fade">Scale & Fade</SelectItem>
                            <SelectItem value="particle-burst">Particle Burst</SelectItem>
                            <SelectItem value="slide-up">Slide Up</SelectItem>
                            <SelectItem value="flip-open">Flip</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Sound
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-foreground">UI Sounds</Label>
                        <Switch checked={theme.soundEffects} onCheckedChange={handleValueChange('soundEffects')} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between"><Label className="text-xs font-bold text-foreground">Output Intensity</Label> <span className="text-xs font-mono text-muted-foreground">{theme.soundVolume}%</span></div>
                        <Slider value={[theme.soundVolume]} onValueChange={handleSliderChange('soundVolume')} min={0} max={100} step={10} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 bg-muted/30 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden relative">
            <Preview theme={theme} configId={widgetId} />
          </div>
        </div>
      </div>
    </div>
  );
}
