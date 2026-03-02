import { getDocuments } from "@/lib/actions/documents";
import { getProjects } from "@/lib/actions/projects";
import { DocsClient } from "@/components/features/docs/docs-client";

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const [docsResult, projectsResult, params] = await Promise.all([
    getDocuments(),
    getProjects(),
    searchParams,
  ]);

  return (
    <DocsClient
      initialDocuments={docsResult.success ? docsResult.data : []}
      projects={projectsResult.success ? projectsResult.data : []}
      initialSelectedId={params.open}
    />
  );
}
