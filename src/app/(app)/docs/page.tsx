import { getDocuments } from "@/lib/actions/documents";
import { getProjects } from "@/lib/actions/projects";
import { DocsClient } from "@/components/features/docs/docs-client";

export default async function DocsPage() {
  const [docsResult, projectsResult] = await Promise.all([
    getDocuments(),
    getProjects(),
  ]);

  return (
    <DocsClient
      initialDocuments={docsResult.success ? docsResult.data : []}
      projects={projectsResult.success ? projectsResult.data : []}
    />
  );
}
