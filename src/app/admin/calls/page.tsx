"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  AudioLines,
  Bot,
  Download,
  Globe,
  PhoneCall,
  Search,
  User,
  Waves,
} from "lucide-react";

import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "ongoing" | "resolved" | "escalated";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
];

export default function CallsPage() {
  const { user, isLoaded } = useUser();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const calls = useQuery(
    api.conversations.listCallsByUser,
    isLoaded && user ? { userId: user.id, limit: 150 } : "skip"
  );
  const markAsRead = useMutation(api.conversations.markAsRead);

  const filteredCalls = useMemo(() => {
    if (!calls) {
      return [];
    }

    return calls.filter((call) => {
      const matchesQuery =
        query.trim().length === 0 ||
        [
          call.visitorLabel,
          call.pageUrl ?? "",
          call.widgetName,
          call.lastMessagePreview,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesStatus = statusFilter === "all" || call.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [calls, query, statusFilter]);

  const activeCallId =
    filteredCalls.find((call) => call._id === selectedId)?._id ??
    filteredCalls[0]?._id ??
    null;

  const activeCall = useQuery(
    api.conversations.getById,
    isLoaded && user && activeCallId
      ? { userId: user.id, conversationId: activeCallId as any }
      : "skip"
  );

  useEffect(() => {
    if (!selectedId && filteredCalls[0]) {
      setSelectedId(filteredCalls[0]._id);
    }
  }, [filteredCalls, selectedId]);

  useEffect(() => {
    if (!user || !activeCall?._id || !activeCall.unreadForOwner) {
      return;
    }

    void markAsRead({
      userId: user.id,
      conversationId: activeCall._id,
    });
  }, [activeCall?._id, activeCall?.unreadForOwner, markAsRead, user]);

  const totalCalls = calls?.length ?? 0;
  const totalRecordings = calls?.reduce((sum, call) => sum + call.recordingCount, 0) ?? 0;
  const totalDurationMs = calls?.reduce((sum, call) => sum + call.totalDurationMs, 0) ?? 0;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.08),_transparent_22%),linear-gradient(180deg,_rgba(247,248,245,0.88)_0%,_rgba(255,255,255,1)_40%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.04),_transparent_22%),linear-gradient(180deg,_rgba(9,9,11,1)_0%,_rgba(9,9,11,0.98)_40%)] p-4 md:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[30px] border border-[#E4EBE1] dark:border-zinc-800 bg-white/92 dark:bg-zinc-900/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)]">
          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit border-none bg-[#f0f7ef] dark:bg-[#3b8332]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#3b8332] dark:text-emerald-500">
                  Calls Log
                </Badge>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-[#191C1D] dark:text-zinc-100 md:text-3xl">
                    Voice Calls
                  </h1>
                  <p className="max-w-xl text-sm font-medium leading-6 text-[#6D7A70] dark:text-zinc-400">
                    Review voice-agent sessions, play stored recordings, and inspect transcripts from each audio interaction.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Calls" value={totalCalls} tone="green" />
                <Metric label="Recordings" value={totalRecordings} tone="slate" />
                <Metric label="Duration" value={formatDuration(totalDurationMs)} tone="amber" />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8B978F] dark:text-zinc-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by visitor, page URL, or widget..."
                  className="h-11 rounded-2xl border-[#DCE4DF] dark:border-zinc-800 bg-[#FCFDFC] dark:bg-zinc-900/80 pl-11 text-sm shadow-none placeholder:text-[#96A39A] focus-visible:ring-[#3b8332]/20"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as StatusFilter | null) ?? "all")}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-[#DCE4DF] dark:border-zinc-800 bg-[#FCFDFC] dark:bg-zinc-900/80 px-4 text-sm font-semibold text-[#31423B] dark:text-zinc-200 shadow-none">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,1fr)]">
          <div className="overflow-hidden rounded-[30px] border border-[#E4EBE1] dark:border-zinc-800 bg-white/92 dark:bg-zinc-900/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)]">
            <div className="flex items-center justify-between border-b border-[#ECF0ED] dark:border-zinc-800 px-4 py-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#6D7A70] dark:text-zinc-400">
                  All Calls
                </h2>
                <p className="mt-1 text-xs font-medium text-[#8B978F] dark:text-zinc-500">
                  {filteredCalls.length} matching voice sessions
                </p>
              </div>
            </div>

            <div className="flex flex-col p-3">
              {calls === undefined ? (
                [...Array(7)].map((_, index) => (
                  <div key={index} className="mb-2 h-[100px] animate-pulse rounded-[22px] bg-[#F4F7F5] dark:bg-zinc-800" />
                ))
              ) : filteredCalls.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-[#f0f7ef] dark:bg-[#3b8332]/10 text-[#3b8332]">
                    <PhoneCall className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#191C1D] dark:text-zinc-100">No voice calls match those filters</h3>
                    <p className="max-w-md text-sm leading-6 text-[#7E8B83] dark:text-zinc-500">
                      Once visitors use the voice agent, their sessions and recordings will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filteredCalls.map((call) => {
                  const isSelected = call._id === activeCallId;

                  return (
                    <button
                      key={call._id}
                      type="button"
                      onClick={() => setSelectedId(call._id)}
                      className={cn(
                        "mb-2 rounded-[22px] border px-4 py-3 text-left transition-all duration-200",
                        isSelected
                          ? "border-[#B9E9D1] dark:border-emerald-800/40 bg-[#F7FFFB] dark:bg-zinc-900/40 shadow-[0_14px_40px_rgba(0,177,113,0.08)]"
                          : "border-[#ECF0ED] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#D8E6DE] dark:border-zinc-800 hover:bg-[#FBFCFB] dark:bg-zinc-900/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F5F3] dark:bg-zinc-800/60 text-[#66746C] dark:text-zinc-400">
                          <PhoneCall className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-black text-[#191C1D] dark:text-zinc-100">
                              {call.visitorLabel}
                            </h3>
                            <StatusBadge status={call.status} />
                            {call.unreadForOwner ? (
                              <Badge className="border-none bg-[#191C1D] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                                New
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm font-medium text-[#6D7A70] dark:text-zinc-400">
                            {call.lastMessagePreview || "Voice interaction recorded"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#7A877F] dark:text-zinc-500">
                            <span>{formatRelative(call.lastMessageAt)}</span>
                            <span className="text-[#B5BEB8] dark:text-zinc-600">•</span>
                            <span>{call.recordingCount} recordings</span>
                            <span className="text-[#B5BEB8] dark:text-zinc-600">•</span>
                            <span>{formatDuration(call.totalDurationMs)}</span>
                            <span className="text-[#B5BEB8] dark:text-zinc-600">•</span>
                            <span className="truncate">{call.widgetName}</span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 overflow-hidden text-[11px] font-semibold text-[#809086] dark:text-zinc-500">
                            <Globe className="size-3.5 shrink-0" />
                            <span className="truncate">{call.pageUrl || "Unknown page"}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] bg-[#1C2320] text-white shadow-[0_24px_70px_-34px_rgba(28,35,32,0.8)]">
            {activeCall ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-white">
                        {activeCall.visitorLabel}
                      </h2>
                      <StatusBadge status={activeCall.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/58">
                      <span>{activeCall.widgetName}</span>
                      <span className="text-[#B5BEB8]">•</span>
                      <span>{activeCall.recordingCount} clips</span>
                      <span className="text-[#B5BEB8]">•</span>
                      <span>Total {formatDuration(activeCall.totalDurationMs)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-b border-white/10 bg-white/5 p-4 text-sm text-white md:grid-cols-2">
                  <DetailRow label="Channel" value="voice" icon={PhoneCall} />
                  <DetailRow label="Visitor" value={activeCall.visitorEmail ?? activeCall.visitorLabel} icon={User} />
                  <DetailRow label="Current Page" value={activeCall.pageUrl ?? "Unknown page"} icon={Globe} />
                  <DetailRow label="Started" value={formatRelative(activeCall.startedAt)} icon={Waves} />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/58">
                      Recordings
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-white/52">
                      Stored voice clips from this audio session.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {activeCall.messages.filter((message) => message.kind === "audio").length === 0 ? (
                      <div className="rounded-[20px] border border-dashed border-white/10 bg-white/5 p-4 text-sm font-medium text-white/62">
                        No audio clips were stored for this call yet.
                      </div>
                    ) : (
                      activeCall.messages
                        .filter((message) => message.kind === "audio")
                        .map((message) => (
                          <div key={message._id} className="rounded-[20px] bg-white/5 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-[#3b8332] shadow-sm">
                                  <AudioLines className="size-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-white">Voice Recording</p>
                                  <p className="text-[11px] font-semibold text-white/52">
                                    {formatRelative(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Badge className="border-none bg-[#EFF5FF] dark:bg-blue-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#245BBA] dark:text-blue-400">
                                {formatDuration(message.durationMs ?? 0)}
                              </Badge>
                            </div>
                            {message.audioUrl && (!message.expiresAt || message.expiresAt > Date.now()) ? (
                              <audio controls className="w-full">
                                <source src={message.audioUrl} />
                              </audio>
                            ) : (
                              <p className="text-xs font-medium text-white/58">
                                {message.expiresAt && message.expiresAt <= Date.now()
                                  ? "This recording has expired."
                                  : "Recording upload unavailable for this clip."}
                              </p>
                            )}
                          </div>
                        ))
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#6D7A70] dark:text-zinc-400">
                        Transcript
                      </h3>
                    </div>
                    {activeCall && (
                      <Button
                        variant="ghost"
                        size="sm"
                      className="h-7 gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#A7D49C] hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          const content = activeCall.messages
                            .map((m) => {
                              const time = new Date(m.createdAt).toLocaleTimeString();
                              const sender = m.sender === "agent" ? "AGENT" : "VISITOR";
                              const body = m.kind === "audio" ? "[Voice Recording]" : m.body;
                              return `[${time}] ${sender}: ${body}`;
                            })
                            .join("\n");
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `transcript-${activeCall.visitorLabel}-${new Date().toISOString().split("T")[0]}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="size-3" />
                        Download
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 rounded-[24px] bg-white/5 p-3">
                    {activeCall.messages.map((message) => (
                      <div
                        key={message._id}
                        className={cn(
                          "max-w-[88%] rounded-[20px] px-3.5 py-2.5 shadow-sm",
                          message.sender === "agent"
                            ? "self-start bg-white dark:bg-zinc-900 text-[#203129]"
                            : "self-end bg-[#3b8332] text-white"
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
                          {message.sender === "agent" ? (
                            <>
                              <Bot className="size-3.5" />
                              Agent
                            </>
                          ) : (
                            <>
                              <User className="size-3.5" />
                              Visitor
                            </>
                          )}
                        </div>
                        {message.kind === "audio" ? (
                          <p className="text-sm leading-6">
                            Voice recording
                            {message.durationMs ? ` • ${formatDuration(message.durationMs)}` : ""}
                          </p>
                        ) : (
                          <p className="text-sm leading-6">{message.body}</p>
                        )}
                        <p
                          className={cn(
                            "mt-1.5 text-[10px] font-semibold",
                            message.sender === "agent" ? "text-[#7B8B82] dark:text-zinc-500" : "text-white/75"
                          )}
                        >
                          {formatRelative(message.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Pick a call to inspect</h3>
                  <p className="text-sm leading-6 text-white/62">
                    Recording playback and transcript details will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "green" | "slate" | "amber";
}) {
  const toneClasses = {
    green: "bg-[#F4FFF8] dark:bg-emerald-500/10 text-[#3b8332] dark:text-emerald-500",
    slate: "bg-[#F4F6F5] dark:bg-zinc-800/80 text-[#44524B] dark:text-zinc-400",
    amber: "bg-[#FFF8ED] dark:bg-amber-500/10 text-[#C77612] dark:text-amber-500",
  };

  return (
    <div className="rounded-[22px] border border-[#E4EBE1] dark:border-zinc-800 bg-white/82 dark:bg-zinc-900/80 px-4 py-3">
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-2xl", toneClasses[tone])}>
        <PhoneCall className="size-4" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7A877F] dark:text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-[#191C1D] dark:text-zinc-100">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "ongoing" | "resolved" | "escalated";
}) {
  const styles = {
    active: "bg-[#f0f7ef] dark:bg-[#3b8332]/10 text-[#3b8332] dark:text-emerald-500",
    ongoing: "bg-[#EFF5FF] dark:bg-blue-500/10 text-[#245BBA] dark:text-blue-400",
    resolved: "bg-[#F2F4F5] dark:bg-zinc-800/50 text-[#5B6760] dark:text-zinc-400",
    escalated: "bg-[#FFF0EC] dark:bg-red-500/10 text-[#CC5A2A] dark:text-red-400",
  };

  return (
    <Badge className={cn("border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]", styles[status])}>
      {status}
    </Badge>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/70">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/46">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function formatRelative(value: number) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(Math.round(durationMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

