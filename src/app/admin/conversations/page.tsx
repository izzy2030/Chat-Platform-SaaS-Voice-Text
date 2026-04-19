"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Filter,
  Globe,
  MessageSquare,
  PhoneCall,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

type ConversationStatus = "active" | "ongoing" | "resolved" | "escalated";
type ConversationChannel = "text" | "voice";

type ConversationMessage = {
  id: string;
  role: "visitor" | "agent";
  text: string;
  sentAt: string;
};

type ConversationRecord = {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  summary: string;
  pageUrl: string;
  widgetName: string;
  startedAt: string;
  lastMessageAt: string;
  unread: boolean;
  sentiment: "warm" | "neutral" | "urgent";
  messages: ConversationMessage[];
};

const conversations: ConversationRecord[] = [
  {
    id: "conv_51",
    visitorName: "Visitor f5eadeec",
    visitorEmail: "alex@northstarhq.co",
    channel: "text",
    status: "active",
    summary: "Asked about pricing tiers and whether the AI agent can hand off to a human rep.",
    pageUrl: "https://preview--northstarhq.ai/pricing",
    widgetName: "Sales Concierge",
    startedAt: "2026-04-18T16:17:00.000Z",
    lastMessageAt: "2026-04-18T16:23:00.000Z",
    unread: true,
    sentiment: "warm",
    messages: [
      {
        id: "m_1",
        role: "visitor",
        text: "Hey, does your chat agent support live handoff when someone asks for sales?",
        sentAt: "2026-04-18T16:17:00.000Z",
      },
      {
        id: "m_2",
        role: "agent",
        text: "Yes. You can route high-intent leads into email, Slack, or a booking flow depending on your setup.",
        sentAt: "2026-04-18T16:18:00.000Z",
      },
      {
        id: "m_3",
        role: "visitor",
        text: "Nice. What plan includes that?",
        sentAt: "2026-04-18T16:23:00.000Z",
      },
    ],
  },
  {
    id: "conv_50",
    visitorName: "Visitor 713f5427",
    visitorEmail: "maria@4fca2cab.io",
    channel: "text",
    status: "ongoing",
    summary: "Reviewing embed instructions for a multi-domain setup on staging and production.",
    pageUrl: "https://4fca2cab-cc01-49f0-a9fd.example.com/docs/embed",
    widgetName: "Support Agent",
    startedAt: "2026-04-18T13:09:00.000Z",
    lastMessageAt: "2026-04-18T13:14:00.000Z",
    unread: false,
    sentiment: "neutral",
    messages: [
      {
        id: "m_4",
        role: "visitor",
        text: "Can I whitelist both production and preview URLs in one widget?",
        sentAt: "2026-04-18T13:09:00.000Z",
      },
      {
        id: "m_5",
        role: "agent",
        text: "You can. Add each allowed domain separately in the widget settings before publishing.",
        sentAt: "2026-04-18T13:10:00.000Z",
      },
      {
        id: "m_6",
        role: "visitor",
        text: "Perfect. I just needed to confirm staging won't break the production embed.",
        sentAt: "2026-04-18T13:14:00.000Z",
      },
    ],
  },
  {
    id: "conv_49",
    visitorName: "Visitor 68ee418c",
    channel: "voice",
    status: "resolved",
    summary: "Voice caller requested callback timing and account access help.",
    pageUrl: "https://preview--a6222f723-22.example.com/contact",
    widgetName: "Voice Intake",
    startedAt: "2026-04-17T22:55:00.000Z",
    lastMessageAt: "2026-04-17T23:04:00.000Z",
    unread: false,
    sentiment: "urgent",
    messages: [
      {
        id: "m_7",
        role: "visitor",
        text: "I need someone to call me back. I can't get into the dashboard and my campaign launches tonight.",
        sentAt: "2026-04-17T22:55:00.000Z",
      },
      {
        id: "m_8",
        role: "agent",
        text: "I've marked this as urgent and shared the fastest recovery steps while your request is routed.",
        sentAt: "2026-04-17T22:57:00.000Z",
      },
      {
        id: "m_9",
        role: "agent",
        text: "A support specialist has been notified and will follow up by email shortly.",
        sentAt: "2026-04-17T23:04:00.000Z",
      },
    ],
  },
  {
    id: "conv_48",
    visitorName: "Visitor 57f4fe00",
    channel: "text",
    status: "escalated",
    summary: "Requested enterprise security docs and custom retention controls.",
    pageUrl: "https://preview--a6222f723-22.example.com/security",
    widgetName: "Sales Concierge",
    startedAt: "2026-04-16T18:31:00.000Z",
    lastMessageAt: "2026-04-16T18:42:00.000Z",
    unread: true,
    sentiment: "urgent",
    messages: [
      {
        id: "m_10",
        role: "visitor",
        text: "Before we move forward, I need to know whether we can control transcript retention and export policies.",
        sentAt: "2026-04-16T18:31:00.000Z",
      },
      {
        id: "m_11",
        role: "agent",
        text: "I can share our standard security posture, but retention policy customization needs a human review.",
        sentAt: "2026-04-16T18:34:00.000Z",
      },
      {
        id: "m_12",
        role: "visitor",
        text: "Please have someone follow up with the enterprise packet.",
        sentAt: "2026-04-16T18:42:00.000Z",
      },
    ],
  },
  {
    id: "conv_47",
    visitorName: "Visitor 19ad77b2",
    channel: "text",
    status: "resolved",
    summary: "Confirmed setup steps for connecting the widget to an existing knowledge base.",
    pageUrl: "https://preview--orbitlabs.vercel.app/help-center",
    widgetName: "Help Center Agent",
    startedAt: "2026-04-04T12:20:00.000Z",
    lastMessageAt: "2026-04-04T12:33:00.000Z",
    unread: false,
    sentiment: "warm",
    messages: [
      {
        id: "m_13",
        role: "visitor",
        text: "Can I point the bot at our docs before we write custom prompts?",
        sentAt: "2026-04-04T12:20:00.000Z",
      },
      {
        id: "m_14",
        role: "agent",
        text: "Yes. Start with your help center URLs, then layer prompt rules once the base answers look right.",
        sentAt: "2026-04-04T12:26:00.000Z",
      },
      {
        id: "m_15",
        role: "visitor",
        text: "Great, that gives me enough to get started.",
        sentAt: "2026-04-04T12:33:00.000Z",
      },
    ],
  },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
] as const;

const channelOptions = [
  { label: "All Channels", value: "all" },
  { label: "Text", value: "text" },
  { label: "Voice", value: "voice" },
] as const;

export default function ConversationsPage() {
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id ?? "");

  const filteredConversations = conversations.filter((conversation) => {
    const matchesQuery =
      query.trim().length === 0 ||
      [conversation.visitorName, conversation.pageUrl, conversation.summary, conversation.widgetName]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesChannel =
      channelFilter === "all" || conversation.channel === channelFilter;
    const matchesStatus =
      statusFilter === "all" || conversation.status === statusFilter;

    return matchesQuery && matchesChannel && matchesStatus;
  });

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedId) ??
    filteredConversations[0] ??
    null;

  const activeCount = conversations.filter((conversation) => conversation.status === "active").length;
  const unresolvedCount = conversations.filter((conversation) =>
    conversation.status === "active" || conversation.status === "ongoing" || conversation.status === "escalated"
  ).length;
  const unreadCount = conversations.filter((conversation) => conversation.unread).length;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(0,177,113,0.08),_transparent_28%),linear-gradient(180deg,_#F7FAF8_0%,_#F3F5F6_100%)] p-4 md:p-6 lg:p-8 dark:bg-none">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(25,28,29,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-8 p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge className="w-fit border-none bg-[#EBFBF3] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#008353]">
                  Text Conversations
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black tracking-tight text-[#191C1D] md:text-3xl dark:text-white">
                    Conversations
                  </h1>
                  <p className="max-w-xl text-sm font-medium leading-6 text-[#6D7A70] dark:text-zinc-400">
                    Review visitor chat history, filter by status, and open full transcripts in one place.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Active now"
                  value={activeCount}
                  detail="Live visitors in text flow"
                  tone="green"
                />
                <MetricCard
                  label="Need review"
                  value={unresolvedCount}
                  detail="Open, ongoing, or escalated"
                  tone="slate"
                />
                <MetricCard
                  label="Unread"
                  value={unreadCount}
                  detail="Fresh replies since last check"
                  tone="amber"
                />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8B978F]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by visitor, widget, or page URL..."
                  className="h-12 rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] pl-11 text-sm shadow-none placeholder:text-[#96A39A] focus-visible:ring-[#00B171]/20"
                />
              </div>

              <Select
                value={channelFilter}
                onValueChange={(value) => setChannelFilter(value ?? "all")}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] px-4 text-sm font-semibold text-[#31423B] shadow-none">
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
                onValueChange={(value) => setStatusFilter(value ?? "all")}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] px-4 text-sm font-semibold text-[#31423B] shadow-none">
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(25,28,29,0.06)] dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-[#ECF0ED] px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                  Conversation Log
                </h2>
                <p className="mt-1 text-sm text-[#8B978F]">
                  {filteredConversations.length} visible threads across your widgets
                </p>
              </div>
              <Button
                variant="ghost"
                className="rounded-xl border border-[#E5EBE7] bg-[#F8FAF9] px-3 text-[#31423B] hover:bg-[#EFF5F1]"
              >
                <Filter className="size-4" />
                Refine
              </Button>
            </div>

            {filteredConversations.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-3xl bg-[#EBFBF3] text-[#00B171]">
                  <MessageSquare className="size-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#191C1D] dark:text-white">
                    No conversations match those filters
                  </h3>
                  <p className="max-w-md text-sm leading-6 text-[#7E8B83]">
                    Try clearing search terms or switching the status and channel filters back to all.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4 md:p-5">
                {filteredConversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversation?.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={cn(
                        "group rounded-[28px] border p-4 text-left transition-all duration-200 md:p-5",
                        isSelected
                          ? "border-[#B9E9D1] bg-[#F7FFFB] shadow-[0_18px_50px_rgba(0,177,113,0.12)]"
                          : "border-[#ECF0ED] bg-white hover:border-[#D8E6DE] hover:bg-[#FBFCFB]"
                      )}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2F5F3] text-[#66746C]">
                            {conversation.channel === "voice" ? (
                              <PhoneCall className="size-5" />
                            ) : (
                              <MessageSquare className="size-5" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-[#191C1D] dark:text-white">
                                {conversation.visitorName}
                              </h3>
                              <StatusBadge status={conversation.status} />
                              {conversation.unread ? (
                                <Badge className="border-none bg-[#191C1D] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                                  New reply
                                </Badge>
                              ) : null}
                            </div>

                            <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-[#6D7A70]">
                              {conversation.summary}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[#7A877F]">
                              <span>{formatRelative(conversation.lastMessageAt)}</span>
                              <span className="text-[#B5BEB8]">•</span>
                              <span className="capitalize">{conversation.channel}</span>
                              <span className="text-[#B5BEB8]">•</span>
                              <span>{conversation.messages.length} messages</span>
                              <span className="text-[#B5BEB8]">•</span>
                              <span>{conversation.widgetName}</span>
                            </div>

                            <div className="flex items-center gap-2 overflow-hidden text-xs font-semibold text-[#809086]">
                              <Globe className="size-3.5 shrink-0" />
                              <span className="truncate">{conversation.pageUrl}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-full bg-[#F4F7F5] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#6D7A70]">
                          <SentimentDot sentiment={conversation.sentiment} />
                          {conversation.sentiment}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(25,28,29,0.06)] dark:border-zinc-800 dark:bg-zinc-950">
            {selectedConversation ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-[#ECF0ED] p-5 dark:border-zinc-800">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-[#191C1D] dark:text-white">
                          {selectedConversation.visitorName}
                        </h2>
                        <StatusBadge status={selectedConversation.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#7A877F]">
                        <span>{selectedConversation.widgetName}</span>
                        <span className="text-[#B5BEB8]">•</span>
                        <span>Started {formatRelative(selectedConversation.startedAt)}</span>
                        <span className="text-[#B5BEB8]">•</span>
                        <span>{selectedConversation.messages.length} total messages</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="rounded-2xl border-[#DCE4DF] bg-[#FCFDFC] text-[#31423B] hover:bg-[#F2F7F4]"
                    >
                      Open Visitor
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-[#ECF0ED] bg-[#FBFCFB] p-5 text-sm text-[#536059] dark:border-zinc-800 dark:bg-zinc-900/40 md:grid-cols-2">
                  <DetailRow label="Channel" value={selectedConversation.channel} icon={selectedConversation.channel === "voice" ? PhoneCall : MessageSquare} />
                  <DetailRow label="Visitor Email" value={selectedConversation.visitorEmail ?? "Anonymous visitor"} icon={User} />
                  <DetailRow label="Current Page" value={selectedConversation.pageUrl} icon={Globe} />
                  <DetailRow label="Widget" value={selectedConversation.widgetName} icon={Sparkles} />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                      Transcript Preview
                    </h3>
                    <span className="text-xs font-semibold text-[#8B978F]">
                      Latest activity {formatRelative(selectedConversation.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 rounded-[28px] bg-[#F5F8F6] p-4 dark:bg-zinc-900">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[88%] rounded-[24px] px-4 py-3 shadow-sm",
                          message.role === "agent"
                            ? "self-start bg-white text-[#203129]"
                            : "self-end bg-[#00B171] text-white"
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                          {message.role === "agent" ? (
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
                        <p className="text-sm leading-6">{message.text}</p>
                        <p
                          className={cn(
                            "mt-2 text-[11px] font-semibold",
                            message.role === "agent" ? "text-[#7B8B82]" : "text-white/75"
                          )}
                        >
                          {formatRelative(message.sentAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#191C1D] dark:text-white">
                    Pick a conversation to inspect
                  </h3>
                  <p className="text-sm leading-6 text-[#7E8B83]">
                    The transcript and visitor metadata will appear here.
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

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "green" | "slate" | "amber";
}) {
  const toneClasses = {
    green: "bg-[#F4FFF8] text-[#008353]",
    slate: "bg-[#F4F6F5] text-[#44524B]",
    amber: "bg-[#FFF8ED] text-[#C77612]",
  };

  return (
    <div className="rounded-[24px] border border-[#E8EEEA] bg-[#FCFDFC] p-4">
      <div className={cn("mb-3 flex size-10 items-center justify-center rounded-2xl", toneClasses[tone])}>
        <MessageSquare className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A877F]">{label}</p>
        <p className="text-3xl font-black tracking-tight text-[#191C1D] dark:text-white">{value}</p>
        <p className="text-xs font-medium text-[#8B978F]">{detail}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  const styles: Record<ConversationStatus, string> = {
    active: "bg-[#EBFBF3] text-[#008353]",
    ongoing: "bg-[#EFF5FF] text-[#245BBA]",
    resolved: "bg-[#F2F4F5] text-[#5B6760]",
    escalated: "bg-[#FFF0EC] text-[#CC5A2A]",
  };

  return (
    <Badge className={cn("border-none px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]", styles[status])}>
      {status}
    </Badge>
  );
}

function SentimentDot({ sentiment }: { sentiment: ConversationRecord["sentiment"] }) {
  const styles = {
    warm: "bg-[#00B171]",
    neutral: "bg-[#9BA8A1]",
    urgent: "bg-[#E8733A]",
  };

  return <span className={cn("size-2 rounded-full", styles[sentiment])} />;
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
    <div className="flex items-start gap-3 rounded-2xl border border-[#E7ECE8] bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#F4F7F5] text-[#66746C]">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#90A096]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#31423B] dark:text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function formatRelative(value: string) {
  return `${formatDistanceToNow(new Date(value), { addSuffix: true })}`;
}
