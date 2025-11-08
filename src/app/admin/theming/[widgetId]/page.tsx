
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
import { useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


// Define the structure for a theme based on the spec
export interface WidgetTheme {
  // Branding
  logoUrl?: string;
  headerTitle: string;
  fontFamily: string;
  fontSize: number;
  avatarStyle: 'round' | 'square';
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundBlur: number;
  colorMode: 'light' | 'dark' | 'auto';
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

// Default theme state
const defaultTheme: WidgetTheme = {
  logoUrl: '',
  headerTitle: 'Chat with us!',
  fontFamily: 'Inter',
  fontSize: 14,
  avatarStyle: 'round',
  primaryColor: '#94B4E4',
  secondaryColor: '#F0F4F8',
  accentColor: '#B19CD9',
  backgroundBlur: 10,
  colorMode: 'light',
  idlePulse: true,
  idlePulseStrength: 50,
  hoverRipple: true,
  hoverRippleSize: 50,
  iconSpinOnHover: false,
  idleNudgeSeconds: 10,
  bubbleSize: 'normal',
  bubblePosition: 'bottom-right',
  openAnimation: 'scale-fade',
  openBackgroundBlur: true,
  openAnimationSpeed: 'normal',
  messageEntryStyle: 'slide-in',
  shimmerIntensity: 50,
  typingIndicatorStyle: 'dots',
  sendButtonStyle: 'normal',
  sendButtonSound: true,
  sendConfettiOnSuccess: true,
  successConfetti: 'small-burst',
  couponRevealStyle: 'fade-in',
  celebrationDuration: 3,
  closeAnimation: 'shrink',
  winkAfterClose: true,
  roundedCorners: 12,
  shadowIntensity: 50,
  borderThickness: 1,
  borderColor: '#E5E7EB',
  windowSize: 'medium',
  soundEffects: true,
  soundVolume: 50,
  soundTheme: 'soft-pops',
  hapticFeedback: true,
};

// Firestore document structure for a widget
interface ChatWidgetDoc {
  theme?: Partial<WidgetTheme>;
  // other widget properties
  [key: string]: any;
}


export default function ThemingPage({ params }: { params: { widgetId: string } }) {
  const { widgetId } = params;
  const [theme, setTheme] = React.useState<WidgetTheme>(defaultTheme);
  const [isSaving, setIsSaving] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const widgetDocRef = useMemoFirebase(() => {
    if (!user || !widgetId) return null;
    return doc(firestore, `users/${user.uid}/chatWidgets/${widgetId}`);
  }, [firestore, user, widgetId]);
  
  const { data: widgetData, isLoading: isWidgetLoading } = useDoc<ChatWidgetDoc>(widgetDocRef);
  
  React.useEffect(() => {
    if (widgetData) {
      // Merge saved theme with defaults to ensure all keys are present
      setTheme(prevTheme => ({ ...prevTheme, ...widgetData.theme }));
    }
  }, [widgetData]);


  const updateTheme = (newValues: Partial<WidgetTheme>) => {
    setTheme((prevTheme) => ({ ...prevTheme, ...newValues }));
  };
  
  const resetTheme = () => {
    setTheme(defaultTheme);
  };
  
  const saveTheme = async () => {
    if (!widgetDocRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot save theme. Widget reference not found.',
      });
      return;
    }
    setIsSaving(true);
    try {
      await updateDocumentNonBlocking(widgetDocRef, { theme: theme });
      toast({
        title: 'Theme Saved!',
        description: 'Your changes have been saved successfully.',
      });
      router.push('/admin');
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
  
  if (isWidgetLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              &larr; Back to Dashboard
            </Link>
          </Button>
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
          <ThemeSidebar />
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
