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
    <div className="min-h-full bg-[linear-gradient(180deg,_#F7FAF8_0%,_#F3F5F6_100%)] p-4 md:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_60px_rgba(25,28,29,0.06)]">
          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit border-none bg-[#EBFBF3] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#008353]">
                  Calls Log
                </Badge>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-[#191C1D] md:text-3xl">
                    Voice Calls
                  </h1>
                  <p className="max-w-xl text-sm font-medium leading-6 text-[#6D7A70]">
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
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8B978F]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by visitor, page URL, or widget..."
                  className="h-11 rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] pl-11 text-sm shadow-none placeholder:text-[#96A39A] focus-visible:ring-[#00B171]/20"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter((value as StatusFilter | null) ?? "all")}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] px-4 text-sm font-semibold text-[#31423B] shadow-none">
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
          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_18px_60px_rgba(25,28,29,0.05)]">
            <div className="flex items-center justify-between border-b border-[#ECF0ED] px-4 py-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                  All Calls
                </h2>
                <p className="mt-1 text-xs font-medium text-[#8B978F]">
                  {filteredCalls.length} matching voice sessions
                </p>
              </div>
            </div>

            <div className="flex flex-col p-3">
              {calls === undefined ? (
                [...Array(7)].map((_, index) => (
                  <div key={index} className="mb-2 h-[100px] animate-pulse rounded-[22px] bg-[#F4F7F5]" />
                ))
              ) : filteredCalls.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-[#EBFBF3] text-[#00B171]">
                    <PhoneCall className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#191C1D]">No voice calls match those filters</h3>
                    <p className="max-w-md text-sm leading-6 text-[#7E8B83]">
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
                          ? "border-[#B9E9D1] bg-[#F7FFFB] shadow-[0_14px_40px_rgba(0,177,113,0.08)]"
                          : "border-[#ECF0ED] bg-white hover:border-[#D8E6DE] hover:bg-[#FBFCFB]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F5F3] text-[#66746C]">
                          <PhoneCall className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-black text-[#191C1D]">
                              {call.visitorLabel}
                            </h3>
                            <StatusBadge status={call.status} />
                            {call.unreadForOwner ? (
                              <Badge className="border-none bg-[#191C1D] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                                New
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm font-medium text-[#6D7A70]">
                            {call.lastMessagePreview || "Voice interaction recorded"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#7A877F]">
                            <span>{formatRelative(call.lastMessageAt)}</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span>{call.recordingCount} recordings</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span>{formatDuration(call.totalDurationMs)}</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span className="truncate">{call.widgetName}</span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 overflow-hidden text-[11px] font-semibold text-[#809086]">
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

          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_18px_60px_rgba(25,28,29,0.05)]">
            {activeCall ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-[#ECF0ED] px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-[#191C1D]">
                        {activeCall.visitorLabel}
                      </h2>
                      <StatusBadge status={activeCall.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#7A877F]">
                      <span>{activeCall.widgetName}</span>
                      <span className="text-[#B5BEB8]">•</span>
                      <span>{activeCall.recordingCount} clips</span>
                      <span className="text-[#B5BEB8]">•</span>
                      <span>Total {formatDuration(activeCall.totalDurationMs)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-b border-[#ECF0ED] bg-[#FBFCFB] p-4 text-sm text-[#536059] md:grid-cols-2">
                  <DetailRow label="Channel" value="voice" icon={PhoneCall} />
                  <DetailRow label="Visitor" value={activeCall.visitorEmail ?? activeCall.visitorLabel} icon={User} />
                  <DetailRow label="Current Page" value={activeCall.pageUrl ?? "Unknown page"} icon={Globe} />
                  <DetailRow label="Started" value={formatRelative(activeCall.startedAt)} icon={Waves} />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                      Recordings
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-[#8B978F]">
                      Stored voice clips from this audio session.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {activeCall.messages.filter((message) => message.kind === "audio").length === 0 ? (
                      <div className="rounded-[20px] border border-dashed border-[#DCE4DF] bg-[#F8FAF9] p-4 text-sm font-medium text-[#6D7A70]">
                        No audio clips were stored for this call yet.
                      </div>
                    ) : (
                      activeCall.messages
                        .filter((message) => message.kind === "audio")
                        .map((message) => (
                          <div key={message._id} className="rounded-[20px] border border-[#E7ECE8] bg-[#F8FAF9] p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-[#00B171] shadow-sm">
                                  <AudioLines className="size-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#191C1D]">Voice Recording</p>
                                  <p className="text-[11px] font-semibold text-[#7A877F]">
                                    {formatRelative(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Badge className="border-none bg-[#EFF5FF] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#245BBA]">
                                {formatDuration(message.durationMs ?? 0)}
                              </Badge>
                            </div>
                            {message.audioUrl && (!message.expiresAt || message.expiresAt > Date.now()) ? (
                              <audio controls className="w-full">
                                <source src={message.audioUrl} />
                              </audio>
                            ) : (
                              <p className="text-xs font-medium text-[#7E8B83]">
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
                      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                        Transcript
                      </h3>
                    </div>
                    {activeCall && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#008353] hover:bg-[#EBFBF3] hover:text-[#008353]"
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
                  <div className="mt-3 flex flex-col gap-2 rounded-[24px] bg-[#F5F8F6] p-3">
                    {activeCall.messages.map((message) => (
                      <div
                        key={message._id}
                        className={cn(
                          "max-w-[88%] rounded-[20px] px-3.5 py-2.5 shadow-sm",
                          message.sender === "agent"
                            ? "self-start bg-white text-[#203129]"
                            : "self-end bg-[#00B171] text-white"
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
                            message.sender === "agent" ? "text-[#7B8B82]" : "text-white/75"
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
                  <h3 className="text-lg font-black text-[#191C1D]">Pick a call to inspect</h3>
                  <p className="text-sm leading-6 text-[#7E8B83]">
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
    green: "bg-[#F4FFF8] text-[#008353]",
    slate: "bg-[#F4F6F5] text-[#44524B]",
    amber: "bg-[#FFF8ED] text-[#C77612]",
  };

  return (
    <div className="rounded-[20px] border border-[#E8EEEA] bg-[#FCFDFC] px-4 py-3">
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-2xl", toneClasses[tone])}>
        <PhoneCall className="size-4" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7A877F]">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-[#191C1D]">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "ongoing" | "resolved" | "escalated";
}) {
  const styles = {
    active: "bg-[#EBFBF3] text-[#008353]",
    ongoing: "bg-[#EFF5FF] text-[#245BBA]",
    resolved: "bg-[#F2F4F5] text-[#5B6760]",
    escalated: "bg-[#FFF0EC] text-[#CC5A2A]",
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
    <div className="flex items-start gap-3 rounded-2xl border border-[#E7ECE8] bg-white p-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-[#F4F7F5] text-[#66746C]">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#90A096]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#31423B]">{value}</p>
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
