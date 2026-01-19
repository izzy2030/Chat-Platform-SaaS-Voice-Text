'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  photoURL: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;
type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    watch,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  const currentPhotoURL = watch('photoURL');

  useEffect(() => {
    if (user) {
      setProfileValue('displayName', user.user_metadata?.full_name || '');
      setProfileValue('photoURL', user.user_metadata?.avatar_url || '');
    }
  }, [user, setProfileValue]);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been successfully changed.',
      });
      resetPassword();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.displayName,
          avatar_url: data.photoURL,
        }
      });
      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Account Configuration</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">Manage your identity and security preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl shadow-md border-border/70 overflow-hidden bg-card">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-bold">Public Profile</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Update your public identity within the ecosystem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="rounded-3xl p-1 bg-primary/10 border border-primary/20 shadow-inner">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    {/* Prioritize currentPhotoURL from form state for preview, else fallback to user.user_metadata?.avatar_url */}
                    <AvatarImage src={currentPhotoURL || user?.user_metadata?.avatar_url || undefined} alt={user?.user_metadata?.full_name || 'Avatar'} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-muted/50">
                      {getInitials(user?.user_metadata?.full_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="photoURL" className="text-sm font-bold text-foreground">Avatar URL</Label>
                    <Input
                      id="photoURL"
                      placeholder="https://example.com/avatar.png"
                      {...registerProfile('photoURL')}
                      className="h-12 rounded-xl border-border/60 bg-muted/20"
                    />
                    {profileErrors.photoURL && (
                      <p className="text-sm text-red-500">{profileErrors.photoURL.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Enter a URL for your profile picture. The preview will update automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName" className="text-sm font-bold text-foreground">Full Identity Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  {...registerProfile('displayName')}
                  className="h-12 rounded-xl border-border/60 bg-muted/20"
                />
                {profileErrors.displayName && (
                  <p className="text-sm text-red-500">{profileErrors.displayName.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isProfileLoading} className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md transition-all">
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sync Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-border/70 overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Node Identity</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Technical identifiers for your current session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-foreground">Authenticated Email</Label>
              <Input value={user?.email || ''} disabled readOnly className="h-11 rounded-xl border-border/40 bg-muted/10 opacity-70" />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-foreground">Core User UID</Label>
              <Input value={user?.id || ''} disabled readOnly className="h-11 rounded-xl border-border/40 bg-muted/10 font-mono text-xs opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-border/70 overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Security Protocols</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Update your access credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-sm font-bold text-foreground">New Security Key</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword')}
                  className="h-12 rounded-xl border-border/60 bg-muted/20"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500 font-medium">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground">Verify Security Key</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('confirmPassword')}
                  className="h-12 rounded-xl border-border/60 bg-muted/20"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500 font-medium">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isPasswordLoading} className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold shadow-md transition-all">
                {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
      </div >
    </div >
  );
}
