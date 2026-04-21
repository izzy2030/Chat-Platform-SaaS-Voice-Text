'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useDebouncedAutosave } from '@/hooks/use-debounced-autosave';

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
  const { user, isLoaded } = useUser();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSavedAt, setProfileSavedAt] = useState<Date | null>(null);
  const hasHydratedProfileRef = useRef(false);

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
    reset: resetProfile,
    watch,
    trigger: triggerProfile,
    formState: profileFormState,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      photoURL: '',
    },
  });

  const currentPhotoURL = watch('photoURL');
  const profileValues = watch();

  useEffect(() => {
    if (user && !hasHydratedProfileRef.current) {
      const unsafeMetadata = user.unsafeMetadata as Record<string, unknown> | undefined;
      resetProfile({
        displayName: user.fullName || '',
        photoURL: typeof unsafeMetadata?.profilePhotoUrl === 'string' ? unsafeMetadata.profilePhotoUrl : user.imageUrl || '',
      });
      hasHydratedProfileRef.current = true;
    }
  }, [resetProfile, user]);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    setIsPasswordLoading(true);
    try {
      toast({
        title: 'Password updated',
        description: 'Please use Clerk to manage your password.',
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

  const persistProfile = async (data: ProfileFormData, silent: boolean) => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      await user.update({
        firstName: data.displayName?.split(' ')[0],
        lastName: data.displayName?.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          ...(user.unsafeMetadata as Record<string, unknown> | undefined),
          profilePhotoUrl: data.photoURL || null,
        },
      });

      if (!silent) {
        toast({
          title: 'Profile updated',
          description: 'Your profile information has been updated.',
        });
      }
      resetProfile(data);
      setProfileSavedAt(new Date());
    } catch (error: any) {
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Error updating profile',
          description: error.message || 'Something went wrong.',
        });
      }
      throw error;
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    await persistProfile(data, false);
  };

  const profileAutosave = useDebouncedAutosave<ProfileFormData>({
    value: profileValues,
    enabled: Boolean(isLoaded && user && hasHydratedProfileRef.current),
    isDirty: profileFormState.isDirty,
    delayMs: 900,
    resetKey: user?.id,
    onSave: async (nextValues) => {
      const valid = await triggerProfile();
      if (!valid) {
        return;
      }
      await persistProfile(nextValues, true);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Profile autosave failed.';
      toast({
        variant: 'destructive',
        title: 'Profile Autosave Failed',
        description: message,
      });
    },
  });

  if (!isLoaded) {
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
        <h1 className="text-4xl font-black tracking-tight text-foreground">Account Configuration</h1>
        <p className="text-sm font-semibold text-muted-foreground/70 mt-1">Manage your identity and security preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-xl shadow-premium border-border bg-card">
          <CardHeader className="pb-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Public Profile</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60">
              Update your public identity within the ecosystem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="rounded-xl p-1 bg-secondary/30 border border-border shadow-inner">
                  <Avatar className="h-32 w-32 border-4 border-card shadow-premium">
                    {/* Prioritize currentPhotoURL from form state for preview, else fallback to user.user_metadata?.avatar_url */}
                    <AvatarImage src={currentPhotoURL || user?.imageUrl || undefined} alt={user?.fullName || 'Avatar'} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-muted/50">
                      {getInitials(user?.fullName, user?.emailAddresses?.[0]?.emailAddress)}
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
                      className="h-11 rounded-lg border-border bg-muted/20"
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
                  className="h-11 rounded-lg border-border bg-muted/20"
                />
                {profileErrors.displayName && (
                  <p className="text-sm text-red-500">{profileErrors.displayName.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isProfileLoading} className="w-full sm:w-auto h-11 px-8 rounded-lg font-black shadow-md transition-all">
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sync Profile
              </Button>
              <p className="text-xs text-muted-foreground">
                {profileAutosave.status === 'saving'
                  ? 'Autosaving profile...'
                  : profileAutosave.status === 'pending'
                    ? 'Changes detected'
                    : profileAutosave.status === 'error'
                      ? 'Autosave failed'
                      : profileSavedAt
                        ? `Saved at ${profileSavedAt.toLocaleTimeString()}`
                        : 'Autosave enabled'}
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-premium border-border bg-card">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Node Identity</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60">
              Technical identifiers for your current session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-foreground">Authenticated Email</Label>
              <Input value={user?.emailAddresses?.[0]?.emailAddress || ''} disabled readOnly className="h-11 rounded-lg border-border bg-muted/20 opacity-70" />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-foreground">Core User UID</Label>
              <Input value={user?.id || ''} disabled readOnly className="h-11 rounded-lg border-border bg-muted/20 font-mono text-xs opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-premium border-border bg-card">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Security Protocols</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60">
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
                  className="h-11 rounded-lg border-border bg-muted/20"
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
                  className="h-11 rounded-lg border-border bg-muted/20"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500 font-medium">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isPasswordLoading} className="w-full h-11 rounded-lg bg-surface-dark text-white hover:bg-surface-dark/90 font-black shadow-md transition-all">
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
