'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/supabase';
import { toast } from '@/hooks/use-toast';
import { Loader2, Folder, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { user } = useUser();

  const fetchProjects = async () => {
    if (!user) return;
    setIsLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading projects',
        description: error.message,
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{ name: data.name, user_id: user.id }]);

      if (error) throw error;

      toast({ title: 'Project Created!', description: `The "${data.name}" project has been created.` });
      form.reset();
      setIsDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating project',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h3>
          <p className="text-md text-muted-foreground mt-1">
            Organize your widgets into projects.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-lg">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Name your new project to start grouping widgets.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Marketing Campaign" {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-lg">Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingProjects ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`} className="block group">
                <Card className="h-full overflow-hidden bg-white shadow-sm border border-indigo-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="rounded-full bg-indigo-50 p-2.5 group-hover:bg-indigo-100 transition-colors">
                      <Folder className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="rounded-full p-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">View project widgets</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="col-span-full border-0 shadow-sm bg-white rounded-lg">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-indigo-50 p-6 mb-6">
                  <Folder className="h-12 w-12 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects created yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Get started by creating your first project.</p>
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
