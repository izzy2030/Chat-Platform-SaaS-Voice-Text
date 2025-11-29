'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { updatePassword, updateProfile } from 'firebase/auth';
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
      setProfileValue('displayName', user.displayName || '');
      setProfileValue('photoURL', user.photoURL || '');
    }
  }, [user, setProfileValue]);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    setIsPasswordLoading(true);
    try {
      await updatePassword(user, data.newPassword);
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
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

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
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>
              Update your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="rounded-full p-1 bg-gradient-to-r from-[#94B4E4] to-[#B19CD9]">
                   <Avatar className="h-24 w-24 border-2 border-background">
                    {/* Prioritize currentPhotoURL from form state for preview, else fallback to user.photoURL */}
                    <AvatarImage src={currentPhotoURL || user?.photoURL || undefined} alt={user?.displayName || 'Avatar'} />
                    <AvatarFallback className="text-xl">
                      {getInitials(user?.displayName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-4">
                   <div className="grid gap-2">
                       <Label htmlFor="photoURL">Profile Picture URL</Label>
                       <Input
                        id="photoURL"
                        placeholder="https://example.com/avatar.png"
                        {...registerProfile('photoURL')}
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
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  {...registerProfile('displayName')}
                />
                {profileErrors.displayName && (
                  <p className="text-sm text-red-500">{profileErrors.displayName.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled readOnly />
            </div>
            <div className="grid gap-2">
              <Label>User ID</Label>
              <Input value={user?.uid || ''} disabled readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword')}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
