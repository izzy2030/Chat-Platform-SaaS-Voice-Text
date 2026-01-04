
import type { WidgetTheme } from '@/app/admin/theming/[widgetId]/page';

// Default theme state
export const defaultTheme: WidgetTheme = {
  logoUrl: '',
  headerTitle: 'Chat with us!',
  headerSubtext: 'We are here to help',
  fontFamily: 'Inter',
  fontSize: 14,
  avatarStyle: 'round',
  primaryColor: '#94B4E4',
  secondaryColor: '#F0F4F8',
  accentColor: '#B19CD9',
  backgroundBlur: 10,
  colorMode: 'light',
  darkPrimaryColor: '#6366F1',
  darkSecondaryColor: '#1F2937',
  darkAccentColor: '#EC4899',
  darkBorderColor: '#374151',
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
  borderColor: '#E5E7EB',
  windowSize: 'medium',
  soundEffects: true,
  soundVolume: 50,
  soundTheme: 'soft-pops',
  hapticFeedback: true,
};

export const darkTheme: WidgetTheme = {
  ...defaultTheme,
  headerTitle: 'Dark Mode Chat',
  headerSubtext: 'Online 24/7',
  primaryColor: '#6366F1', // Indigo 500
  secondaryColor: '#1F2937', // Gray 800
  accentColor: '#EC4899', // Pink 500
  colorMode: 'dark',
  borderColor: '#4B5563', // Gray 600
};

export const playfulTheme: WidgetTheme = {
  ...defaultTheme,
  headerTitle: 'Let\'s have fun!',
  headerSubtext: 'Ask me anything!',
  fontFamily: 'Comic Sans MS',
  primaryColor: '#FBBF24', // Amber 400
  secondaryColor: '#F3F4F6', // Gray 100
  accentColor: '#34D399', // Emerald 400
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
