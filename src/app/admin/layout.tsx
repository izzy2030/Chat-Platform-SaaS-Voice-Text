'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/supabase';
import { supabase } from '@/lib/supabase';
import { Loader2, Zap, LayoutDashboard, Folder, PlusCircle, User, PanelLeftClose, PanelRightClose, Settings, LogOut } from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarProvider } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@radix-ui/themes';
import { getInitials } from '@/lib/utils';
import { SidebarInset } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

function SidebarContentWrapper({
  children,
  user,
  handleSignOut
}: {
  children: React.ReactNode;
  user: any;
  handleSignOut: () => void;
}) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen w-full mesh-gradient overflow-hidden">
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background backdrop-blur-xl">
        <SidebarHeader className="border-b glass-separator">
          <div className="flex items-center gap-3 px-3 py-5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform hover:scale-105 duration-300">
              <Zap className="size-5 text-white fill-white shadow-inner" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-display font-bold text-lg tracking-tightest text-vibrant">Antigravity</span>
              <span className="truncate text-[9px] uppercase font-black tracking-widest text-primary/80">Autonomous Node</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-premium/30 mb-4">Operations Center</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Control Center"
                    isActive={pathname === '/admin'}
                    className={`h-12 px-4 rounded-2xl transition-all duration-300 ${pathname === '/admin'
                      ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(91,91,214,0.1)]'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                  >
                    <Link href="/admin">
                      <LayoutDashboard size={20} />
                      <span className="font-bold tracking-tight">Main Console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Project Clusters"
                    isActive={pathname === '/admin/projects'}
                    className={`h-12 px-4 rounded-2xl transition-all duration-300 ${pathname === '/admin/projects'
                      ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(91,91,214,0.1)]'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                  >
                    <Link href="/admin/projects">
                      <Folder size={20} />
                      <span className="font-bold tracking-tight">Clusters</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Deploy New Node"
                    isActive={pathname === '/admin/widget/create'}
                    className={`h-12 px-4 rounded-2xl transition-all duration-300 ${pathname === '/admin/widget/create'
                      ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(91,91,214,0.1)]'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                  >
                    <Link href="/admin/widget/create">
                      <PlusCircle size={20} />
                      <span className="font-bold tracking-tight">Deploy Node</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-premium/30 mb-4">Node Config</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Security Profile"
                    isActive={pathname === '/admin/profile'}
                    className={`h-12 px-4 rounded-2xl transition-all duration-300 ${pathname === '/admin/profile'
                      ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(91,91,214,0.1)]'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                  >
                    <Link href="/admin/profile">
                      <User size={20} />
                      <span className="font-bold tracking-tight">Access Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 gap-6 border-t glass-separator">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip={state === 'expanded' ? 'Condense View' : 'Expand View'}
                className="h-12 glass-button-ghost justify-center"
              >
                {state === 'expanded' ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
                <span className="font-bold tracking-tight">{state === 'expanded' ? 'Minimize Stream' : ''}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-white/10 glass-button-ghost p-2"
                  >
                    <Avatar className="h-9 w-9 rounded-xl border border-primary/30">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url || ''}
                        alt={user?.user_metadata?.full_name || ''}
                      />
                      <AvatarFallback className="rounded-xl bg-primary text-white font-black text-[10px]">
                        {getInitials(user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight ml-2">
                      <span className="truncate font-bold text-premium tracking-tight">
                        {user?.user_metadata?.full_name || 'Operator'}
                      </span>
                      <span className="truncate text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5 opacity-80">
                        Secure Session
                      </span>
                    </div>
                    <Settings className="ml-auto size-4 text-premium/20 group-hover:text-premium/60" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-64 glass p-3 mb-4 rounded-[1.5rem]"
                  side="top"
                  align="start"
                  sideOffset={16}
                >
                  <div className="px-4 py-3 mb-2 border-b glass-separator">
                    <Text size="1" className="text-premium/40 uppercase font-black tracking-[0.2em] block mb-1">Authenticated As</Text>
                    <Text size="3" weight="bold" className="text-premium block truncate">{user?.email}</Text>
                  </div>

                  <DropdownMenuItem
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-xl focus:bg-primary/10 cursor-pointer h-12 px-4 transition-colors font-bold mb-1"
                  >
                    {!mounted ? (
                      <span className="text-premium">Theme</span>
                    ) : theme === 'dark' ? (
                      <>
                        <Sun className="mr-3 h-5 w-5 text-amber-500" />
                        <span className="text-premium">Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-3 h-5 w-5 text-indigo-500" />
                        <span className="text-premium">Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer h-12 px-4 transition-colors font-bold">
                    <LogOut className="mr-3 h-5 w-5" />
                    Terminate Connection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent backdrop-blur-[2px]">
        <div className="flex flex-1 flex-col gap-8 p-8 md:p-12">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarContentWrapper user={user} handleSignOut={handleSignOut}>
        {children}
      </SidebarContentWrapper>
    </SidebarProvider>
  );
}
