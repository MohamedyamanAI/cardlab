"use client";

import { useRef, useEffect, useCallback } from "react";
import { type RulerUnit, pxToUnit } from "@/lib/store/layout-editor-store";

interface RulersProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  cursorPos: { x: number; y: number } | null;
  rulerSize: number;
  unit: RulerUnit;
}

/** Get tick intervals in canvas pixels based on zoom and unit */
function getTickInterval(zoom: number, unit: RulerUnit): { major: number; minor: number } {
  if (unit === "px") {
    if (zoom >= 2) return { major: 50, minor: 10 };
    if (zoom >= 0.8) return { major: 100, minor: 25 };
    if (zoom >= 0.3) return { major: 200, minor: 50 };
    return { major: 500, minor: 100 };
  }
  // Physical units: pick intervals so labels don't overlap
  // We work in px internally, but need nice round numbers in the target unit
  const DPI = 300;
  if (unit === "in") {
    const pxPerInch = DPI * zoom;
    if (pxPerInch >= 150) return { major: DPI / 2, minor: DPI / 8 };     // 0.5in major, 0.125in minor
    if (pxPerInch >= 60) return { major: DPI, minor: DPI / 4 };          // 1in major, 0.25in minor
    return { major: DPI * 2, minor: DPI / 2 };                            // 2in major, 0.5in minor
  }
  if (unit === "cm") {
    const pxPerCm = (DPI / 2.54) * zoom;
    if (pxPerCm >= 60) return { major: DPI / 2.54, minor: DPI / 2.54 / 5 };       // 1cm major, 2mm minor
    if (pxPerCm >= 25) return { major: (DPI / 2.54) * 2, minor: DPI / 2.54 / 2 }; // 2cm major, 5mm minor
    return { major: (DPI / 2.54) * 5, minor: DPI / 2.54 };                          // 5cm major, 1cm minor
  }
  // mm
  const pxPerMm = (DPI / 25.4) * zoom;
  if (pxPerMm >= 6) return { major: DPI / 25.4 * 10, minor: DPI / 25.4 };           // 10mm major, 1mm minor
  if (pxPerMm >= 2.5) return { major: DPI / 25.4 * 20, minor: DPI / 25.4 * 5 };    // 20mm major, 5mm minor
  return { major: DPI / 25.4 * 50, minor: DPI / 25.4 * 10 };                         // 50mm major, 10mm minor
}

function formatLabel(pxVal: number, unit: RulerUnit): string {
  const v = pxToUnit(pxVal, unit);
  if (unit === "px") return String(Math.round(v));
  // Show nice decimals for physical units
  if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 0.001) return String(Math.round(v));
  if (Math.abs(v * 4 - Math.round(v * 4)) < 0.01) return v.toFixed(2);
  return v.toFixed(1);
}

export function Rulers({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  cursorPos,
  rulerSize,
  unit,
}: RulersProps) {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const totalW = parentRect.width;
    const totalH = parentRect.height;

    const { major, minor } = getTickInterval(zoom, unit);
    const textColor = "rgba(160,160,160,0.8)";
    const tickColor = "rgba(160,160,160,0.3)";
    const cursorColor = "rgba(239,68,68,0.7)";

    // Horizontal ruler
    const hCanvas = hRef.current;
    if (hCanvas) {
      const dpr = window.devicePixelRatio || 1;
      hCanvas.width = totalW * dpr;
      hCanvas.height = rulerSize * dpr;
      hCanvas.style.width = `${totalW}px`;
      hCanvas.style.height = `${rulerSize}px`;

      const ctx = hCanvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, totalW, rulerSize);

        const startX = Math.floor(-panX / zoom / minor) * minor - minor;
        const endX = Math.ceil((totalW - panX) / zoom / minor) * minor + minor;

        ctx.font = "9px system-ui, sans-serif";
        ctx.textBaseline = "top";

        for (let cx = startX; cx <= endX; cx += minor) {
          if (cx < -0.5 || cx > canvasWidth + 0.5) continue;
          const screenX = cx * zoom + panX;
          if (screenX < rulerSize || screenX > totalW) continue;

          const isMajor = Math.abs(cx % major) < 0.5 || Math.abs(cx % major - major) < 0.5;
          const tickH = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;

          ctx.strokeStyle = tickColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX, rulerSize - tickH);
          ctx.lineTo(screenX, rulerSize);
          ctx.stroke();

          if (isMajor) {
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.fillText(formatLabel(cx, unit), screenX, 2);
          }
        }

        if (cursorPos && cursorPos.x >= 0 && cursorPos.x <= canvasWidth) {
          const sx = cursorPos.x * zoom + panX;
          if (sx >= rulerSize && sx <= totalW) {
            ctx.strokeStyle = cursorColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, rulerSize);
            ctx.stroke();
          }
        }
      }
    }

    // Vertical ruler
    const vCanvas = vRef.current;
    if (vCanvas) {
      const dpr = window.devicePixelRatio || 1;
      vCanvas.width = rulerSize * dpr;
      vCanvas.height = totalH * dpr;
      vCanvas.style.width = `${rulerSize}px`;
      vCanvas.style.height = `${totalH}px`;

      const ctx = vCanvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rulerSize, totalH);

        const startY = Math.floor(-panY / zoom / minor) * minor - minor;
        const endY = Math.ceil((totalH - panY) / zoom / minor) * minor + minor;

        ctx.font = "9px system-ui, sans-serif";

        for (let cy = startY; cy <= endY; cy += minor) {
          if (cy < -0.5 || cy > canvasHeight + 0.5) continue;
          const screenY = cy * zoom + panY;
          if (screenY < rulerSize || screenY > totalH) continue;

          const isMajor = Math.abs(cy % major) < 0.5 || Math.abs(cy % major - major) < 0.5;
          const tickW = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;

          ctx.strokeStyle = tickColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rulerSize - tickW, screenY);
          ctx.lineTo(rulerSize, screenY);
          ctx.stroke();

          if (isMajor) {
            ctx.save();
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.translate(7, screenY);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(formatLabel(cy, unit), 0, 0);
            ctx.restore();
          }
        }

        if (cursorPos && cursorPos.y >= 0 && cursorPos.y <= canvasHeight) {
          const sy = cursorPos.y * zoom + panY;
          if (sy >= rulerSize && sy <= totalH) {
            ctx.strokeStyle = cursorColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(rulerSize, sy);
            ctx.stroke();
          }
        }
      }
    }
  }, [zoom, panX, panY, canvasWidth, canvasHeight, cursorPos, rulerSize, unit]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-10">
      {/* Corner square */}
      <div
        className="absolute left-0 top-0 bg-background border-b border-r"
        style={{ width: rulerSize, height: rulerSize }}
      />
      {/* Horizontal ruler */}
      <canvas
        ref={hRef}
        className="absolute top-0 bg-background/90 border-b backdrop-blur-sm"
        style={{ left: 0, height: rulerSize }}
      />
      {/* Vertical ruler */}
      <canvas
        ref={vRef}
        className="absolute left-0 bg-background/90 border-r backdrop-blur-sm"
        style={{ top: 0, width: rulerSize }}
      />
    </div>
  );
}
