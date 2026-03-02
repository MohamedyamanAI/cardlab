import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { Card, Layout } from "@/lib/types";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Json } from "@/lib/supabase/database.types";
import { resolveLayoutForCard } from "@/lib/utils/condition-engine";
import type { ResolvedCard, PdfExportConfig } from "@/lib/types/export";
import { PAGE_DIMENSIONS } from "@/lib/types/export";

export function resolveCards(
  cards: Card[],
  layouts: Layout[]
): { resolved: ResolvedCard[]; allMediaIds: string[] } {
  const mediaIds = new Set<string>();
  const resolved: ResolvedCard[] = [];

  for (const card of cards) {
    const cardData =
      typeof card.data === "object" && card.data !== null
        ? (card.data as Record<string, Json>)
        : {};

    const layout = resolveLayoutForCard(layouts, cardData);
    if (!layout) continue;

    const elements = Array.isArray(layout.canvas_elements)
      ? (layout.canvas_elements as unknown as CanvasElement[])
      : [];

    for (const el of elements) {
      if (el.type === "image") {
        const mediaId = el.bind_to
          ? (cardData[el.bind_to] as string | undefined)
          : el.static_src;
        if (typeof mediaId === "string" && mediaId.length > 0) {
          mediaIds.add(mediaId);
        }
      }
    }

    resolved.push({ card, layout, elements, cardData, mediaUrls: {} });
  }

  return { resolved, allMediaIds: [...mediaIds] };
}

export function populateMediaUrls(
  resolved: ResolvedCard[],
  urlMap: Record<string, string>
): void {
  for (const rc of resolved) {
    rc.mediaUrls = {};
    for (const el of rc.elements) {
      if (el.type === "image") {
        const mediaId = el.bind_to
          ? (rc.cardData[el.bind_to] as string | undefined)
          : el.static_src;
        if (mediaId && urlMap[mediaId]) {
          rc.mediaUrls[mediaId] = urlMap[mediaId];
        }
      }
    }
  }
}

export async function renderCardToPng(
  node: HTMLElement,
  width: number,
  height: number,
  pixelRatio: number = 2
): Promise<string> {
  return toPng(node, {
    width,
    height,
    pixelRatio,
    cacheBust: true,
    filter: (el) => {
      if (el instanceof HTMLElement && el.dataset.exportIgnore === "true") {
        return false;
      }
      return true;
    },
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function downloadPng(dataUrl: string, filename: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function computePdfLayout(
  config: PdfExportConfig,
  cardAspectRatio: number,
  nativeCardWidth?: number
) {
  const pageDim = PAGE_DIMENSIONS[config.pageSize];
  const printableWidth = pageDim.width - config.pageMargin * 2;
  const printableHeight = pageDim.height - config.pageMargin * 2;

  let cardW: number;
  let effectiveCardsPerRow: number;

  if (config.maintainCardSize && nativeCardWidth) {
    // Use the native card pixel size, auto-calculate how many fit per row
    cardW = nativeCardWidth;
    effectiveCardsPerRow = Math.max(
      1,
      Math.floor((printableWidth + config.cardGap) / (cardW + config.cardGap))
    );
  } else {
    // Scale cards to fill N per row
    effectiveCardsPerRow = config.cardsPerRow;
    cardW =
      (printableWidth - config.cardGap * (effectiveCardsPerRow - 1)) /
      effectiveCardsPerRow;
  }

  const cardH = cardW * cardAspectRatio;
  const cardsPerCol = Math.max(
    1,
    Math.floor((printableHeight + config.cardGap) / (cardH + config.cardGap))
  );
  const cardsPerPage = effectiveCardsPerRow * cardsPerCol;

  return {
    pageDim,
    cardW,
    cardH,
    cardsPerRow: effectiveCardsPerRow,
    cardsPerCol,
    cardsPerPage,
    printableWidth,
    printableHeight,
  };
}

export function generatePdf(
  cardImages: { dataUrl: string; width: number; height: number }[],
  config: PdfExportConfig,
  projectName: string
): void {
  const firstCard = cardImages[0];
  const aspectRatio = firstCard.height / firstCard.width;
  const layout = computePdfLayout(config, aspectRatio, firstCard.width);
  const { pageDim, cardW, cardH, cardsPerPage, cardsPerRow } = layout;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [pageDim.width, pageDim.height],
    hotfixes: ["px_scaling"],
  });

  let pageIndex = 0;
  for (let i = 0; i < cardImages.length; i++) {
    const posOnPage = i - pageIndex * cardsPerPage;

    if (posOnPage >= cardsPerPage && i > 0) {
      pdf.addPage([pageDim.width, pageDim.height]);
      pageIndex++;
    }

    const actualPos = i - pageIndex * cardsPerPage;
    const col = actualPos % cardsPerRow;
    const row = Math.floor(actualPos / cardsPerRow);
    const x = config.pageMargin + col * (cardW + config.cardGap);
    const y = config.pageMargin + row * (cardH + config.cardGap);

    pdf.addImage(cardImages[i].dataUrl, "PNG", x, y, cardW, cardH);
  }

  pdf.save(`${projectName}-cards.pdf`);
}
