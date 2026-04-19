'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Loader2, 
  LayoutDashboard, 
  MessageSquare, 
  MessagesSquare, 
  Phone, 
  BarChart3, 
  BookOpen, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  useSidebar, 
  SidebarProvider 
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuPositioner 
} from '@/components/ui/dropdown-menu';
import { getInitials, cn } from '@/lib/utils';
import { SidebarInset } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [user, isLoaded, router]);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider className="h-svh overflow-hidden">
        <AdminSidebar user={user} handleSignOut={handleSignOut} setTheme={setTheme} theme={theme} />
        <ErrorBoundary>
          <SidebarInset className="flex flex-col overflow-y-auto pretty-scrollbar transition-colors duration-300">
            {children}
          </SidebarInset>
        </ErrorBoundary>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

function AdminSidebar({ user, handleSignOut, setTheme, theme }: { user: any, handleSignOut: () => void, setTheme: any, theme: string | undefined }) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const fullName = user?.fullName || 'Operator';
  const email = user?.emailAddresses?.[0]?.emailAddress || '';
  const avatarUrl = user?.imageUrl || '';
  const initials = getInitials(email);

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin', color: 'text-[#3b8332]' },
    { title: 'Widget', icon: MessageSquare, href: '/admin/widget', color: 'text-purple-500' },
    { title: 'Conversations', icon: MessagesSquare, href: '/admin/conversations', color: 'text-blue-500' },
    { title: 'Calls', icon: Phone, href: '/admin/calls', color: 'text-emerald-500' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'text-amber-500' },
    { title: 'Knowledge Base', icon: BookOpen, href: '/admin/knowledge-base', color: 'text-rose-500' },
    { title: 'Settings', icon: Settings, href: '/admin/settings', color: 'text-slate-500' },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-none">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-4 transition-all duration-300">
          <div className="flex items-center justify-center rounded-lg bg-[#3b8332] p-1.5 size-8 shadow-sm shadow-[#3b8332]/20">
            <div className="text-white font-black text-sm">H</div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black tracking-tight text-[#191C1D] dark:text-white">Hydra Chat</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6D7A70] dark:text-zinc-400 leading-none">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500/60 mb-1 group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-9 rounded-xl px-3 transition-all duration-200 group relative",
                        isActive 
                          ? "bg-[#f0f7ef] dark:bg-[#3b8332]/10 text-[#2a5d24] dark:text-[#80c179] font-black" 
                          : "text-slate-500 dark:text-zinc-400 hover:bg-[#F2F4F5] dark:hover:bg-zinc-900/50 hover:text-[#191C1D] dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "size-4 transition-colors",
                        isActive ? "text-[#3b8332]" : cn("text-slate-400", item.color)
                      )} />
                      <span className="text-[13px]">{item.title}</span>
                      {isActive && <div className="absolute right-2.5 size-1 rounded-full bg-[#3b8332] ring-3 ring-[#f0f7ef] dark:ring-zinc-900" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 gap-3">
        <div className="space-y-2 pt-3 border-t border-[#ECEEEF] dark:border-zinc-800">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="h-10 rounded-xl px-2 hover:bg-[#F2F4F5] dark:hover:bg-zinc-900 transition-all duration-300"
                    />
                  }
                >
                  <Avatar className="h-8 w-8 border-2 border-white dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-[#d4e7d1] text-[#2a5d24] dark:text-[#3b8332] font-black text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-black text-xs text-[#191C1D] dark:text-white">{fullName}</span>
                    <span className="truncate text-[9px] text-slate-400 font-bold tracking-tighter">{email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-[#BCCABE] dark:text-zinc-500 group-data-[collapsible=icon]:hidden" />
                </DropdownMenuTrigger>
                <DropdownMenuPositioner side="top" align="start" sideOffset={12}>
                  <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-none bg-white dark:bg-zinc-900">
                    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-xl h-10 gap-3 focus:bg-[#F2F4F5] dark:focus:bg-zinc-800">
                      {theme === 'dark' ? (
                        <>
                          <div className="size-7 rounded-lg bg-amber-100 flex items-center justify-center"><Sun className="size-3.5 text-amber-600" /></div>
                          <span className="font-bold text-sm">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <div className="size-7 rounded-lg bg-indigo-100 flex items-center justify-center"><Moon className="size-3.5 text-indigo-600" /></div>
                          <span className="font-bold text-sm">Dark Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-10 gap-3 text-destructive focus:bg-destructive/10">
                      <div className="size-7 rounded-lg bg-destructive/10 flex items-center justify-center"><LogOut className="size-3.5" /></div>
                      <span className="font-bold text-sm">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPositioner>
              </DropdownMenu>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip="Expand sidebar"
                className="h-9 rounded-xl px-3 text-slate-500 dark:text-zinc-400 hover:bg-[#F2F4F5] dark:hover:bg-zinc-900/50 hover:text-[#191C1D] dark:hover:text-white transition-all duration-200 group"
              >
                <div className="relative size-4">
                  <ChevronsLeft className="size-4 absolute inset-0 transition-all duration-300 opacity-100 rotate-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-rotate-90" />
                  <ChevronsRight className="size-4 absolute inset-0 transition-all duration-300 opacity-0 rotate-90 group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:rotate-0" />
                </div>
                <span className="text-[13px] group-data-[collapsible=icon]:hidden">Collapse</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Remove previously unused wrapper
// function SidebarContentWrapper({ ... }) { ... }

