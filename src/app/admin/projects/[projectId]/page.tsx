'use client';

import { useMemo, use } from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Folder } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WidgetList } from '@/components/admin/widget-list';

interface Project {
  id: string;
  name: string;
}

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();

  const projectDocRef = useMemoFirebase(() => {
    if (!user || !projectId) return null;
    return doc(firestore, `users/${user.uid}/projects/${projectId}`);
  }, [firestore, user, projectId]);

  const { data: project, isLoading: isLoadingProject } = useDoc<Project>(projectDocRef);

  if (isLoadingProject) {
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
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/projects">Go back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Folder className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">A list of all widgets in this project.</p>
        </div>
      </div>
      
      {/* We can reuse WidgetList and pass a projectId to filter */}
      <WidgetList projectId={projectId} />
    </div>
  );
}
