'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/supabase';
import { supabase } from '@/lib/supabase';
import { Loader2, Zap, LayoutDashboard, Folder, PlusCircle, User, PanelLeftClose, PanelRightClose, Settings, LogOut } from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPositioner } from '@/components/ui/dropdown-menu';
// Text removed
import { getInitials } from '@/lib/utils';
import { SidebarInset } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // Sidebar state is handled inside the provider, we just render the structure here
  // But we need access to state for the "Minimize Stream" text toggle if we want it perfect,
  // however standard shadcn sidebar handles collapsing internally or via useSidebar hook in children.
  // For the Layout, we can just wrap children.

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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // We need a separate component component to use useSidebar hook if we want dynamic text in the footer button
  // based on state, OR we just trust the tooltip.
  // Let's stick to the simplest standard implementation first.

  return (
    <SidebarProvider>
      <AdminSidebar user={user} handleSignOut={handleSignOut} setTheme={setTheme} theme={theme} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminSidebar({ user, handleSignOut, setTheme, theme }: { user: any, handleSignOut: () => void, setTheme: any, theme: string | undefined }) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Antigravity</span>
            <span className="truncate text-xs text-muted-foreground">Autonomous Node</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations Center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin" />}
                  isActive={pathname === '/admin'}
                  tooltip="Control Center"
                >
                  <LayoutDashboard />
                  <span>Main Console</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/projects" />}
                  isActive={pathname === '/admin/projects'}
                  tooltip="Project Clusters"
                >
                  <Folder />
                  <span>Clusters</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/widget/create" />}
                  isActive={pathname === '/admin/widget/create'}
                  tooltip="Deploy New Node"
                >
                  <PlusCircle />
                  <span>Deploy Node</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Node Config</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/profile" />}
                  isActive={pathname === '/admin/profile'}
                  tooltip="Security Profile"
                >
                  <User />
                  <span>Access Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar}>
              {state === 'expanded' ? <PanelLeftClose /> : <PanelRightClose />}
              <span>{state === 'expanded' ? 'Collapse' : 'Expand'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || ''}
                    alt={user?.user_metadata?.full_name || ''}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.user_metadata?.full_name || 'Operator'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email || ''}
                  </span>
                </div>
                <Settings className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuPositioner side="bottom" align="end" sideOffset={4}>
                <DropdownMenuContent
                  className="w-[--available-width] min-w-56 rounded-lg"
                >
                  <DropdownMenuItem
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPositioner>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Remove previously unused wrapper
// function SidebarContentWrapper({ ... }) { ... }
