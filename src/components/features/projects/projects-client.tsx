"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  Add01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectCard, STATUSES } from "./project-card";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/actions/projects";
import type { Project, StatusEnum } from "@/lib/types";

const STATUS_LABELS: Record<StatusEnum, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

type ProjectsClientProps = {
  initialProjects: Project[];
};

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [statusFilters, setStatusFilters] = useState<Set<StatusEnum>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered = projects.filter((p) => {
    if (statusFilters.size > 0 && !statusFilters.has(p.status as StatusEnum)) return false;
    return true;
  });

  const toggleStatus = useCallback((status: StatusEnum) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const handleCreate = useCallback(
    async (name: string, description?: string) => {
      const result = await createProject({
        name: name.trim(),
        description: description?.trim() || undefined,
      });
      if (!result.success) return;
      setProjects((prev) => [result.data, ...prev]);
      setCreateOpen(false);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteProject(id);
    if (!result.success) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleRename = useCallback(async (id: string, name: string) => {
    const result = await updateProject(id, { name });
    if (!result.success) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? result.data : p))
    );
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: StatusEnum) => {
    const result = await updateProject(id, { status });
    if (!result.success) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? result.data : p))
    );
  }, []);

  const handleClick = useCallback(
    (id: string) => {
      router.push(`/cards?project=${id}`);
    },
    [router]
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-border">
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Projects</h1>

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <HugeiconsIcon icon={FilterIcon} size={14} />
                  Status
                  {statusFilters.size > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                      {statusFilters.size}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUSES.map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={statusFilters.has(s)}
                    onCheckedChange={() => toggleStatus(s)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {STATUS_LABELS[s]}
                  </DropdownMenuCheckboxItem>
                ))}
                {statusFilters.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => setStatusFilters(new Set())}
                    >
                      Clear filters
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex-1" />
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} size={14} />
            New
          </Button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <HugeiconsIcon icon={Folder01Icon} size={40} className="opacity-50" />
            <p className="text-sm">
              {statusFilters.size > 0
                ? "No matching projects"
                : "Create your first project to get started"}
            </p>
          </div>
        ) : (
          <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 overflow-y-auto pb-2">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleClick(project.id)}
                onDelete={() => handleDelete(project.id)}
                onRename={(name) => handleRename(project.id, name)}
                onStatusChange={(status) => handleStatusChange(project.id, status)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
    </div>
  );
}

function CreateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onCreate(name, description);
    setName("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="My Card Game"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description (optional)</Label>
            <Textarea
              id="project-desc"
              placeholder="A brief description of your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
