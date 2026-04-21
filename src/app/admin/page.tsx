'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  PlusCircle,
  Send,
  Settings,
  Sparkles,
  ThumbsUp,
  Users,
} from 'lucide-react';

import { api } from 'convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowingRadialChart } from '@/components/ui/glowing-radial-chart';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const firstName = user?.firstName || 'Israel';
  const dashboardSummary = useQuery(
    api.conversations.getDashboardSummary,
    isLoaded && user ? { userId: user.id } : 'skip'
  );

  const stats = [
    { label: 'Conversations', value: dashboardSummary?.stats.conversationCount ?? '—', icon: MessagesSquare, tone: 'green' as const },
    { label: 'Live Visitors', value: dashboardSummary?.stats.liveCount ?? '—', icon: Users, tone: 'green' as const },
    { label: 'Unread Threads', value: dashboardSummary?.stats.unreadCount ?? '—', icon: Send, tone: 'slate' as const },
    { label: 'Resolved', value: dashboardSummary?.stats.resolvedCount ?? '—', icon: ThumbsUp, tone: 'amber' as const },
  ];

  return (
    <div className="min-h-full">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <section className="overflow-hidden rounded-xl border border-border bg-card/90 shadow-premium backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-none bg-secondary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-secondary-foreground hover:bg-secondary">
                  Hydra Dashboard
                </Badge>
                <Badge
                  variant="ghost"
                  className="rounded-full border-none bg-muted px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/80"
                >
                  Live Operations
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
                  Welcome back, {firstName}
                </h1>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Monitor live conversations, check assistant health, and move quickly between the inbox, calls, widgets, and knowledge sources without losing context.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <StatChip key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-surface-dark p-6 text-white shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                      Live Signal
                    </p>
                    <h2 className="mt-2 text-xl font-black">AI performance pulse</h2>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-white/80">
                    <Settings className="size-4" />
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-8">
                  <div className="relative flex size-36 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[10px] border-white/5" />
                    <GlowingRadialChart
                      data={[{ name: 'performance', value: 100, fill: '#25A369' }]}
                      className="size-full"
                    />
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black">100%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    {[
                      { label: 'Resolved', value: String(dashboardSummary?.stats.resolvedCount ?? 1), color: '#25A369' },
                      { label: 'Unread', value: String(dashboardSummary?.stats.unreadCount ?? 0), color: '#F4C95D' },
                      { label: 'Live', value: String(dashboardSummary?.stats.liveCount ?? 0), color: '#D8E7D3' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[12px] font-bold text-white/70">{item.label}</span>
                        </div>
                        <span className="text-sm font-black text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-white/5 p-5 text-sm leading-relaxed text-white/70">
                Use the bright cards for day-to-day metrics, then reserve dark contrast for the live pulse, priority guidance, and control moments that deserve extra weight.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-premium">
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                  Inbox Flow
                </p>
                <h2 className="mt-1 text-lg font-black text-foreground">Recent Conversations</h2>
              </div>
              <Button
                variant="ghost"
                nativeButton={false}
                className="h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                render={<Link href="/admin/conversations" />}
              >
                See all
                <ArrowUpRight className="ml-1.5 size-3.5" />
              </Button>
            </div>

            <div className="flex flex-col p-3">
              {dashboardSummary === undefined ? (
                [...Array(5)].map((_, index) => (
                  <div key={index} className="mb-2 h-[88px] rounded-[24px] bg-[#F5F8F5] dark:bg-zinc-800 animate-pulse" />
                ))
              ) : dashboardSummary.recentConversations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[#EEF6EB] dark:bg-[#3b8332]/10 text-[#3B8332] dark:text-emerald-500">
                    <MessageCircle className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-[#191C1D] dark:text-zinc-100">No conversations yet</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6D7A70] dark:text-zinc-400">
                    New visitor chats will appear here as soon as the first widget starts receiving traffic.
                  </p>
                </div>
              ) : (
                dashboardSummary.recentConversations.map((conv, index) => (
                  <Link
                    key={conv._id}
                    href="/admin/conversations"
                      className={cn(
                        'mb-2 flex items-center justify-between rounded-[24px] border px-4 py-3 transition-colors',
                        index % 2 === 0
                          ? 'border-[#E9EEE7] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-[#FBFCFA] dark:hover:bg-zinc-800'
                          : 'border-[#E7EEE4] dark:border-zinc-800 bg-[#F7FAF5] dark:bg-zinc-800/50 hover:bg-[#F1F6EE] dark:hover:bg-zinc-800'
                      )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-2 rounded-full shadow-sm',
                          conv.unreadForOwner ? 'bg-[#3B8332] shadow-[#3B8332]/35' : 'bg-[#BCCABE]'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black tracking-[0.16em] text-[#7A877F] dark:text-zinc-500">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }).toUpperCase()}
                        </span>
                        <span className="text-sm font-black tracking-tight text-[#191C1D] dark:text-zinc-100">{conv.visitorLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 text-[#647066] dark:text-zinc-400 shadow-sm">
                          {conv.channel === 'text' ? <MessageCircle className="size-4" /> : <PhoneCall className="size-4" />}
                        </div>
                        <span className="text-xs font-black capitalize text-[#647066] dark:text-zinc-400">{conv.channel}</span>
                      </div>
                      <span className="hidden xl:block w-40 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA69D] dark:text-zinc-500">
                        {conv.pageUrl || conv.widgetName}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-premium">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                Quick Actions
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <QuickAction
                  href="/admin/widget"
                  icon={ArrowUpRight}
                  title="Test Widget"
                  description="Preview your assistant experience"
                />
                <QuickAction
                  href="/admin/knowledge-base"
                  icon={BookOpen}
                  title="Knowledge Base"
                  description="Tune what the assistant knows"
                />
              </div>
            </div>

            <div className="rounded-xl bg-surface-dark p-6 text-white shadow-premium">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                Ops Notes
              </p>
              <div className="mt-5 space-y-4">
                <DarkNote icon={Sparkles} title="AI Active" body="Assistants are ready for live traffic and can be tuned from Widget Studio or Settings." />
                <DarkNote icon={Clock} title="Response Readiness" body="Use this darker support block for high-priority context instead of repeating emphasis across every card." />
                <DarkNote icon={PlusCircle} title="Next Move" body="Deploy a new assistant or refine brand defaults to keep future widgets visually consistent." />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'green' | 'slate' | 'amber';
}) {
  const tones = {
    green: 'bg-[#EEF6EB] dark:bg-[#3b8332]/10 text-[#2F6A29] dark:text-emerald-500',
    slate: 'bg-[#F3F5F3] dark:bg-zinc-800 text-[#46534B] dark:text-zinc-400',
    amber: 'bg-[#FFF5E8] dark:bg-amber-500/10 text-[#C77612] dark:text-amber-500',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className={cn('flex size-11 items-center justify-center rounded-2xl', tones[tone])}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-black text-primary">↑ 100%</span>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">vs yesterday</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Button
      variant="ghost"
      nativeButton={false}
      className="h-auto rounded-lg border border-border bg-muted/30 px-5 py-5 text-left hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
      render={<Link href={href} />}
    >
      <div className="flex w-full flex-col items-start">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm">
          <Icon className="size-5" />
        </div>
        <span className="mt-4 text-sm font-black text-foreground">{title}</span>
        <span className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground/80">{description}</span>
      </div>
    </Button>
  );
}

function DarkNote({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-[#A7D49C]">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-black">{title}</p>
          <p className="mt-1 text-xs leading-5 text-white/68">{body}</p>
        </div>
      </div>
    </div>
  );
}
