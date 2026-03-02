import { useCallback } from "react";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";
import { computeSnap } from "@/lib/utils/snap-engine";
import type { SnapGuide } from "@/lib/utils/snap-engine";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Hook that encapsulates snap computation for a canvas element.
 * Reads elements/canvas dimensions from the store and delegates to computeSnap.
 */
export function useElementSnap(elementId: string) {
  const elements = useLayoutEditorStore((s) => s.elements);
  const selectedElementIds = useLayoutEditorStore((s) => s.selectedElementIds);
  const setActiveSnapGuides = useLayoutEditorStore((s) => s.setActiveSnapGuides);
  const layouts = useLayoutEditorStore((s) => s.layouts);
  const currentLayoutId = useLayoutEditorStore((s) => s.currentLayoutId);

  const layout = layouts.find((l) => l.id === currentLayoutId);
  const canvasWidth = layout?.width ?? 825;
  const canvasHeight = layout?.height ?? 1125;

  const getOtherBounds = useCallback(
    (excludeSelected: boolean): Bounds[] =>
      elements
        .filter(
          (el) =>
            el.id !== elementId &&
            !el.hidden &&
            (!excludeSelected || !selectedElementIds.has(el.id))
        )
        .map((el) => ({ x: el.x, y: el.y, width: el.width, height: el.height })),
    [elements, elementId, selectedElementIds]
  );

  /** Snap during drag — excludes selected elements from reference bounds. */
  const computeDragSnap = useCallback(
    (dragging: Bounds): { snappedX: number; snappedY: number; guides: SnapGuide[] } => {
      const otherBounds = getOtherBounds(true);
      const snap = computeSnap(dragging, otherBounds, canvasWidth, canvasHeight);
      setActiveSnapGuides(snap.guides);
      return snap;
    },
    [getOtherBounds, canvasWidth, canvasHeight, setActiveSnapGuides]
  );

  /** Snap during resize — includes all non-hidden elements except self. */
  const computeResizeSnap = useCallback(
    (dragging: Bounds): { snappedX: number; snappedY: number; guides: SnapGuide[] } => {
      const otherBounds = getOtherBounds(false);
      const snap = computeSnap(dragging, otherBounds, canvasWidth, canvasHeight);
      setActiveSnapGuides(snap.guides);
      return snap;
    },
    [getOtherBounds, canvasWidth, canvasHeight, setActiveSnapGuides]
  );

  /** Clear snap guides. */
  const clearSnap = useCallback(() => {
    setActiveSnapGuides([]);
  }, [setActiveSnapGuides]);

  return { computeDragSnap, computeResizeSnap, clearSnap };
}
