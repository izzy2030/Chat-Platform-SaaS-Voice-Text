'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { toast } from '@/hooks/use-toast';
import { Loader2, Folder, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
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

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoaded } = useUser();

  const projects = useQuery(
    api.projects.getByUserId,
    isLoaded && user ? { userId: user.id } : 'skip'
  );
  const createProject = useMutation(api.projects.create);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await createProject({ name: data.name, userId: user.id });
      toast({ title: 'Project Created!', description: `The "${data.name}" project has been created.` });
      form.reset();
      setIsDialogOpen(false);
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
          <h1 className="text-4xl font-black tracking-tight text-foreground">Projects</h1>
          <p className="text-sm font-semibold text-muted-foreground/70 mt-1">
            Organize your widgets into projects.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button size="lg" className="h-11 rounded-lg font-black shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Create Project</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground/70">
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
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-lg font-bold">Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="rounded-lg font-black">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projects === undefined ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Link key={project._id} href={`/admin/projects/${project._id}`} className="block group">
                <Card className="h-full bg-card hover:bg-muted/10 rounded-xl shadow-premium transition-all duration-300 border border-border overflow-hidden flex flex-col p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                        <Folder className="h-6 w-6 text-primary fill-primary/10 group-hover:fill-primary/20" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        View project widgets
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="col-span-full border border-dashed border-border/50 bg-muted/20 rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-xl bg-secondary/30 p-6 mb-6 border border-border shadow-sm">
                  <Folder className="h-12 w-12 text-primary fill-primary/10" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2">No projects created yet</h3>
                <p className="text-sm font-medium text-muted-foreground/70 mb-8 max-w-sm mx-auto">Get started by creating your first project.</p>
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="h-12 rounded-lg px-10 font-black shadow-md transition-all">
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
