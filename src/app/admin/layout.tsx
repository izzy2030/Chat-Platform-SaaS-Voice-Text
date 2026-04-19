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
  PanelLeftClose,
  PanelRightClose
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
    <SidebarProvider>
      <AdminSidebar user={user} handleSignOut={handleSignOut} setTheme={setTheme} theme={theme} />
      <SidebarInset className="h-screen overflow-hidden flex flex-col">
        <div className="flex flex-col h-full overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
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
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { title: 'Widget', icon: MessageSquare, href: '/admin/widget' },
    { title: 'Conversations', icon: MessagesSquare, href: '/admin/conversations' },
    { title: 'Calls', icon: Phone, href: '/admin/calls' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Knowledge Base', icon: BookOpen, href: '/admin/knowledge-base' },
    { title: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-none bg-[#F8FAFB] dark:bg-zinc-950">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-4 transition-all duration-300">
          <div className="flex items-center justify-center rounded-lg bg-[#00B171] p-1.5 size-8 shadow-sm shadow-[#00B171]/20">
            <div className="text-white font-black text-sm">H</div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black tracking-tight text-[#191C1D] dark:text-white">Hydra Chat</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6D7A70] leading-none">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#6D7A70]/60 mb-1 group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
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
                          ? "bg-[#EBFBF3] text-[#006D43] font-black dark:bg-[#00B171]/10 dark:text-[#52DF9A]" 
                          : "text-[#6D7A70] hover:bg-[#F2F4F5] hover:text-[#191C1D] dark:hover:bg-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "size-4 transition-colors",
                        isActive ? "text-[#00B171]" : "text-[#BCCABE] group-hover:text-[#6D7A70]"
                      )} />
                      <span className="text-[13px]">{item.title}</span>
                      {isActive && <div className="absolute right-2.5 size-1 rounded-full bg-[#00B171] ring-3 ring-[#EBFBF3] dark:ring-zinc-900" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 gap-3">
        {state === 'expanded' && (
          <div className="relative group overflow-hidden rounded-2xl bg-[#00B171] p-4 text-white shadow-lg shadow-[#00B171]/20">
            <div className="relative z-10 space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-sm">Upgrade to Pro</h4>
                <p className="text-[10px] text-white/80 font-medium leading-snug">Unlock advanced AI features & deep analytics.</p>
              </div>
              <Button size="sm" className="w-full h-9 rounded-lg font-bold bg-white text-[#006D43] hover:bg-white/90 shadow-sm transition-transform active:scale-95 border-none text-xs">
                Pro Upgrade
              </Button>
            </div>
            <div className="absolute -right-4 -top-4 size-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-8 -left-8 size-24 bg-black/5 rounded-full blur-3xl" />
          </div>
        )}

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
                    <AvatarFallback className="bg-[#baefcc] text-[#006D43] font-black text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-black text-xs text-[#191C1D] dark:text-white">{fullName}</span>
                    <span className="truncate text-[9px] text-[#6D7A70] font-bold uppercase tracking-tighter">{email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-[#BCCABE] group-data-[collapsible=icon]:hidden" />
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
            
            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
              <button 
                onClick={toggleSidebar} 
                className="w-full flex items-center gap-2 h-8 px-3 text-[#BCCABE] hover:text-[#6D7A70] transition-colors"
              >
                <LayoutDashboard className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Collapse Sidebar</span>
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Remove previously unused wrapper
// function SidebarContentWrapper({ ... }) { ... }
