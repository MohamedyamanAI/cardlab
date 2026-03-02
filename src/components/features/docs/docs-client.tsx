"use client";

import { useState, useCallback, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NoteIcon,
  Add01Icon,
  Tag01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { DocumentList } from "./document-list";
import { DocumentCard } from "./document-card";
import { DocumentEditor } from "./document-editor";
import {
  createDocument,
  deleteDocument,
} from "@/lib/actions/documents";
import { DOC_TYPES, DOC_TYPE_COLORS } from "./constants";
import type { Document, DocType, Project } from "@/lib/types";

type DocsClientProps = {
  initialDocuments: Document[];
  projects: Project[];
  initialSelectedId?: string;
};

export function DocsClient({ initialDocuments, projects, initialSelectedId }: DocsClientProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [typeFilters, setTypeFilters] = useState<Set<DocType>>(new Set());
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedDoc = documents.find((d) => d.id === selectedId) ?? null;

  const filtered = documents.filter((doc) => {
    if (typeFilters.size > 0 && (!doc.type || !typeFilters.has(doc.type as DocType))) return false;
    if (projectFilters.size > 0 && (!doc.project_id || !projectFilters.has(doc.project_id))) return false;
    return true;
  });

  const toggleType = useCallback((type: DocType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleProject = useCallback((id: string) => {
    setProjectFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    const result = await createDocument({ title: "Untitled" });
    if (!result.success) return;
    setDocuments((prev) => [result.data, ...prev]);
    setSelectedId(result.data.id);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteDocument(id);
      if (!result.success) return;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId]
  );

  const handleOpenDoc = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleDocUpdated = useCallback((updated: Document) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  }, []);

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-border">
      {/* Right panel — editor or grid */}
      {selectedDoc ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize="20%" minSize="15%" maxSize="50%">
            <DocumentList
              documents={documents}
              selectedId={selectedId}
              onSelect={handleOpenDoc}
              onCreate={handleCreate}
              onDelete={handleDelete}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="80%">
            <DocumentEditor
              key={selectedDoc.id}
              document={selectedDoc}
              projects={projects}
              onUpdated={handleDocUpdated}
              onBack={handleBack}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          {/* Top bar with filters */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">All Documents</h1>

            {/* Filter dropdowns — client-only to avoid Radix useId hydration mismatch */}
            {mounted && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <HugeiconsIcon icon={Tag01Icon} size={14} />
                      Type
                      {typeFilters.size > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                          {typeFilters.size}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {DOC_TYPES.map(([value, label]) => {
                      const colors = DOC_TYPE_COLORS[value];
                      return (
                        <DropdownMenuCheckboxItem
                          key={value}
                          checked={typeFilters.has(value)}
                          onCheckedChange={() => toggleType(value)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span className={`inline-flex h-2 w-2 rounded-full ${colors.bg} ring-1 ring-current/20 ${colors.text}`} />
                          {label}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                    {typeFilters.size > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={false}
                          onCheckedChange={() => setTypeFilters(new Set())}
                        >
                          Clear filters
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {projects.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <HugeiconsIcon icon={Folder01Icon} size={14} />
                        Project
                        {projectFilters.size > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                            {projectFilters.size}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Filter by project</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {projects.map((project) => (
                        <DropdownMenuCheckboxItem
                          key={project.id}
                          checked={projectFilters.has(project.id)}
                          onCheckedChange={() => toggleProject(project.id)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {project.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {projectFilters.size > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={false}
                            onCheckedChange={() => setProjectFilters(new Set())}
                          >
                            Clear filters
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            <div className="flex-1" />
            <Button size="sm" className="gap-1.5" onClick={handleCreate}>
              <HugeiconsIcon icon={Add01Icon} size={14} />
              New
            </Button>
          </div>

          {/* Card grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <HugeiconsIcon icon={NoteIcon} size={40} className="opacity-50" />
              <p className="text-sm">
                {typeFilters.size > 0 || projectFilters.size > 0
                  ? "No matching documents"
                  : "Create your first document to get started"}
              </p>
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 overflow-y-auto pb-2">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => handleOpenDoc(doc.id)}
                  onDelete={() => handleDelete(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
