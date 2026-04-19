'use client';

import { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Loader2, Folder } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WidgetList } from '@/components/admin/widget-list';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { user, isLoaded } = useUser();
  const project = useQuery(
    api.projects.getById,
    isLoaded && user ? { id: projectId as any, userId: user.id } : 'skip'
  );

  if (!isLoaded || project === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground">The project you are looking for does not exist.</p>
        <Button variant="link" className="mt-4" nativeButton={false} render={<Link href="/admin/projects" />}>
          Go back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 flex items-center justify-center">
          <Folder size={24} className="text-primary fill-primary/10" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">{project.name}</h1>
          <p className="text-sm text-muted-foreground font-medium">A list of all agents deployed within this cluster.</p>
        </div>
      </div>

      <WidgetList projectId={projectId} />
    </div>
  );
}
