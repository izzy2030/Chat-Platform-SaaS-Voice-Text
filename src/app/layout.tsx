import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import '@radix-ui/themes/styles.css';
import { SupabaseProvider } from '@/supabase/provider';
import { Toaster } from '@/components/ui/toaster';
import { Theme } from '@radix-ui/themes';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Antigravity | AI Voice & Chat Platform',
  description: 'Enterprise-grade AI communication platform with sub-second latency.',
};

import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SupabaseProvider>{children}</SupabaseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
