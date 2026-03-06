import { getProjects } from "@/lib/actions/projects";
import { ProjectsClient } from "@/components/features/projects/projects-client";

export default async function ProjectsPage() {
  const result = await getProjects();
  const projects = result.success ? result.data : [];

  return <ProjectsClient initialProjects={projects} />;
}
