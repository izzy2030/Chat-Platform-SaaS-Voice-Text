'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelRightClose,
  Folder,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPositioner,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { toggleSidebar, state } = useSidebar();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Zap className="size-5 text-white fill-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-display font-bold text-lg tracking-tight">Antigravity</span>
            <span className="truncate text-[10px] uppercase font-bold tracking-widest text-primary">Core Node</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin" />}
                  tooltip="Dashboard"
                  isActive={pathname === '/admin'}
                  className="h-10 transition-all duration-200"
                >
                  <LayoutDashboard size={18} />
                  <span className="font-medium">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/projects" />}
                  tooltip="Projects"
                  isActive={pathname === '/admin/projects'}
                  className="h-10 transition-all duration-200"
                >
                  <Folder size={18} />
                  <span className="font-medium">Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/widget/create" />}
                  tooltip="Create Agent"
                  isActive={pathname === '/admin/widget/create'}
                  className="h-10 transition-all duration-200"
                >
                  <PlusCircle size={18} />
                  <span className="font-medium">Create Agent</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/profile" />}
                  tooltip="Profile"
                  isActive={pathname === '/admin/profile'}
                  className="h-10 transition-all duration-200"
                >
                  <User size={18} />
                  <span className="font-medium">Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 gap-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={state === 'expanded' ? 'Collapse' : 'Expand'}
              className="bg-white/5 hover:bg-white/10 rounded-lg justify-center transition-colors"
            >
              {state === 'expanded' ? <PanelLeftClose size={18} /> : <PanelRightClose size={18} />}
              <span>{state === 'expanded' ? 'Compact Mode' : ''}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator className="bg-white/5" />

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-white/5 hover:bg-white/5 transition-colors rounded-xl"
                  />
                }
              >
                <Avatar className="h-9 w-9 rounded-lg border border-white/10">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || ''}
                    alt={user?.user_metadata?.full_name || ''}
                  />
                  <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-bold">
                    {user?.user_metadata?.full_name || 'Operator'}
                  </span>
                  <span className="truncate text-[10px] text-gray-500 uppercase tracking-tighter">
                    {user?.email || ''}
                  </span>
                </div>
                <Settings className="ml-auto size-4 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuPositioner side="top" align="start" sideOffset={12}>
                <DropdownMenuContent
                  className="w-[--available-width] min-w-56 glass border-white/10 p-2"
                >
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminate Session
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
