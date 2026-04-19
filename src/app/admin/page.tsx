'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { 
  MessagesSquare, 
  Users, 
  Send, 
  Clock, 
  FileText, 
  ThumbsUp, 
  PlusCircle, 
  LayoutDashboard, 
  Copy, 
  Settings,
  MoreHorizontal,
  ArrowUpRight,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { api } from 'convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowingRadialChart } from '@/components/ui/glowing-radial-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const firstName = user?.firstName || 'Israel';
  const dashboardSummary = useQuery(
    api.conversations.getDashboardSummary,
    isLoaded && user ? { userId: user.id } : 'skip'
  );

  const stats = [
    { label: 'CONVERSATIONS', value: dashboardSummary?.stats.conversationCount ?? '—', icon: MessagesSquare, trend: 'LIVE', highlight: false },
    { label: 'UNREAD THREADS', value: dashboardSummary?.stats.unreadCount ?? '—', icon: Send, trend: 'INBOX', highlight: false },
    { label: 'AVG RESPONSE', value: '—', icon: Clock, trend: '-3%', highlight: false },
    { label: 'PAGES SHARED', value: '0', icon: FileText, trend: '0%', highlight: false },
    { label: 'RESOLVED', value: dashboardSummary?.stats.resolvedCount ?? '—', icon: ThumbsUp, trend: 'DONE', highlight: false },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black tracking-tight text-[#191C1D] dark:text-zinc-100">Good afternoon, {firstName}</h1>              <div className="flex items-center gap-2">
                <Badge className="bg-[#f0f7ef] text-[#2a5d24] hover:bg-[#f0f7ef] border-none px-2.5 py-0.5 rounded-full text-[10px] font-black gap-1.5 shadow-sm">
                  <span className="size-1.5 rounded-full bg-[#3b8332] animate-pulse" />
                  Live
                </Badge>
                <Badge className="bg-[#FFF8E1] text-[#A27C00] hover:bg-[#FFF8E1] border-none px-2.5 py-0.5 rounded-full text-[10px] font-black gap-1.5 shadow-sm">
                  <SparklesIcon className="size-3" />
                  AI Active
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                nativeButton={false}
                render={<Link href="/admin/settings" />}
                className="rounded-xl h-9 px-4 text-xs font-black gap-2 shadow-premium bg-white dark:bg-zinc-900 border-none hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Settings className="size-3.5 text-[#6D7A70]" /> Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Main Conversation Stat */}
          {(() => {
            const Icon = stats[0].icon;
            return (
              <Card key={stats[0].label} className="transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="size-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black tracking-widest text-[#6D7A70]/60 uppercase">{stats[0].label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-foreground">{stats[0].value}</span>
                      {stats[0].trend && <span className="text-[9px] font-black text-[#3b8332] opacity-60 tracking-tighter">{stats[0].trend}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Rebuilt Live Visitors Card */}
          <LiveVisitorsCard count={dashboardSummary?.stats.liveCount ?? '—'} />

          {/* Rest of stats */}
          {stats.slice(1).map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="size-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black tracking-widest text-[#6D7A70]/60 uppercase">{stat.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-foreground">{stat.value}</span>
                      {stat.trend && <span className="text-[9px] font-black text-[#3b8332] opacity-60 tracking-tighter">{stat.trend}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Conversations */}
          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black text-foreground">Recent Conversations</CardTitle>
              <Button
                variant="ghost"
                nativeButton={false}
                className="text-[10px] font-black text-[#6D7A70] hover:text-[#3b8332] gap-1 rounded-xl hover:bg-[#f0f7ef] px-3 h-8"
                render={<Link href="/admin/conversations" />}
              >
                See all <ArrowUpRight className="size-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {dashboardSummary === undefined ? (
                  [...Array(5)].map((_, index) => (
                    <div key={index} className="h-[70px] border-t border-[#ECEEEF]/50 first:border-0 animate-pulse bg-[linear-gradient(90deg,_rgba(248,250,251,1)_0%,_rgba(242,244,245,1)_50%,_rgba(248,250,251,1)_100%)]" />
                  ))
                ) : dashboardSummary.recentConversations.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm font-medium text-[#6D7A70]">
                    No conversations yet. New visitor chats will appear here.
                  </div>
                ) : dashboardSummary.recentConversations.map((conv) => (
                  <Link
                    key={conv._id}
                    href="/admin/conversations"
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFB] transition-colors border-t border-[#ECEEEF]/50 first:border-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-2 rounded-full shadow-sm",
                        conv.unreadForOwner ? "bg-[#3b8332] shadow-[#3b8332]/40" : "bg-[#BCCABE] shadow-black/5"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#6D7A70]/50 tracking-[0.03em]">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold tracking-tight text-[#191C1D]">{conv.visitorLabel}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 w-28">
                        <div className="size-7 rounded-lg bg-[#F2F4F5] flex items-center justify-center text-[#BCCABE] group-hover:bg-[#f0f7ef] group-hover:text-[#3b8332] transition-colors">
                          {conv.channel === 'text' ? <MessageCircle className="size-3.5" /> : <PhoneCall className="size-3.5" />}
                        </div>
                        <span className="text-xs font-black text-[#6D7A70] capitalize">{conv.channel}</span>
                      </div>
                      <span className="hidden xl:block text-[10px] font-bold text-[#BCCABE] tracking-tighter w-40 truncate">
                        {conv.pageUrl || conv.widgetName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: AI Performance & Quick Actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* AI Performance Widget */}
            <Card className="rounded-none sm:rounded-2xl p-5 flex flex-col gap-4 overflow-visible">
              <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">AI Performance</h3>
              <div className="flex items-center gap-4">
                <div className="relative size-32 flex items-center justify-center">
                  <GlowingRadialChart 
                    data={[{ name: "performance", value: 100, fill: "#3b8332" }]}
                    className="size-full"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Resolved', value: '7', color: '#3b8332' },
                    { label: 'Escalated', value: '0', color: '#F59E0B' },
                    { label: 'Abandoned', value: '0', color: '#94A3B8' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions Widget */}
            <Card className="rounded-none sm:rounded-2xl p-5 flex flex-col gap-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 group transition-all duration-300">
                  <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="size-5" />
                  </div>
                  <span className="text-[11px] font-black text-foreground">Test Widget</span>
                  <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">Preview your AI chat</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 group transition-all duration-300">
                  <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <PlusCircle className="size-5" />
                  </div>
                  <span className="text-[11px] font-black text-foreground">Invite Team</span>
                  <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">Add team members</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#ECEEEF]/50">
                <div className="flex items-center justify-center p-2 opacity-30">
                  <BarChart3 className="size-5 text-[#6D7A70]" />
                </div>
                <div className="flex items-center justify-center p-2 opacity-30">
                  <BookOpen className="size-5 text-[#6D7A70]" />
                </div>
              </div>
            </Card>
          </div>
        </div>

      {/* Floating Navigation */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="size-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform font-black">N</div>
      </div>
    </div>
  );
}

function LiveVisitorsCard({ count }: { count: number | string }) {
  const isOnline = typeof count === 'number' ? count > 0 : count !== '—' && count !== '0';
  
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group bg-primary/[0.03] dark:bg-primary/10">
      {/* Background glow effect */}
      <div className="absolute -right-4 -top-4 size-24 bg-primary/10 blur-3xl rounded-full" />
      
      <CardContent className="p-4 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="size-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-sm">
            <Users className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/10">
            <span className={cn("size-1.5 rounded-full bg-primary", isOnline && "animate-pulse shadow-[0_0_8px_var(--primary)]")} />
            <span className="text-[8px] font-black uppercase tracking-tight text-primary">Live</span>
          </div>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-[9px] font-black tracking-[0.15em] text-muted-foreground/60 uppercase">Live Visitors</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{count}</span>
            <span className="text-[10px] font-bold text-primary/50">Active now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

