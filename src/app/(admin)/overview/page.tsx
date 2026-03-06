import { getSystemOverview } from "@/lib/actions/admin";
import { OverviewSection } from "@/components/features/admin/overview-section";

export default async function AdminOverviewPage() {
  const result = await getSystemOverview();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground">
          Failed to load system overview
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <OverviewSection data={result.data} />
    </div>
  );
}
