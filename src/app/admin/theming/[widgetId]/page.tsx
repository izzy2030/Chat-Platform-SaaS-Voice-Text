
'use client';

import * as React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ThemeSidebar } from '@/components/admin/theming/theme-sidebar';
import { ThemeControls } from '@/components/admin/theming/theme-controls';
import { ThemePreview } from '@/components/admin/theming/theme-preview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { defaultTheme } from '@/lib/themes';


// Define the structure for a theme based on the spec
export interface WidgetTheme {
  // Branding
  logoUrl?: string;
  headerTitle: string;
  headerSubtext: string;
  fontFamily: string;
  fontSize: number;
  avatarStyle: 'round' | 'square';
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
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
  borderColor: string;
  windowSize: 'small' | 'medium' | 'large';
  // Sound & Haptics
  soundEffects: boolean;
  soundVolume: number;
  soundTheme: 'soft-pops' | 'arcade-clicks' | 'garage';
  hapticFeedback: boolean;
}

// Firestore document structure for a widget
interface ChatWidgetDoc {
  theme?: Partial<WidgetTheme>;
  // other widget properties
  [key: string]: any;
}


export default function ThemingPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = React.use(params);
  const [theme, setTheme] = React.useState<WidgetTheme>(defaultTheme);
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUser();
  const [isWidgetLoading, setIsWidgetLoading] = React.useState(true);

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
  }, [user, widgetId]);


  const updateTheme = (newValues: Partial<WidgetTheme>) => {
    setTheme((prevTheme) => ({ ...prevTheme, ...newValues }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
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

  return (
    <div className="flex h-full w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            &larr; Back to Dashboard
          </Link>
        </Button>
        {isWidgetLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={resetTheme}>Reset to Defaults</Button>
          <Button onClick={saveTheme} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Theme
          </Button>
        </div>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow rounded-lg border"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <ThemeSidebar setTheme={setTheme} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ThemePreview theme={theme} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} maxSize={35}>
          <ThemeControls theme={theme} updateTheme={updateTheme} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
