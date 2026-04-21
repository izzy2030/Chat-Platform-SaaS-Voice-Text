"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  Bot,
  Globe,
  Loader2,
  MessageSquare,
  PhoneCall,
  Search,
  Sparkles,
  User,
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
type ChannelFilter = "all" | "text" | "voice";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
];

const channelOptions: { label: string; value: ChannelFilter }[] = [
  { label: "All Channels", value: "all" },
  { label: "Text", value: "text" },
  { label: "Voice", value: "voice" },
];

export default function ConversationsPage() {
  const { user, isLoaded } = useUser();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const conversationList = useQuery(
    api.conversations.listByUser,
    isLoaded && user ? { userId: user.id, limit: 150 } : "skip"
  );
  const markAsRead = useMutation(api.conversations.markAsRead);
  const updateStatus = useMutation(api.conversations.updateStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!conversationList) {
      return [];
    }

    return conversationList.filter((conversation) => {
      const matchesQuery =
        query.trim().length === 0 ||
        [
          conversation.visitorLabel,
          conversation.pageUrl ?? "",
          conversation.lastMessagePreview,
          conversation.widgetName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || conversation.status === statusFilter;
      const matchesChannel =
        channelFilter === "all" || conversation.channel === channelFilter;

      return matchesQuery && matchesStatus && matchesChannel;
    });
  }, [channelFilter, conversationList, query, statusFilter]);

  const activeConversationId =
    filteredConversations.find((conversation) => conversation._id === selectedId)?._id ??
    filteredConversations[0]?._id ??
    null;

  const activeConversation = useQuery(
    api.conversations.getById,
    isLoaded && user && activeConversationId
      ? { userId: user.id, conversationId: activeConversationId as any }
      : "skip"
  );

  useEffect(() => {
    if (!selectedId && filteredConversations[0]) {
      setSelectedId(filteredConversations[0]._id);
    }
  }, [filteredConversations, selectedId]);

  useEffect(() => {
    if (!user || !activeConversation?._id || !activeConversation.unreadForOwner) {
      return;
    }

    void markAsRead({
      userId: user.id,
      conversationId: activeConversation._id,
    });
  }, [activeConversation?._id, activeConversation?.unreadForOwner, markAsRead, user]);

  const activeCount = conversationList?.filter((item) => item.status === "active").length ?? 0;
  const unreadCount = conversationList?.filter((item) => item.unreadForOwner).length ?? 0;
  const escalatedCount = conversationList?.filter((item) => item.status === "escalated").length ?? 0;

  const handleResolveConversation = async () => {
    if (!user || !activeConversation?._id) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateStatus({
        userId: user.id,
        conversationId: activeConversation._id,
        status: "resolved",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.08),_transparent_22%),linear-gradient(180deg,_rgba(247,248,245,0.88)_0%,_rgba(255,255,255,1)_40%)] p-4 md:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[30px] border border-[#E4EBE1] bg-white/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)]">
          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit border-none bg-[#f0f7ef] dark:bg-[#3b8332]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#3b8332] dark:text-emerald-500">
                  Conversation Log
                </Badge>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-[#191C1D] dark:text-zinc-100 md:text-3xl">
                    Conversations
                  </h1>
                  <p className="max-w-xl text-sm font-medium leading-6 text-[#6D7A70] dark:text-zinc-400">
                    Review visitor chat history, filter by status, and open full transcripts in one place.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <CompactMetric label="Active" value={activeCount} tone="green" />
                <CompactMetric label="Unread" value={unreadCount} tone="slate" />
                <CompactMetric label="Escalated" value={escalatedCount} tone="amber" />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8B978F] dark:text-zinc-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by visitor, widget, or page URL..."
                  className="h-11 rounded-2xl border-[#DCE4DF] dark:border-zinc-800 bg-[#FCFDFC] dark:bg-zinc-900/80 pl-11 text-sm shadow-none placeholder:text-[#96A39A] focus-visible:ring-[#3b8332]/20"
                />
              </div>

              <Select
                value={channelFilter}
                onValueChange={(value) => setChannelFilter((value as ChannelFilter | null) ?? "all")}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-[#DCE4DF] dark:border-zinc-800 bg-[#FCFDFC] dark:bg-zinc-900/80 px-4 text-sm font-semibold text-[#31423B] dark:text-zinc-200 shadow-none">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div className="overflow-hidden rounded-[30px] border border-[#E4EBE1] bg-white/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)]">
            <div className="flex items-center justify-between border-b border-[#ECF0ED] dark:border-zinc-800 px-4 py-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#6D7A70] dark:text-zinc-400">
                  All Conversations
                </h2>
                <p className="mt-1 text-xs font-medium text-[#8B978F] dark:text-zinc-500">
                  {filteredConversations.length} matching threads
                </p>
              </div>
            </div>

            <div className="flex flex-col p-3">
              {conversationList === undefined ? (
                [...Array(8)].map((_, index) => (
                  <div key={index} className="mb-2 h-[92px] animate-pulse rounded-[22px] bg-[#F4F7F5] dark:bg-zinc-800" />
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-[#f0f7ef] dark:bg-[#3b8332]/10 text-[#3b8332]">
                    <MessageSquare className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#191C1D] dark:text-zinc-100">No conversations match those filters</h3>
                    <p className="max-w-md text-sm leading-6 text-[#7E8B83] dark:text-zinc-400">
                      Try clearing your search or switching the status and channel filters back to all.
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isSelected = conversation._id === activeConversationId;

                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => setSelectedId(conversation._id)}
                      className={cn(
                        "mb-2 rounded-[22px] border px-4 py-3 text-left transition-all duration-200",
                        isSelected
                          ? "border-[#B9E9D1] dark:border-emerald-800/40 bg-[#F7FFFB] dark:bg-zinc-900/40 shadow-[0_14px_40px_rgba(0,177,113,0.08)]"
                          : "border-[#ECF0ED] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#D8E6DE] dark:border-zinc-800 hover:bg-[#FBFCFB] dark:bg-zinc-900/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F5F3] dark:bg-zinc-800/60 text-[#66746C] dark:text-zinc-400">
                          {conversation.channel === "voice" ? (
                            <PhoneCall className="size-4" />
                          ) : (
                            <MessageSquare className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-black text-[#191C1D] dark:text-zinc-100">
                              {conversation.visitorLabel}
                            </h3>
                            <StatusBadge status={conversation.status} />
                            {conversation.unreadForOwner ? (
                              <Badge className="border-none bg-[#191C1D] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                                New
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm font-medium text-[#6D7A70] dark:text-zinc-400">
                            {conversation.lastMessagePreview || "No transcript preview yet"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#7A877F]">
                            <span>{formatRelative(conversation.lastMessageAt)}</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span className="capitalize">{conversation.channel}</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span>{conversation.messageCount} messages</span>
                            <span className="text-[#B5BEB8]">•</span>
                            <span className="truncate">{conversation.widgetName}</span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 overflow-hidden text-[11px] font-semibold text-[#809086]">
                            <Globe className="size-3.5 shrink-0" />
                            <span className="truncate">{conversation.pageUrl || "Unknown page"}</span>
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
            {activeConversation ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-white">
                          {activeConversation.visitorLabel}
                        </h2>
                        <StatusBadge status={activeConversation.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/58">
                        <span>{activeConversation.widgetName}</span>
                        <span className="text-[#B5BEB8]">•</span>
                        <span>Started {formatRelative(activeConversation.startedAt)}</span>
                      </div>
                    </div>
                    {activeConversation.status !== "resolved" && activeConversation.status !== "escalated" ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUpdatingStatus}
                        onClick={handleResolveConversation}
                        className="h-9 rounded-2xl border-white/10 bg-white/6 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-none hover:bg-white/10"
                      >
                        {isUpdatingStatus ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
                        Close Conversation
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 border-b border-white/10 bg-white/5 p-4 text-sm text-white md:grid-cols-2">
                  <DetailRow label="Channel" value={activeConversation.channel} icon={activeConversation.channel === "voice" ? PhoneCall : MessageSquare} />
                  <DetailRow label="Visitor" value={activeConversation.visitorEmail ?? activeConversation.visitorLabel} icon={User} />
                  <DetailRow label="Current Page" value={activeConversation.pageUrl ?? "Unknown page"} icon={Globe} />
                  <DetailRow label="Widget" value={activeConversation.widgetName} icon={Sparkles} />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/58">
                      Transcript
                    </h3>
                    <div className="text-right">
                      <span className="block text-[11px] font-semibold text-white/58">
                        Latest activity {formatRelative(activeConversation.lastMessageAt)}
                      </span>
                      {activeConversation.resolutionReason ? (
                          <span className="block text-[10px] font-semibold text-white/46">
                          {formatResolutionReason(activeConversation.resolutionReason)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 rounded-[24px] bg-white/5 p-3">
                    {activeConversation.messages.map((message) => (
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
                        <p className="text-sm leading-6">{message.body}</p>
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
                  <h3 className="text-lg font-black text-white">Pick a conversation to inspect</h3>
                  <p className="text-sm leading-6 text-white/62">
                    Visitor metadata and transcript details will appear here.
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

function CompactMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "slate" | "amber";
}) {
  const toneClasses = {
    green: "bg-[#F4FFF8] dark:bg-emerald-500/10 text-[#3b8332] dark:text-emerald-500",
    slate: "bg-[#F4F6F5] dark:bg-zinc-800/80 text-[#44524B] dark:text-zinc-400",
    amber: "bg-[#FFF8ED] dark:bg-amber-500/10 text-[#C77612] dark:text-amber-500",
  };

  return (
    <div className="rounded-[22px] border border-[#E4EBE1] bg-white/82 px-4 py-3">
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-2xl", toneClasses[tone])}>
        <MessageSquare className="size-4" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7A877F]">{label}</p>
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

function formatResolutionReason(reason: "manual" | "auto_inactive" | "auto_greeting") {
  const labels = {
    manual: "Closed manually",
    auto_inactive: "Auto-closed after inactivity",
    auto_greeting: "Auto-closed after greeting-only inactivity",
  } as const;

  return labels[reason];
}

