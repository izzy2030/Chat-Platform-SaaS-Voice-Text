'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPositioner,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { WidgetList } from './widget-list';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';

export function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-14 items-center gap-3 border-b bg-background px-4">
        <nav className="hidden flex-col gap-5 text-sm font-medium md:flex md:flex-row md:items-center md:gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-base font-semibold"
          >
            <BotMessageSquareIcon className="h-5 w-5" />
            <span className="sr-only">Antigravity</span>
          </Link>
          <Link
            href="/admin"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex w-full items-center gap-3 md:ml-auto">
          <div className="ml-auto flex-1 sm:flex-initial">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-lg" nativeButton={false} render={<Link href="/admin/widget/create" />}>
              Create Agent
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={user?.imageUrl || undefined}
                      alt={user?.fullName || 'user avatar'}
                    />
                    <AvatarFallback>
                      {getInitials(user?.emailAddresses?.[0]?.emailAddress)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              }
            />
            <DropdownMenuPositioner align="end">
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/admin/profile" />}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <WidgetList />
      </main>
    </div>
  );
}

function BotMessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M13 8H7" />
      <path d="M17 12H7" />
    </svg>
  )
}
