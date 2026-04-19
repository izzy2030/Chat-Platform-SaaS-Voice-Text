'use client';

import { useUser } from '@clerk/nextjs';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowingRadialChart } from '@/components/ui/glowing-radial-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminPage() {
  const { user } = useUser();
  const firstName = user?.firstName || 'Israel';

  const stats = [
    { label: 'CONVERSATIONS', value: '11', icon: MessagesSquare, trend: '+12%', highlight: false },
    { label: 'LIVE VISITORS', value: '3', icon: Users, status: 'online', highlight: true },
    { label: 'MESSAGES SENT', value: '4', icon: Send, trend: '+2%', highlight: false },
    { label: 'AVG RESPONSE', value: '—', icon: Clock, trend: '-3%', highlight: false },
    { label: 'PAGES SHARED', value: '0', icon: FileText, trend: '0%', highlight: false },
    { label: 'SATISFACTION', value: '64%', icon: ThumbsUp, trend: '+5%', highlight: false },
  ];

  const recentConversations = [
    { id: 'f5eadeec', type: 'Text', time: 'ABOUT 2 HOURS AGO', status: 'online', path: '/dashboard/...' },
    { id: 'Voice ca', type: 'Voice', time: 'ABOUT 2 HOURS AGO', status: 'offline', path: '' },
    { id: 'f5eadeec', type: 'Text', time: 'ABOUT 2 HOURS AGO', status: 'online', path: '/dashboard/...' },
    { id: 'Voice ca', type: 'Voice', time: 'ABOUT 4 HOURS AGO', status: 'offline', path: '' },
    { id: 'Voice ca', type: 'Voice', time: 'ABOUT 4 HOURS AGO', status: 'offline', path: '' },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFB] min-h-screen">
      <div className="flex flex-col gap-4 p-6 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#6D7A70]/60">
            <span>Hydra Chat</span>
            <span className="text-[#BCCABE]">/</span>
            <span className="text-[#00B171]">DASHBOARD</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black tracking-tight text-[#191C1D]">Good afternoon, {firstName}</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#EBFBF3] text-[#006D43] hover:bg-[#EBFBF3] border-none px-2.5 py-0.5 rounded-full text-[10px] font-black gap-1.5 shadow-sm">
                  <span className="size-1.5 rounded-full bg-[#00B171] animate-pulse" />
                  Widget Live
                </Badge>
                <Badge className="bg-[#FFF8E1] text-[#A27C00] hover:bg-[#FFF8E1] border-none px-2.5 py-0.5 rounded-full text-[10px] font-black gap-1.5 shadow-sm">
                  <SparklesIcon className="size-3" />
                  AI Active
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl h-9 px-4 text-xs font-black gap-2 shadow-premium bg-white border-none hover:bg-[#F2F4F5] transition-all active:scale-95">
                <Copy className="size-3.5 text-[#6D7A70]" /> Copy Embed
              </Button>
              <Button variant="outline" className="rounded-xl h-9 px-4 text-xs font-black gap-2 shadow-premium bg-white border-none hover:bg-[#F2F4F5] transition-all active:scale-95">
                <Settings className="size-3.5 text-[#6D7A70]" /> Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className={cn(
              "rounded-2xl border-none shadow-premium transition-all duration-300 hover:-translate-y-0.5",
              stat.highlight ? "bg-[#EBFBF3] ring-1 ring-[#00B171]/10" : "bg-white"
            )}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center",
                    stat.highlight ? "bg-[#00B171]/10 text-[#00B171]" : "bg-[#F2F4F5] text-[#BCCABE]"
                  )}>
                    <stat.icon className="size-4" />
                  </div>
                  {stat.status === 'online' && <div className="absolute top-4 right-4 size-1.5 rounded-full bg-[#00B171] shadow-[0_0_8px_#00B171]" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black tracking-widest text-[#6D7A70]/60 uppercase">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#191C1D]">{stat.value}</span>
                    {stat.trend && <span className="text-[9px] font-black text-[#00B171] opacity-60 tracking-tighter">{stat.trend}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Conversations */}
          <Card className="lg:col-span-3 rounded-2xl border-none shadow-premium bg-white overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black text-[#191C1D]">Recent Conversations</CardTitle>
              <Button variant="ghost" className="text-[10px] font-black text-[#6D7A70] hover:text-[#00B171] gap-1 rounded-xl hover:bg-[#EBFBF3] px-3 h-8">
                See all <ArrowUpRight className="size-3" />
              </Button>
            </CardHeader>
            <CardContent className="pointer-events-none p-0">
              <div className="flex flex-col">
                {recentConversations.map((conv, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFB] transition-colors border-t border-[#ECEEEF]/50 first:border-0 group pointer-events-auto cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-2 rounded-full shadow-sm",
                        conv.status === 'online' ? "bg-[#00B171] shadow-[#00B171]/40" : "bg-[#BCCABE] shadow-black/5"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#6D7A70]/50 tracking-[0.03em]">{conv.time}</span>
                        <span className="text-sm font-bold tracking-tight text-[#191C1D]">{conv.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 w-28">
                        <div className="size-7 rounded-lg bg-[#F2F4F5] flex items-center justify-center text-[#BCCABE] group-hover:bg-[#EBFBF3] group-hover:text-[#00B171] transition-colors">
                          {conv.type === 'Text' ? <MessageCircle className="size-3.5" /> : <PhoneCall className="size-3.5" />}
                        </div>
                        <span className="text-xs font-black text-[#6D7A70]">{conv.type} ...</span>
                      </div>
                      <span className="hidden xl:block text-[10px] font-bold text-[#BCCABE] tracking-tighter w-20 truncate">{conv.path}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: AI Performance & Quick Actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* AI Performance Widget */}
            <Card className="rounded-2xl border-none shadow-premium bg-white p-5 flex flex-col gap-4 overflow-visible">
              <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6D7A70]/50">AI Performance</h3>
              <div className="flex items-center gap-4">
                <div className="relative size-32 flex items-center justify-center">
                  <GlowingRadialChart 
                    data={[{ name: "performance", value: 100, fill: "#00B171" }]}
                    className="size-full"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Resolved', value: '7', color: '#00B171' },
                    { label: 'Escalated', value: '0', color: '#F59E0B' },
                    { label: 'Abandoned', value: '0', color: '#94A3B8' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold text-[#6D7A70]">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-[#191C1D]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions Widget */}
            <Card className="rounded-2xl border-none shadow-premium bg-white p-5 flex flex-col gap-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6D7A70]/50">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8FAFB] hover:bg-[#EBFBF3] group transition-all duration-300 border border-[#ECEEEF]/50">
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-[#00B171] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="size-5" />
                  </div>
                  <span className="text-[11px] font-black text-[#191C1D]">Test Widget</span>
                  <span className="text-[9px] text-[#6D7A70] mt-1 text-center leading-tight">Preview your AI chat</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8FAFB] hover:bg-[#EBFBF3] group transition-all duration-300 border border-[#ECEEEF]/50">
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-[#00B171] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <PlusCircle className="size-5" />
                  </div>
                  <span className="text-[11px] font-black text-[#191C1D]">Invite Team</span>
                  <span className="text-[9px] text-[#6D7A70] mt-1 text-center leading-tight">Add team members</span>
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
      </div>

      {/* Floating Navigation */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="size-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform font-black">N</div>
      </div>
    </div>
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
