/**
 * Snap engine: computes snapping positions and guide lines when
 * dragging or resizing elements on the canvas.
 */

export interface SnapGuide {
  axis: "x" | "y";
  position: number; // canvas px
}

export interface SnapResult {
  snappedX: number;
  snappedY: number;
  guides: SnapGuide[];
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SNAP_THRESHOLD = 5; // canvas pixels

/**
 * Given the bounds of the element being dragged and the bounds of all other
 * elements, compute the snapped position and the guide lines to display.
 *
 * Checks 5 reference points per axis:
 *   X: left edge, center, right edge
 *   Y: top edge, center, bottom edge
 *
 * Also snaps to canvas edges (0, canvasWidth, canvasHeight) and canvas center.
 */
export function computeSnap(
  dragging: Bounds,
  others: Bounds[],
  canvasWidth: number,
  canvasHeight: number
): SnapResult {
  // Reference points of the dragging element
  const dragLeft = dragging.x;
  const dragCenterX = dragging.x + dragging.width / 2;
  const dragRight = dragging.x + dragging.width;
  const dragTop = dragging.y;
  const dragCenterY = dragging.y + dragging.height / 2;
  const dragBottom = dragging.y + dragging.height;

  // Collect all reference lines from other elements + canvas
  const xLines: number[] = [0, canvasWidth / 2, canvasWidth];
  const yLines: number[] = [0, canvasHeight / 2, canvasHeight];

  for (const o of others) {
    xLines.push(o.x, o.x + o.width / 2, o.x + o.width);
    yLines.push(o.y, o.y + o.height / 2, o.y + o.height);
  }

  // Find best snap for X axis
  let bestDx = Infinity;
  let snapX = dragging.x;
  const matchedXLines: number[] = [];

  for (const line of xLines) {
    for (const ref of [dragLeft, dragCenterX, dragRight]) {
      const dist = Math.abs(ref - line);
      if (dist < SNAP_THRESHOLD) {
        const dx = line - ref;
        if (Math.abs(dx) < Math.abs(bestDx)) {
          bestDx = dx;
          snapX = dragging.x + dx;
          matchedXLines.length = 0;
          matchedXLines.push(line);
        } else if (Math.abs(dx) === Math.abs(bestDx)) {
          matchedXLines.push(line);
        }
      }
    }
  }

  // Find best snap for Y axis
  let bestDy = Infinity;
  let snapY = dragging.y;
  const matchedYLines: number[] = [];

  for (const line of yLines) {
    for (const ref of [dragTop, dragCenterY, dragBottom]) {
      const dist = Math.abs(ref - line);
      if (dist < SNAP_THRESHOLD) {
        const dy = line - ref;
        if (Math.abs(dy) < Math.abs(bestDy)) {
          bestDy = dy;
          snapY = dragging.y + dy;
          matchedYLines.length = 0;
          matchedYLines.push(line);
        } else if (Math.abs(dy) === Math.abs(bestDy)) {
          matchedYLines.push(line);
        }
      }
    }
  }

  // Build guide lines (deduplicated)
  const guides: SnapGuide[] = [];
  const seenX = new Set<number>();
  for (const pos of matchedXLines) {
    if (!seenX.has(pos) && bestDx !== Infinity) {
      seenX.add(pos);
      guides.push({ axis: "x", position: pos });
    }
  }
  const seenY = new Set<number>();
  for (const pos of matchedYLines) {
    if (!seenY.has(pos) && bestDy !== Infinity) {
      seenY.add(pos);
      guides.push({ axis: "y", position: pos });
    }
  }

  return {
    snappedX: bestDx !== Infinity ? snapX : dragging.x,
    snappedY: bestDy !== Infinity ? snapY : dragging.y,
    guides,
  };
}
