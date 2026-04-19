'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import Link from 'next/link';
import { Plus, MessageSquare, Mic, Globe, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WidgetsPage() {
  const { user, isLoaded } = useUser();
  const widgets = useQuery(
    api.widgets.getByUserId,
    isLoaded && user ? { userId: user.id } : 'skip'
  );

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Communication Widgets</h1>
          <p className="text-lg text-muted-foreground font-medium">Deploy and manage your autonomous communication interfaces.</p>
        </div>
        <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20" render={<Link href="/admin/widget/create" />}>
          <Plus className="mr-2 h-5 w-5" /> Deploy New Node
        </Button>
      </div>

      {!widgets ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[32px] bg-muted/10 animate-pulse border border-border" />
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/20 rounded-[40px] bg-muted/5 text-center gap-6">
          <div className="w-20 h-20 rounded-[24px] bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-2xl font-bold">No active nodes</h3>
            <p className="text-muted-foreground">You haven't deployed any communication nodes yet. Start by creating your first widget.</p>
          </div>
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-primary/20 hover:bg-primary/5" render={<Link href="/admin/widget/create" />}>
            Get Started
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget._id} className="group relative flex flex-col bg-card border border-border rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    widget.type === 'voice' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {widget.type === 'voice' ? <Mic className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                  </div>
                  <Badge variant="outline" className="rounded-full border-border/60 bg-muted/20 text-[10px] font-bold uppercase tracking-wider">
                    {widget.type}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-bold truncate">{widget.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{widget.allowedDomains[0] || 'No domain configured'}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{widget.allowedDomains.length} Domains</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-4 bg-muted/5 flex items-center gap-2">
                <Button variant="ghost" className="flex-1 rounded-xl h-10 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors" render={<Link href={`/admin/widget/${widget._id}`} />}>
                  <Settings className="w-3.5 h-3.5 mr-2" /> Configure
                </Button>
                <Button variant="ghost" className="aspect-square rounded-xl h-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors" render={<Link href={`/widget/${widget._id}`} target="_blank" />}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
