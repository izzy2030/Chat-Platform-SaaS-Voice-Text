'use client';

import { useAuth, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { CreateWidget } from './create-widget';
import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';

export function AdminHeader() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const getInitials = (email?: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <BotMessageSquare className="h-6 w-6" />
          <span className="sr-only">Chat Widget Factory</span>
        </Link>
        <Link
          href="/admin"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <CreateWidget />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 p-0 overflow-hidden">
               <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-[#94B4E4] to-[#B19CD9] p-[2px]">
                  <Avatar className="h-full w-full border-2 border-background">
                    <AvatarImage
                      src={user?.photoURL || undefined}
                      alt={user?.displayName || 'user avatar'}
                    />
                    <AvatarFallback>
                      {getInitials(user?.email)}
                    </AvatarFallback>
                  </Avatar>
               </div>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
