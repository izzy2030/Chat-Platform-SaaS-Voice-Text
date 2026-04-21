'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Loader2,
  MessageSquare,
  Mic,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';

import { api } from 'convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function WidgetsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const widgets = useQuery(
    api.widgets.getByUserId,
    isLoaded && user ? { userId: user.id } : 'skip'
  );

  const projects = useQuery(
    api.projects.getByUserId,
    isLoaded && user ? { userId: user.id } : 'skip'
  );

  const createWidget = useMutation(api.widgets.create);

  const voiceCount = widgets?.filter((widget) => widget.type === 'voice').length ?? 0;
  const textCount = widgets?.filter((widget) => widget.type === 'text').length ?? 0;
  const domainCount =
    widgets?.reduce((total, widget) => total + widget.allowedDomains.length, 0) ?? 0;

  const handleCreate = async () => {
    if (!user) return;

    if (!projects || projects.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Project Required',
        description: 'You need to create a project first before deploying a widget.',
      });
      return;
    }

    setIsCreating(true);
    try {
      const newWidgetId = await createWidget({
        name: 'New AI Node',
        projectId: projects[0]._id,
        type: 'text',
        webhookUrl: '',
        allowedDomains: [],
        userId: user.id,
        theme: {
          accentColor: '#e4ff04',
          headerTextColor: '#ffffff',
          chatBackgroundColor: '#18181b',
          botBubbleBgColor: '#27272a',
          botTextColor: '#e5e5e5',
          userTextColor: '#ffffff',
          inputBgColor: '#27272a',
          inputTextColor: '#e5e5e5',
          inputBorderColor: '#3f3f46',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      });
      router.push(`/admin/widget/${newWidgetId}`);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error creating node',
        description: err.message || 'An unexpected error occurred.',
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-premium backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-none bg-secondary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-foreground hover:bg-secondary">
                  Widget Studio
                </Badge>
                <Badge
                  variant="ghost"
                  className="rounded-full border-none bg-muted px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/80"
                >
                  Deploy & Preview
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground md:text-5xl">
                  Shape the assistant surfaces visitors actually experience.
                </h1>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Deploy text and voice widgets, tune their runtime footprint, and keep every public-facing assistant aligned with your brand and workflow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroPill label="Total Widgets" value={widgets?.length ?? '—'} tone="green" />
                <HeroPill label="Text Assistants" value={textCount} tone="slate" />
                <HeroPill label="Voice Assistants" value={voiceCount} tone="amber" />
              </div>
            </div>

            <div className="rounded-xl bg-surface-dark p-6 text-white shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                      Studio Snapshot
                    </p>
                    <h2 className="mt-2 text-xl font-black">Launch the next assistant</h2>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-white/80">
                    <Sparkles className="size-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <StudioStat label="Connected domains" value={domainCount} />
                  <StudioStat label="Projects ready" value={projects?.length ?? '—'} />
                </div>

                <div className="mt-6 rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-white/70">
                  Use pale surfaces for the day-to-day cards, then reserve darker contrast like this for launch actions, previews, and higher-importance guidance.
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || projects === undefined}
                className="mt-8 h-12 w-full rounded-lg bg-white text-surface-dark hover:bg-white/90 transition-all duration-300 font-black"
              >
                {isCreating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                Deploy New Node
              </Button>
            </div>
          </div>
        </section>

        {!widgets ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-xl border border-border bg-card animate-pulse shadow-sm" />
            ))}
          </div>
        ) : widgets.length === 0 ? (
          <section className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-premium">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <MessageSquare className="size-8" />
            </div>
            <div className="mx-auto mt-6 max-w-xl space-y-2">
              <h3 className="text-2xl font-black text-foreground">No active nodes yet</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start with a single assistant, then grow into a mix of text and voice experiences as your projects need them.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating || projects === undefined}
              className="mt-8 h-12 rounded-lg px-8 font-black"
            >
              {isCreating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
              Get Started
            </Button>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {widgets.map((widget, index) => (
              <article
                key={widget._id}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
                  index % 3 === 1 && 'bg-muted/30'
                )}
              >
                <div className="border-b border-border/50 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm">
                      {widget.type === 'voice' ? <Mic className="size-5" /> : <MessageSquare className="size-5" />}
                    </div>
                    <Badge
                      className={cn(
                        'rounded-full border-none px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                        widget.type === 'voice'
                          ? 'bg-[#FFF5E8] dark:bg-amber-500/10 text-[#C77612] dark:text-amber-500 hover:bg-[#FFF5E8]'
                          : 'bg-[#ECF6E8] dark:bg-[#3b8332]/10 text-[#2F6A29] dark:text-emerald-500 hover:bg-[#ECF6E8]'
                      )}
                    >
                      {widget.type}
                    </Badge>
                  </div>
                  <div className="mt-5 space-y-1">
                    <h3 className="truncate text-xl font-black tracking-tight text-foreground">
                      {widget.name}
                    </h3>
                    <p className="truncate text-sm font-medium text-muted-foreground">
                      {widget.allowedDomains[0] || 'No domain configured yet'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniMetric label="Domains" value={widget.allowedDomains.length} icon={Globe} />
                    <MiniMetric
                      label="Mode"
                      value={widget.type === 'voice' ? 'Live voice' : 'Text chat'}
                      icon={widget.type === 'voice' ? Mic : MessageSquare}
                    />
                  </div>

                  <div className="mt-5 rounded-lg bg-muted/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                      Visitor Experience
                    </p>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-foreground/80">
                      {widget.allowedDomains.length > 0
                        ? `Ready to appear on ${widget.allowedDomains.length} configured domain${widget.allowedDomains.length === 1 ? '' : 's'}.`
                        : 'Add an allowed domain before embedding this widget publicly.'}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-5">
                    <Button
                      variant="outline"
                      nativeButton={false}
                      className="h-10 flex-1 rounded-lg border-border bg-card text-xs font-black text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                      render={<Link href={`/admin/widget/${widget._id}`} />}
                    >
                      <Settings className="size-3.5" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className="size-10 rounded-lg bg-muted/50 p-0 text-muted-foreground hover:bg-surface-dark hover:text-white transition-all duration-300"
                      render={<Link href={`/widget/${widget._id}`} target="_blank" />}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-6 shadow-premium">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
              Recommended Pattern
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
              Keep the stage calm. Let the important controls carry contrast.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              This page now uses bright white cards for the main catalog, a pale green rhythm for support surfaces, and one dark studio block for momentum and high-priority action.
            </p>
          </div>

          <div className="rounded-xl bg-secondary/50 p-6 border border-secondary/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                <ArrowUpRight className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                  Next Surfaces
                </p>
                <p className="text-lg font-black text-foreground">Calls, Conversations, Settings</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The same visual language is now ready to be reused: quiet backgrounds, stronger hierarchy, and contrast only where it earns attention.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'green' | 'slate' | 'amber';
}) {
  const tones = {
    green: 'bg-[#EEF6EB] dark:bg-[#3b8332]/10 text-[#2F6A29] dark:text-emerald-500',
    slate: 'bg-[#F3F5F3] dark:bg-zinc-800/50 text-[#44524B] dark:text-zinc-400',
    amber: 'bg-[#FFF5E8] dark:bg-amber-500/10 text-[#C77612] dark:text-amber-500',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className={cn('inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]', tones[tone])}>
        {label}
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function StudioStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground/80">
        <Icon className="size-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}
