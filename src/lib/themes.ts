
export interface WidgetTheme {
  // Content Tab
  headerTitle: string;
  headerSubtitle: string;
  welcomeMessage: string;
  placeholderText: string;
  botName: string;
  showBranding: boolean;

  // Design Tab
  accentColor: string;
  headerTextColor: string;
  chatBackgroundColor: string;
  botBubbleBgColor: string;
  botTextColor: string;
  userTextColor: string;
  inputBgColor: string;
  inputTextColor: string;
  inputBorderColor: string;
  borderRadius: string;
  fontFamily: string;

  // Visual/Animation (Internal/Not in schema yet)
  logoUrl?: string;
  fontSize: number;
  headerTitleColor?: string; // Legacy field, keeping for compatibility
  headerSubtext?: string;    // Legacy field, keeping for compatibility
  headerSubtextColor?: string; // Legacy field, keeping for compatibility
  avatarStyle: 'round' | 'square';
  primaryColor: string;      // Mapping to accentColor for internal use
  secondaryColor: string;    // Mapping to chatBackgroundColor for internal use
  borderColor: string;
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  darkAccentColor?: string;
  darkBorderColor?: string;
  backgroundBlur: number;
  colorMode: 'light' | 'dark' | 'auto';
  bubbleMessage: string;
  conversationStarters: string[];
  idlePulse: boolean;
  idlePulseStrength: number;
  hoverRipple: boolean;
  hoverRippleSize: number;
  iconSpinOnHover: boolean;
  idleNudgeSeconds: number;
  bubbleSize: 'small' | 'normal' | 'large';
  bubblePosition: 'bottom-left' | 'bottom-right';
  openAnimation: 'scale-fade' | 'particle-burst' | 'slide-up' | 'flip-open';
  openBackgroundBlur: boolean;
  openAnimationSpeed: 'slow' | 'normal' | 'fast';
  messageEntryStyle: 'bounce' | 'slide-in' | 'liquid-shimmer' | 'none';
  shimmerIntensity: number;
  typingIndicatorStyle: 'dots' | 'waveform' | 'orbiting';
  sendButtonStyle: 'normal' | 'suck-in' | 'spark-burst';
  sendButtonSound: boolean;
  sendConfettiOnSuccess: boolean;
  successConfetti: 'small-burst' | 'firework' | 'golden-rain';
  couponRevealStyle: 'fade-in' | 'neon-typewriter';
  celebrationDuration: number;
  closeAnimation: 'shrink' | 'paper-plane' | 'drop-bounce';
  winkAfterClose: boolean;
  roundedCorners: number; // Mapping to borderRadius
  shadowIntensity: number;
  borderThickness: number;
  windowSize: 'small' | 'medium' | 'large';
  soundEffects: boolean;
  soundVolume: number;
  soundTheme: 'soft-pops' | 'arcade-clicks' | 'garage';
  hapticFeedback: boolean;
}

// Default theme state based on screenshots
export const defaultTheme: WidgetTheme = {
  // Content
  headerTitle: 'My Business Name',
  headerSubtitle: 'Ready to help you!',
  welcomeMessage: 'Hi! How can I help you today?',
  placeholderText: 'Type your message...',
  botName: 'AI Assistant',
  showBranding: true,

  // Design
  accentColor: '#3b8332',
  headerTextColor: '#000000',
  chatBackgroundColor: '#FFFFFF',
  botBubbleBgColor: '#5D5DDF',
  botTextColor: '#E5E5E5',
  userTextColor: '#FFFFFF',
  inputBgColor: '#27272A',
  inputTextColor: '#E5E5E5',
  inputBorderColor: '#3F3F46',
  borderRadius: '12px',
  fontFamily: 'Inter',

  // Internal/Legacy
  logoUrl: '',
  fontSize: 14,
  avatarStyle: 'round',
  primaryColor: '#3b8332', // Linked to accentColor
  secondaryColor: '#FFFFFF', // Linked to chatBackgroundColor
  borderColor: '#E5E7EB',
  backgroundBlur: 10,
  colorMode: 'light',
  bubbleMessage: '👋 Hi! How can we help?',
  conversationStarters: [],
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
  windowSize: 'medium',
  soundEffects: true,
  soundVolume: 50,
  soundTheme: 'soft-pops',
  hapticFeedback: true,
};

export const darkTheme: WidgetTheme = {
  ...defaultTheme,
  headerTitle: 'Dark Mode Chat',
  headerSubtitle: 'Online 24/7',
  accentColor: '#6366F1', // Indigo 500
  chatBackgroundColor: '#1F2937', // Gray 800
  colorMode: 'dark',
  borderColor: '#4B5563', // Gray 600
  primaryColor: '#6366F1',
  secondaryColor: '#1F2937',
};

export const playfulTheme: WidgetTheme = {
  ...defaultTheme,
  headerTitle: 'Let\'s have fun!',
  headerSubtitle: 'Ask me anything!',
  fontFamily: 'Comic Sans MS',
  accentColor: '#FBBF24', // Amber 400
  chatBackgroundColor: '#F3F4F6', // Gray 100
  primaryColor: '#FBBF24',
  secondaryColor: '#F3F4F6',
  avatarStyle: 'square',
  bubbleSize: 'large',
  openAnimation: 'particle-burst',
  messageEntryStyle: 'bounce',
  sendButtonStyle: 'spark-burst',
  successConfetti: 'firework',
  closeAnimation: 'paper-plane',
  roundedCorners: 24,
  soundTheme: 'arcade-clicks',
};



