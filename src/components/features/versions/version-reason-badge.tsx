import { Badge } from "@/components/ui/badge";
import type { VersionReason } from "@/lib/types";

const REASON_CONFIG: Record<
  VersionReason,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  manual: { label: "Snapshot", variant: "default" },
  status_change: { label: "Status", variant: "secondary" },
  pre_import: { label: "Pre-import", variant: "outline" },
  pre_restore: { label: "Pre-restore", variant: "outline" },
  pre_ai_edit: { label: "Pre-AI edit", variant: "outline" },
  periodic_auto_save: { label: "Auto-save", variant: "secondary" },
};

export function VersionReasonBadge({ reason }: { reason: VersionReason | null }) {
  if (!reason) return null;
  const config = REASON_CONFIG[reason] ?? { label: reason, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className="text-[10px]">
      {config.label}
    </Badge>
  );
}
