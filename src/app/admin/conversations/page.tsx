import { Badge } from "@/components/ui/badge";

export default function ConversationsPage() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Conversations</h1>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Coming Soon</Badge>
      </div>
      <p className="text-lg text-muted-foreground font-medium">Manage and monitor all your incoming messages and interaction history in one place.</p>
      
      <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-[32px] border border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-foreground/50">Feature Initializing</h3>
              <p className="text-sm text-muted-foreground/40">Our engineers are working on this module.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
