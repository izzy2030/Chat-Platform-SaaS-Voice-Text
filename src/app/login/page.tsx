'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useUser, useClerk, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  React.useEffect(() => {
    if (isLoaded && user) {
      router.push('/admin');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card-premium animate-float border-white/10 p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div style={{ width: '40px', height: '40px' }} className="bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Zap className="text-primary fill-primary size-5" />
            </div>
            <h1 className="text-3xl font-display font-bold text-vibrant text-center">
              Antigravity
            </h1>
            <p className="text-sm text-premium/50 text-center">
              Enterprise-grade AI communication platform
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Secure Enterprise Access</h2>
              <p className="text-muted-foreground text-sm">
                Sign in with your organization's identity provider
              </p>
            </div>

            <SignInButton mode="modal" forceRedirectUrl="/admin">
              <Button
                size="lg"
                className="h-12 text-lg font-semibold shadow-lg shadow-primary/20 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {isLoading ? 'Connecting...' : 'Sign in'}
              </Button>
            </SignInButton>

            <div className="text-center text-xs text-muted-foreground">
              <p>Powered by Clerk</p>
              <p className="mt-1">Supports Google, GitHub, email, and all major identity providers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
