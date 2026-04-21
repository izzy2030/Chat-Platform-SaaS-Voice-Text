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
import { useUser, useClerk } from '@clerk/nextjs';
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
  const { signOut } = useClerk();
  const { toggleSidebar, state } = useSidebar();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  const fullName = user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : (user?.username || 'Operator');
  const initials = getInitials(fullName);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary shadow">
            <Zap className="size-4 text-white fill-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-sm tracking-tight">Antigravity</span>
            <span className="truncate text-[9px] uppercase font-semibold tracking-wide text-primary">Core</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin" />}
                  tooltip="Dashboard"
                  isActive={pathname === '/admin'}
                  className="h-9 transition-all duration-200"
                >
                  <LayoutDashboard size={16} />
                  <span className="font-medium">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/projects" />}
                  tooltip="Projects"
                  isActive={pathname === '/admin/projects'}
                  className="h-9 transition-all duration-200"
                >
                  <Folder size={16} />
                  <span className="font-medium">Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/widget/create" />}
                  tooltip="Create Agent"
                  isActive={pathname === '/admin/widget/create'}
                  className="h-9 transition-all duration-200"
                >
                  <PlusCircle size={16} />
                  <span className="font-medium">Create Agent</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/profile" />}
                  tooltip="Profile"
                  isActive={pathname === '/admin/profile'}
                  className="h-9 transition-all duration-200"
                >
                  <User size={16} />
                  <span className="font-medium">Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 gap-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={state === 'expanded' ? 'Collapse' : 'Expand'}
              className="bg-white/5 hover:bg-white/10 rounded justify-center transition-colors"
            >
              {state === 'expanded' ? <PanelLeftClose size={16} /> : <PanelRightClose size={16} />}
              <span>{state === 'expanded' ? 'Compact' : ''}</span>
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
                    className="data-[state=open]:bg-white/5 hover:bg-white/5 transition-colors rounded-lg"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded border border-white/10">
                  <AvatarImage
                    src={user?.imageUrl || ''}
                    alt={user?.fullName || ''}
                  />
                  <AvatarFallback className="rounded bg-primary/20 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium text-xs">
                    {fullName}
                  </span>
                </div>
                <Settings className="ml-auto size-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuPositioner side="top" align="start" sideOffset={8}>
                <DropdownMenuContent
                  className="w-[--available-width] min-w-48 glass border-white/10 p-1.5"
                >
                  <DropdownMenuItem onClick={handleSignOut} className="rounded text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Log out
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
