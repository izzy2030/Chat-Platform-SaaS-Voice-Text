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
import { Card, Text, TextField, Box, Flex, Heading, Link, Separator } from '@radix-ui/themes';

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
      <Flex align="center" justify="center" style={{ height: '100vh', width: '100vw' }}>
        <Loader2 className="animate-spin text-primary" size={32} />
      </Flex>
    );
  }

  return (
    <Box className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <Card size="4" className="w-full max-w-[450px] glass-card-premium animate-float">
        <Flex direction="column" gap="6">
          <Flex direction="column" align="center" gap="2">
            <Box style={{ width: '40px', height: '40px' }} className="bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <Zap className="text-primary fill-primary size-5" />
            </Box>
            <Heading size="8" align="center" className="font-display font-bold text-vibrant">
              Antigravity
            </Heading>
            <Text size="3" className="text-premium/50" align="center">
              The next generation of AI communication.
            </Text>
          </Flex>

          <Flex direction="column" gap="4">
            <Heading size="5" weight="bold">
              {isSignUp ? 'Create your platform' : 'Welcome back'}
            </Heading>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" className="glass-label">Email address</Text>
                  <TextField.Root
                    placeholder="name@company.com"
                    size="3"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors?.email && (
                    <Text color="red" size="1" mt="1">{errors.email.message}</Text>
                  )}
                </Box>

                <Box>
                  <Flex justify="between">
                    <Text as="label" className="glass-label">Security Key</Text>
                    {!isSignUp && (
                      <Link href="#" size="2" onClick={(e) => e.preventDefault()}>Forgot password?</Link>
                    )}
                  </Flex>
                  <TextField.Root
                    type="password"
                    placeholder="••••••••"
                    size="3"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors?.password && (
                    <Text color="red" size="1" mt="1">{errors.password.message}</Text>
                  )}
                </Box>

                <Button size="lg" className="h-12 text-md font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isSignUp ? 'Initialize Platform' : 'Access Dashboard'}
                </Button>
              </Flex>
            </form>

            <Flex align="center" gap="3" my="2">
              <Separator size="4" className="glass-separator" />
              <Text size="1" className="glass-label !mb-0 whitespace-nowrap">Or continue with</Text>
              <Separator size="4" className="glass-separator" />
            </Flex>

            <Button variant="outline" size="lg" className="h-12 text-md font-semibold border-border/50 bg-transparent hover:bg-white/5" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              Google Cloud
            </Button>
          </Flex>

          <Flex direction="column" align="center" gap="2">
            <Text size="2" className="text-premium/50">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                weight="bold"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                }}
                className="text-primary"
              >
                {isSignUp ? 'Sign in' : 'Create one now'}
              </Link>
            </Text>
            <Text size="1" className="text-premium/30 max-w-[300px]" align="center">
              By continuing, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
