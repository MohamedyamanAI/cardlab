"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Project, StatusEnum } from "@/lib/types";

const STATUS_COLORS: Record<StatusEnum, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-yellow-500/15", text: "text-yellow-700 dark:text-yellow-400", label: "Draft" },
  active: { bg: "bg-green-500/15", text: "text-green-700 dark:text-green-400", label: "Active" },
  archived: { bg: "bg-zinc-500/15", text: "text-zinc-500", label: "Archived" },
};

export const STATUSES: StatusEnum[] = ["draft", "active", "archived"];

type ProjectCardProps = {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onStatusChange: (status: StatusEnum) => void;
};

export function ProjectCard({
  project,
  onClick,
  onDelete,
  onRename,
  onStatusChange,
}: ProjectCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);

  const statusColor = STATUS_COLORS[project.status as StatusEnum] ?? STATUS_COLORS.draft;

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isRenaming) onClick();
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isRenaming) onClick();
      }}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-foreground/10 bg-card transition-colors hover:border-primary/40"
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {isRenaming ? (
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setRenameValue(project.name);
                setIsRenaming(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-7 text-sm font-medium"
          />
        ) : (
          <p className="truncate text-sm font-medium">{project.name}</p>
        )}

        {project.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center gap-1.5 border-t border-foreground/5 px-4 py-2.5">
        <span
          className={`inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium ${statusColor.bg} ${statusColor.text}`}
        >
          {statusColor.label}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {project.created_at && new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Context menu */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md bg-background/80 p-1 text-muted-foreground backdrop-blur-sm hover:text-foreground"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setRenameValue(project.name);
                setIsRenaming(true);
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(s);
                    }}
                    disabled={project.status === s}
                  >
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${STATUS_COLORS[s].bg} ring-1 ring-current/20 ${STATUS_COLORS[s].text}`}
                    />
                    {STATUS_COLORS[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
