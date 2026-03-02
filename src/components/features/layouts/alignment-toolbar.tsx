"use client";

import { Button } from "@/components/ui/button";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignBoxLeftTop,
  IconAlignBoxCenterMiddle,
  IconAlignBoxBottomCenter,
  IconLayoutDistributeHorizontal,
  IconLayoutDistributeVertical,
} from "@tabler/icons-react";

export function AlignmentToolbar() {
  const alignElements = useLayoutEditorStore((s) => s.alignElements);
  const distributeElements = useLayoutEditorStore((s) => s.distributeElements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);

  const count = selectedElementIds.size;
  if (count < 2) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">
        Align ({count} elements)
      </h4>
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("left")}
          title="Align left"
        >
          <IconAlignLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("center-h")}
          title="Align center horizontally"
        >
          <IconAlignCenter className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("right")}
          title="Align right"
        >
          <IconAlignRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("top")}
          title="Align top"
        >
          <IconAlignBoxLeftTop className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("center-v")}
          title="Align center vertically"
        >
          <IconAlignBoxCenterMiddle className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full px-0"
          onClick={() => alignElements("bottom")}
          title="Align bottom"
        >
          <IconAlignBoxBottomCenter className="size-3.5" />
        </Button>
        {count >= 3 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full px-0"
              onClick={() => distributeElements("horizontal")}
              title="Distribute horizontally"
            >
              <IconLayoutDistributeHorizontal className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full px-0"
              onClick={() => distributeElements("vertical")}
              title="Distribute vertically"
            >
              <IconLayoutDistributeVertical className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
