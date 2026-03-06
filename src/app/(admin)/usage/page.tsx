import { getAiUsageData } from "@/lib/actions/admin";
import { AiUsageSection } from "@/components/features/admin/ai-usage-section";

export default async function AdminUsagePage() {
  const result = await getAiUsageData();
  const data = result.success
    ? result.data
    : { messages: [], imageGenStats: { totalImages: 0, totalSizeBytes: 0, totalImageCost: 0, byDay: [], details: [] } };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">AI Usage</h1>
      <AiUsageSection messages={data.messages} imageGenStats={data.imageGenStats} />
    </div>
  );
}
