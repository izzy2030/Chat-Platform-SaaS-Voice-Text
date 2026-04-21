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
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.12),_transparent_24%),linear-gradient(180deg,_rgba(247,248,245,0.94)_0%,_rgba(255,255,255,1)_42%)] p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white/90 shadow-[0_28px_80px_-42px_rgba(24,28,29,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border-none bg-[#ECF6E8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#2F6A29] hover:bg-[#ECF6E8]">
                  Widget Studio
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-[#DCE8D7] bg-[#F8FBF6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#677569]"
                >
                  Deploy & Preview
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#191C1D] md:text-5xl">
                  Shape the assistant surfaces visitors actually experience.
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-6 text-[#69756D] md:text-base">
                  Deploy text and voice widgets, tune their runtime footprint, and keep every public-facing assistant aligned with your brand and workflow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroPill label="Total Widgets" value={widgets?.length ?? '—'} tone="green" />
                <HeroPill label="Text Assistants" value={textCount} tone="slate" />
                <HeroPill label="Voice Assistants" value={voiceCount} tone="amber" />
              </div>
            </div>

            <div className="rounded-[28px] bg-[#1C2320] p-5 text-white shadow-[0_24px_70px_-34px_rgba(28,35,32,0.85)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
                    Studio Snapshot
                  </p>
                  <h2 className="mt-2 text-xl font-black">Launch the next assistant</h2>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="size-5 text-[#A7D49C]" />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <StudioStat label="Connected domains" value={domainCount} />
                <StudioStat label="Projects ready" value={projects?.length ?? '—'} />
              </div>

              <div className="mt-6 rounded-[24px] bg-white/6 p-4">
                <p className="text-sm font-semibold leading-6 text-white/88">
                  Use pale surfaces for the day-to-day cards, then reserve darker contrast like this for launch actions, previews, and higher-importance guidance.
                </p>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || projects === undefined}
                className="mt-6 h-11 w-full rounded-2xl bg-white text-[#18201C] hover:bg-[#F3F7F1]"
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
              <div key={i} className="h-72 rounded-[30px] border border-[#E5ECE1] bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : widgets.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-[#D7E3D4] bg-white/80 p-10 text-center shadow-[0_18px_55px_-42px_rgba(24,28,29,0.32)]">
            <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-[#EEF6EB] text-[#3B8332]">
              <MessageSquare className="size-9" />
            </div>
            <div className="mx-auto mt-6 max-w-xl space-y-2">
              <h3 className="text-2xl font-black text-[#191C1D]">No active nodes yet</h3>
              <p className="text-sm leading-7 text-[#6A766E]">
                Start with a single assistant, then grow into a mix of text and voice experiences as your projects need them.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating || projects === undefined}
              className="mt-8 h-12 rounded-2xl px-8"
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
                  'group relative flex flex-col overflow-hidden rounded-[30px] border border-[#E3EAE0] bg-white/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_72px_-40px_rgba(24,28,29,0.38)]',
                  index % 3 === 1 && 'bg-[#F7FAF5]'
                )}
              >
                <div className="border-b border-[#EDF2EA] px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#EEF6EB] text-[#3B8332]">
                      {widget.type === 'voice' ? <Mic className="size-5" /> : <MessageSquare className="size-5" />}
                    </div>
                    <Badge
                      className={cn(
                        'rounded-full border-none px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                        widget.type === 'voice'
                          ? 'bg-[#FFF5E8] text-[#C77612] hover:bg-[#FFF5E8]'
                          : 'bg-[#ECF6E8] text-[#2F6A29] hover:bg-[#ECF6E8]'
                      )}
                    >
                      {widget.type}
                    </Badge>
                  </div>
                  <div className="mt-5 space-y-1">
                    <h3 className="truncate text-xl font-black tracking-tight text-[#191C1D]">
                      {widget.name}
                    </h3>
                    <p className="truncate text-sm font-medium text-[#6D7A70]">
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

                  <div className="mt-5 rounded-[24px] bg-[#F7FAF5] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#758177]">
                      Visitor Experience
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#243028]">
                      {widget.allowedDomains.length > 0
                        ? `Ready to appear on ${widget.allowedDomains.length} configured domain${widget.allowedDomains.length === 1 ? '' : 's'}.`
                        : 'Add an allowed domain before embedding this widget publicly.'}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-5">
                    <Button
                      variant="outline"
                      nativeButton={false}
                      className="h-10 flex-1 rounded-xl border-[#D8E3D5] bg-white text-xs font-black text-[#203028] hover:bg-[#EEF6EB] hover:text-[#2F6A29]"
                      render={<Link href={`/admin/widget/${widget._id}`} />}
                    >
                      <Settings className="size-3.5" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className="size-10 rounded-xl bg-[#F1F5F0] p-0 text-[#536158] hover:bg-[#1C2320] hover:text-white"
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
          <div className="rounded-[30px] border border-[#E5ECE1] bg-white/90 p-6 shadow-[0_18px_55px_-40px_rgba(24,28,29,0.28)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#738074]">
              Recommended Pattern
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#191C1D]">
              Keep the stage calm. Let the important controls carry contrast.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#69756D]">
              This page now uses bright white cards for the main catalog, a pale green rhythm for support surfaces, and one dark studio block for momentum and high-priority action. That same balance is what we can now echo through the rest of the admin.
            </p>
          </div>

          <div className="rounded-[30px] bg-[#F7FAF5] p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#3B8332] shadow-sm">
                <ArrowUpRight className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#758177]">
                  Next Surfaces
                </p>
                <p className="text-lg font-black text-[#191C1D]">Dashboard, Calls, Conversations, Knowledge Base</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#68746C]">
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
    green: 'bg-[#EEF6EB] text-[#2F6A29]',
    slate: 'bg-[#F3F5F3] text-[#44524B]',
    amber: 'bg-[#FFF5E8] text-[#C77612]',
  };

  return (
    <div className="rounded-[24px] border border-[#E6EDE3] bg-white/80 p-4">
      <div className={cn('inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]', tones[tone])}>
        {label}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-[#191C1D]">{value}</p>
    </div>
  );
}

function StudioStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/48">{label}</p>
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
    <div className="rounded-[22px] border border-[#E7EEE4] bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[#607064]">
        <Icon className="size-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-black text-[#191C1D]">{value}</p>
    </div>
  );
}
