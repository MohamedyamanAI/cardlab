"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCardsStore } from "@/lib/store/cards-store";
import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectSelector() {
  const { projects, selectedProjectId, selectProject } = useCardsStore();
  const [createOpen, setCreateOpen] = useState(false);

  const handleValueChange = (value: string) => {
    if (value === "__new__") {
      setCreateOpen(true);
      return;
    }
    selectProject(value);
  };

  return (
    <>
      <Select value={selectedProjectId ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Select a project..." />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
          {projects.length > 0 && <SelectSeparator />}
          <SelectItem value="__new__">+ New Project</SelectItem>
        </SelectContent>
      </Select>
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
