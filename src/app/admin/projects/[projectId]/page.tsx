'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { Loader2, Folder } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WidgetList } from '@/components/admin/widget-list';

interface Project {
  id: string;
  name: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) return;
      setIsLoadingProject(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error: any) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProject();
  }, [user, projectId]);

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

      {/* We can reuse WidgetList and pass a projectId to filter */}
      <WidgetList projectId={projectId} />
    </div>
  );
}
