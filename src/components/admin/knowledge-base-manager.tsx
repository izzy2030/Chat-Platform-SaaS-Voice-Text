"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDebouncedAutosave } from "@/hooks/use-debounced-autosave";
import { buildKnowledgeBaseStats, coerceWebsiteUrl, getEffectiveValue } from "@/lib/knowledge-base";
import { chunkKnowledgeText } from "@/lib/knowledge-base-ingest";
import { uploadFiles } from "@/lib/uploadthing";

type DraftFormState = {
  projectId: string;
  name: string;
  websiteUrl: string;
};

function sanitizeFactFields(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value && value.trim().length > 0),
  );
}

export function KnowledgeBaseManager() {
  const { user, isLoaded } = useUser();
  const projects = useQuery(
    api.projects.getByUserId,
    isLoaded && user ? { userId: user.id } : "skip",
  );
  const knowledgeBases = useQuery(
    api.knowledgeBases.listByUser,
    isLoaded && user ? { userId: user.id } : "skip",
  );

  const createWebsiteDraft = useMutation(api.knowledgeBases.createWebsiteDraft);
  const createTextSource = useMutation(api.knowledgeBases.createTextSource);
  const registerFileSource = useMutation(api.knowledgeBases.registerFileSource);
  const removeKnowledgeBase = useMutation(api.knowledgeBases.removeKnowledgeBase);
  const recrawlWebsite = useAction(api.knowledgeBaseActions.recrawlWebsite);
  const processUploadedFile = useAction(api.knowledgeBaseActions.processUploadedFile);
  const updateKnowledgeBase = useMutation(api.knowledgeBases.updateKnowledgeBase);
  const updateManualFacts = useMutation(api.knowledgeBases.updateManualFacts);
  const setPageIncluded = useMutation(api.knowledgeBases.setPageIncluded);

  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRecrawling, setIsRecrawling] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftForm, setDraftForm] = useState<DraftFormState>({
    projectId: "",
    name: "",
    websiteUrl: "",
  });
  const [textSourceForm, setTextSourceForm] = useState({
    label: "",
    content: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    locationName: "",
    vertical: "",
    businessName: "",
    phone: "",
    email: "",
    address: "",
    hours: "",
    summary: "",
  });

  useEffect(() => {
    if (!selectedKnowledgeBaseId && knowledgeBases && knowledgeBases.length > 0) {
      setSelectedKnowledgeBaseId(knowledgeBases[0]._id);
    }
  }, [knowledgeBases, selectedKnowledgeBaseId]);

  useEffect(() => {
    if (!draftForm.projectId && projects && projects.length > 0) {
      setDraftForm((current) => ({
        ...current,
        projectId: String(projects[0]._id),
      }));
    }
  }, [draftForm.projectId, projects]);

  const selectedKnowledgeBase = useQuery(
    api.knowledgeBases.getById,
    isLoaded && user && selectedKnowledgeBaseId
      ? { id: selectedKnowledgeBaseId as never, userId: user.id }
      : "skip",
  );

  useEffect(() => {
    if (!selectedKnowledgeBase) {
      return;
    }

    setEditForm({
      name: selectedKnowledgeBase.name ?? "",
      locationName: selectedKnowledgeBase.locationName ?? "",
      vertical: selectedKnowledgeBase.vertical ?? "",
      businessName: selectedKnowledgeBase.manualFacts?.businessName ?? selectedKnowledgeBase.extractedFacts?.businessName ?? "",
      phone: selectedKnowledgeBase.manualFacts?.phone ?? selectedKnowledgeBase.extractedFacts?.phone ?? "",
      email: selectedKnowledgeBase.manualFacts?.email ?? selectedKnowledgeBase.extractedFacts?.email ?? "",
      address: selectedKnowledgeBase.manualFacts?.address ?? selectedKnowledgeBase.extractedFacts?.address ?? "",
      hours: selectedKnowledgeBase.manualFacts?.hours ?? selectedKnowledgeBase.extractedFacts?.hours ?? "",
      summary: selectedKnowledgeBase.manualFacts?.summary ?? selectedKnowledgeBase.extractedFacts?.summary ?? "",
    });
  }, [selectedKnowledgeBase]);

  useDebouncedAutosave({
    value: editForm,
    enabled: !!selectedKnowledgeBase && !!user,
    isDirty: true,
    delayMs: 2000,
    resetKey: selectedKnowledgeBaseId ?? undefined,
    onSave: async (values) => {
      if (!user || !selectedKnowledgeBase) return;
      await Promise.all([
        updateKnowledgeBase({
          id: selectedKnowledgeBase._id,
          userId: user.id,
          name: values.name,
          locationName: values.locationName || undefined,
          vertical: values.vertical || undefined,
        }),
        updateManualFacts({
          id: selectedKnowledgeBase._id,
          userId: user.id,
          manualFacts: sanitizeFactFields({
            businessName: values.businessName || undefined,
            phone: values.phone || undefined,
            email: values.email || undefined,
            address: values.address || undefined,
            hours: values.hours || undefined,
            summary: values.summary || undefined,
          }) as {
            businessName?: string;
            phone?: string;
            email?: string;
            address?: string;
            hours?: string;
            summary?: string;
          },
        }),
      ]);
    },
    onSaved: () => {
      toast({
        title: "Auto-saved",
        description: "Your changes have been saved automatically.",
      });
    },
  });

  const pageStats = useMemo(() => {
    if (!selectedKnowledgeBase?.pages) {
      return { pagesIndexed: 0, urlsDiscovered: 0, includedPages: 0 };
    }

    return buildKnowledgeBaseStats(selectedKnowledgeBase.pages);
  }, [selectedKnowledgeBase?.pages]);

  const handleDelete = async () => {
    if (!user || !selectedKnowledgeBase) return;
    setIsDeleting(true);
    try {
      await removeKnowledgeBase({
        id: selectedKnowledgeBase._id,
        userId: user.id,
      });
      setSelectedKnowledgeBaseId(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Knowledge base deleted",
        description: "The knowledge base and all its sources have been removed.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete the knowledge base.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!user) {
      return;
    }

    if (!draftForm.projectId || !draftForm.name.trim() || !draftForm.websiteUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Project, name, and website URL are required.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const created = await createWebsiteDraft({
        userId: user.id,
        projectId: draftForm.projectId as never,
        name: draftForm.name.trim(),
        websiteUrl: coerceWebsiteUrl(draftForm.websiteUrl),
      });

      setSelectedKnowledgeBaseId(created.knowledgeBaseId);
      setIsCreateDialogOpen(false);
      setDraftForm((current) => ({
        ...current,
        name: "",
        websiteUrl: "",
      }));

      await recrawlWebsite({
        knowledgeBaseId: created.knowledgeBaseId,
        userId: user.id,
      });

      toast({
        title: "Knowledge base drafted",
        description: "The website was crawled and the draft KB is ready to review.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not create the knowledge base.";
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRecrawl = async () => {
    if (!user || !selectedKnowledgeBase) {
      return;
    }

    setIsRecrawling(true);
    try {
      await recrawlWebsite({
        knowledgeBaseId: selectedKnowledgeBase._id,
        userId: user.id,
      });

      toast({
        title: "Website re-crawled",
        description: "Fresh pages were indexed without overwriting your manual overrides.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not re-crawl the website.";
      toast({
        variant: "destructive",
        title: "Re-crawl failed",
        description: message,
      });
    } finally {
      setIsRecrawling(false);
    }
  };

  const handleAddTextSource = async () => {
    if (!user || !selectedKnowledgeBase) {
      return;
    }

    if (!textSourceForm.label.trim() || !textSourceForm.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing text source",
        description: "Please provide a label and the text content to ingest.",
      });
      return;
    }

    setIsAddingText(true);
    try {
      await createTextSource({
        knowledgeBaseId: selectedKnowledgeBase._id,
        userId: user.id,
        label: textSourceForm.label.trim(),
        textContent: textSourceForm.content,
        chunks: chunkKnowledgeText(textSourceForm.content),
      });

      setTextSourceForm({ label: "", content: "" });
      setIsTextDialogOpen(false);
      toast({
        title: "Text source added",
        description: "The new manual text source has been chunked and staged for embeddings.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not add text source.";
      toast({
        variant: "destructive",
        title: "Add text failed",
        description: message,
      });
    } finally {
      setIsAddingText(false);
    }
  };

  const handleUploadFile = async () => {
    if (!user || !selectedKnowledgeBase || !selectedFile) {
      return;
    }

    const allowedExtensions = ["pdf", "docx", "txt"];
    const extension = selectedFile.name.toLowerCase().split(".").pop() ?? "";
    if (!allowedExtensions.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Unsupported file type",
        description: "V1 supports .docx, .pdf, and .txt files only.",
      });
      return;
    }

    setIsUploadingFile(true);
    try {
      const uploaded = await uploadFiles("knowledgeBaseDocument", {
        files: [selectedFile],
        input: {
          knowledgeBaseId: String(selectedKnowledgeBase._id),
          userId: user.id,
        },
      });

      const firstFile = uploaded?.[0];
      if (!firstFile?.ufsUrl || !firstFile?.key || !firstFile?.name) {
        throw new Error("Upload succeeded but file metadata was incomplete.");
      }

      const sourceId = await registerFileSource({
        knowledgeBaseId: selectedKnowledgeBase._id,
        userId: user.id,
        fileName: firstFile.name,
        mimeType: firstFile.type || selectedFile.type || "application/octet-stream",
        uploadthingFileKey: firstFile.key,
        uploadthingUrl: firstFile.ufsUrl,
      });

      await processUploadedFile({
        knowledgeBaseId: selectedKnowledgeBase._id,
        sourceId,
        userId: user.id,
      });

      setSelectedFile(null);
      setIsFileDialogOpen(false);
      toast({
        title: "Document ingested",
        description: "The file was parsed and chunked successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not upload document.";
      toast({
        variant: "destructive",
        title: "File ingest failed",
        description: message,
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.08),_transparent_22%),linear-gradient(180deg,_rgba(247,248,245,0.88)_0%,_rgba(255,255,255,1)_40%)] p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-[30px] border border-[#E4EBE1] bg-white/92 p-6 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)] lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Knowledge Base</p>
          <h1 className="text-3xl font-black tracking-tight text-[#191C1D]">Knowledge Base</h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#68746C]">
            Ground your agent with business knowledge. Crawl a website, add documents, or write manual text sources.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button size="sm" className="rounded-xl font-semibold" onClick={() => setIsCreateDialogOpen(true)}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Create
          </Button>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Create website knowledge base</DialogTitle>
              <DialogDescription>
                Start with a website URL and we&apos;ll crawl it into a draft KB you can review before using.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="projectId">Project</Label>
                <Select
                  value={draftForm.projectId}
                  onValueChange={(value) => setDraftForm((current) => ({ ...current, projectId: String(value ?? "") }))}
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {(projects ?? []).map((project: any) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kb-name">Knowledge Base Name</Label>
                <Input
                  id="kb-name"
                  placeholder="Mike's Auto Repair - Downtown"
                  value={draftForm.name}
                  onChange={(event) => setDraftForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kb-url">Website URL</Label>
                <Input
                  id="kb-url"
                  placeholder="https://mikesautorepair.com"
                  value={draftForm.websiteUrl}
                  onChange={(event) => setDraftForm((current) => ({ ...current, websiteUrl: event.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleCreateDraft} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crawl Website
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="border border-[#E4EBE1] bg-white/92 shadow-[0_20px_60px_-42px_rgba(24,28,29,0.3)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Knowledge Bases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {knowledgeBases === undefined ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : knowledgeBases.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#D7E3D4] bg-[#F7FAF5] p-4 text-center">
                <BookOpen className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium">No knowledge bases</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a website draft to get started.
                </p>
              </div>
            ) : (
              knowledgeBases.map((knowledgeBase: any) => {
                const stats = knowledgeBase.pageStats ?? buildKnowledgeBaseStats([]);
                const isActive = selectedKnowledgeBaseId === knowledgeBase._id;
                return (
                  <button
                    key={knowledgeBase._id}
                    type="button"
                    onClick={() => setSelectedKnowledgeBaseId(knowledgeBase._id)}
                    className={`w-full rounded-[22px] border p-3 text-left transition ${
                      isActive
                        ? "border-emerald-500/50 bg-[#F3FAF0]"
                        : "border-[#E4EBE1] bg-white hover:border-emerald-500/40 hover:bg-[#F7FAF5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{knowledgeBase.name}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          {knowledgeBase.status}
                        </p>
                      </div>
                      <div className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]">
                        {stats.pagesIndexed}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      {knowledgeBase.websiteUrl || "Manual source"}
                    </p>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {!selectedKnowledgeBase ? (
          <Card className="border-border/60">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Select a knowledge base</h2>
                <p className="text-sm text-muted-foreground">
                  Choose one from the sidebar.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="flex flex-col gap-3 pb-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{selectedKnowledgeBase.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedKnowledgeBase.websiteUrl || "Manual source"} ·{" "}
                    {selectedKnowledgeBase.lastCrawledAt
                      ? `Updated ${formatDistanceToNow(new Date(selectedKnowledgeBase.lastCrawledAt), { addSuffix: true })}`
                      : "Not crawled"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setIsTextDialogOpen(true)}>
                      Add Text
                    </Button>
                    <DialogContent className="sm:max-w-[560px]">
                      <DialogHeader>
                        <DialogTitle>Create text source</DialogTitle>
                        <DialogDescription>
                          Paste business details, FAQs, or policies directly into this knowledge base.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <Field label="Label">
                          <Input
                            placeholder="Downtown FAQ"
                            value={textSourceForm.label}
                            onChange={(event) => setTextSourceForm((current) => ({ ...current, label: event.target.value }))}
                          />
                        </Field>
                        <Field label="Content">
                          <Textarea
                            rows={10}
                            placeholder="Paste the knowledge text here..."
                            value={textSourceForm.content}
                            onChange={(event) => setTextSourceForm((current) => ({ ...current, content: event.target.value }))}
                          />
                        </Field>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddTextSource} disabled={isAddingText}>
                          {isAddingText ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save Text Source
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setIsFileDialogOpen(true)}>
                      Add File
                    </Button>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Upload knowledge document</DialogTitle>
                        <DialogDescription>
                          Upload a `.docx`, `.pdf`, or `.txt` file and we&apos;ll extract and chunk the text for this KB.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3">
                        <Label htmlFor="kb-file">File</Label>
                        <Input
                          id="kb-file"
                          type="file"
                          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported in v1: `.docx`, `.pdf`, `.txt`
                        </p>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleUploadFile} disabled={isUploadingFile || !selectedFile}>
                          {isUploadingFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Upload and Process
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

<Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={handleRecrawl}
                      disabled={isRecrawling}
                    >
                      {isRecrawling ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />}
                      Re-crawl
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the <strong>{selectedKnowledgeBase.name}</strong> knowledge base and all its sources, pages, and chunks. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Delete Knowledge Base
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard label="Pages indexed" value={String(pageStats.pagesIndexed)} />
                  <SummaryCard label="URLs discovered" value={String(pageStats.urlsDiscovered)} />
                  <SummaryCard label="Website" value={new URL(selectedKnowledgeBase.websiteUrl || "https://example.com").hostname} />
                </div>

                <Separator />

                <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr]">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold">Business facts</h3>
                      <p className="text-xs text-muted-foreground">
                        Manual values override crawler suggestions.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Knowledge Base Name">
                        <Input
                          value={editForm.name}
                          onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                        />
                      </Field>
                      <Field label="Location Name">
                        <Input
                          placeholder="Downtown"
                          value={editForm.locationName}
                          onChange={(event) => setEditForm((current) => ({ ...current, locationName: event.target.value }))}
                        />
                      </Field>
                      <Field label="Business Name">
                        <Input
                          value={editForm.businessName}
                          onChange={(event) => setEditForm((current) => ({ ...current, businessName: event.target.value }))}
                        />
                      </Field>
                      <Field label="Vertical">
                        <Input
                          placeholder="Automotive"
                          value={editForm.vertical}
                          onChange={(event) => setEditForm((current) => ({ ...current, vertical: event.target.value }))}
                        />
                      </Field>
                      <Field label="Phone">
                        <Input
                          value={editForm.phone}
                          onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </Field>
                      <Field label="Email">
                        <Input
                          value={editForm.email}
                          onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                        />
                      </Field>
                    </div>

                    <Field label="Address">
                      <Textarea
                        rows={2}
                        value={editForm.address}
                        onChange={(event) => setEditForm((current) => ({ ...current, address: event.target.value }))}
                      />
                    </Field>

                    <Field label="Hours">
                      <Textarea
                        rows={2}
                        value={editForm.hours}
                        onChange={(event) => setEditForm((current) => ({ ...current, hours: event.target.value }))}
                      />
                    </Field>

                    <Field label="Summary">
                      <Textarea
                        rows={3}
                        value={editForm.summary}
                        onChange={(event) => setEditForm((current) => ({ ...current, summary: event.target.value }))}
                      />
                    </Field>
                  </div>

                  <div className="space-y-3">
                    <Card className="border-border/60 bg-muted/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Effective values</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <InfoRow
                          label="Business name"
                          value={getEffectiveValue({
                            manual: selectedKnowledgeBase.manualFacts?.businessName,
                            extracted: selectedKnowledgeBase.extractedFacts?.businessName,
                          }) || "Not set"}
                        />
                        <InfoRow
                          label="Summary"
                          value={getEffectiveValue({
                            manual: selectedKnowledgeBase.manualFacts?.summary,
                            extracted: selectedKnowledgeBase.extractedFacts?.summary,
                          }) || "Not set"}
                        />
                        <InfoRow
                          label="Phone"
                          value={getEffectiveValue({
                            manual: selectedKnowledgeBase.manualFacts?.phone,
                            extracted: selectedKnowledgeBase.extractedFacts?.phone,
                          }) || "Not set"}
                        />
                        <InfoRow label="Status" value={selectedKnowledgeBase.status} />
                        <InfoRow label="Crawler note" value={selectedKnowledgeBase.crawlStatusMessage || "No note"} />
                      </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-muted/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Sources</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedKnowledgeBase.sources.map((source: any) => (
                          <div key={source._id} className="rounded-lg border border-border/60 bg-background p-2.5">
                            <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{source.label}</p>
                              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                {source.type} · {source.status}
                              </p>
                            </div>
                              <div className="text-xs text-muted-foreground">{source.pageCount}</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Crawled pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedKnowledgeBase.pages.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
                    No pages indexed yet.
                  </div>
                ) : (
                  selectedKnowledgeBase.pages.map((page: any) => (
                    <div key={page._id} className="rounded-lg border border-border/60 p-3">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm font-medium">{page.title || page.url}</p>
                          </div>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {page.summary || page.contentSnippet || "No summary"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{page.url}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs">
                            <Switch
                              checked={page.included}
                              onCheckedChange={(checked) => {
                                void setPageIncluded({
                                  pageId: page._id,
                                  userId: user.id,
                                  included: checked,
                                });
                              }}
                            />
                            Include
                          </div>

                          <a href={page.url} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="h-7 px-2">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Sitemap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {selectedKnowledgeBase.pages.map((page: any) => (
                  <a
                    key={`site-${page._id}`}
                    href={page.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-sm transition hover:bg-muted/30"
                  >
                    <div className={`h-2 w-2 rounded-full ${page.included ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <span className="truncate text-xs">{page.url}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border/50 bg-background px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
