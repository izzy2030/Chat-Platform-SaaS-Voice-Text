'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import NextLink from 'next/link';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast({
          title: 'Check your email!',
          description: 'A confirmation link has been sent to your email.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast({
          title: 'Signed in!',
          description: 'Welcome back.',
        });
        router.push('/admin');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'There was a problem with your request.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Error',
        description: error.message || 'There was a problem with your request.',
      });
      setIsLoading(false);
    }
  }

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-[450px] glass-card-premium animate-float border-white/10">
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col items-center gap-2">
            <div style={{ width: '40px', height: '40px' }} className="bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Zap className="text-primary fill-primary size-5" />
            </div>
            <h1 className="text-4xl font-display font-bold text-vibrant text-center">
              Antigravity
            </h1>
            <p className="text-base text-premium/50 text-center">
              The next generation of AI communication.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">
              {isSignUp ? 'Create your platform' : 'Welcome back'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium glass-label block mb-1">Email address</label>
                  <Input
                    placeholder="name@company.com"
                    type="email"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors?.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium glass-label">Security Key</label>
                    {!isSignUp && (
                      <NextLink href="#" onClick={(e) => e.preventDefault()} className="text-sm text-primary hover:underline">Forgot password?</NextLink>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors?.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <Button size="lg" className="h-12 text-md font-bold shadow-lg shadow-primary/20 w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isSignUp ? 'Initialize Platform' : 'Access Dashboard'}
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3 my-2">
              <Separator className="flex-1 glass-separator" />
              <span className="text-xs glass-label whitespace-nowrap">Or continue with</span>
              <Separator className="flex-1 glass-separator" />
            </div>

            <Button variant="outline" size="lg" className="h-12 text-md font-semibold border-border/50 bg-transparent hover:bg-white/5 w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              Google Cloud
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-premium/50 text-center">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                }}
                className="text-primary font-bold hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Create one now'}
              </button>
            </p>
            <p className="text-[10px] text-premium/30 max-w-[300px] text-center">
              By continuing, you agree to our <NextLink href="#" className="underline">Terms</NextLink> and <NextLink href="#" className="underline">Privacy Policy</NextLink>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
