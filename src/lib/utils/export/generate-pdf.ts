import { jsPDF } from "jspdf";
import type { PdfExportConfig } from "@/lib/types/export";
import { PAGE_DIMENSIONS } from "@/lib/types/export";

export function computePdfLayout(
  config: PdfExportConfig,
  cardAspectRatio: number,
  nativeCardWidth?: number
) {
  const pageDim = PAGE_DIMENSIONS[config.pageSize];
  const printableWidth = pageDim.width - config.pageMargin * 2;
  const printableHeight = pageDim.height - config.pageMargin * 2;

  // One-per-page mode: single card centered on page
  if (config.layoutMode === "one-per-page") {
    const cardW = nativeCardWidth ?? printableWidth;
    const cardH = cardW * cardAspectRatio;
    return {
      pageDim,
      cardW,
      cardH,
      cardsPerRow: 1,
      cardsPerCol: 1,
      cardsPerPage: 1,
      printableWidth,
      printableHeight,
    };
  }

  let cardW: number;
  let effectiveCardsPerRow: number;

  if (config.maintainCardSize && nativeCardWidth) {
    cardW = nativeCardWidth;
    effectiveCardsPerRow = Math.max(
      1,
      Math.floor((printableWidth + config.cardGap) / (cardW + config.cardGap))
    );
  } else {
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

function drawCropMarks(
  pdf: jsPDF,
  x: number,
  y: number,
  cardW: number,
  cardH: number,
  bleedMargin: number
): void {
  const markLen = 20;
  const trimX = x + bleedMargin;
  const trimY = y + bleedMargin;
  const trimW = cardW - 2 * bleedMargin;
  const trimH = cardH - 2 * bleedMargin;

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);

  // Top-left corner
  pdf.line(trimX - markLen, trimY, trimX, trimY);
  pdf.line(trimX, trimY - markLen, trimX, trimY);

  // Top-right corner
  pdf.line(trimX + trimW, trimY, trimX + trimW + markLen, trimY);
  pdf.line(trimX + trimW, trimY - markLen, trimX + trimW, trimY);

  // Bottom-left corner
  pdf.line(trimX - markLen, trimY + trimH, trimX, trimY + trimH);
  pdf.line(trimX, trimY + trimH, trimX, trimY + trimH + markLen);

  // Bottom-right corner
  pdf.line(trimX + trimW, trimY + trimH, trimX + trimW + markLen, trimY + trimH);
  pdf.line(trimX + trimW, trimY + trimH, trimX + trimW, trimY + trimH + markLen);
}

function renderPdfPage(
  pdf: jsPDF,
  images: { dataUrl: string; width: number; height: number }[],
  config: PdfExportConfig,
  layout: ReturnType<typeof computePdfLayout>
): void {
  const { pageDim, cardW, cardH, cardsPerRow } = layout;

  for (let i = 0; i < images.length; i++) {
    let x: number;
    let y: number;

    if (config.layoutMode === "one-per-page") {
      x = (pageDim.width - cardW) / 2;
      y = (pageDim.height - cardH) / 2;
    } else {
      const col = i % cardsPerRow;
      const row = Math.floor(i / cardsPerRow);
      x = config.pageMargin + col * (cardW + config.cardGap);
      y = config.pageMargin + row * (cardH + config.cardGap);
    }

    pdf.addImage(images[i].dataUrl, "PNG", x, y, cardW, cardH);

    if (config.cropMarks && config.bleedMargin > 0) {
      const scale = cardW / images[i].width;
      drawCropMarks(pdf, x, y, cardW, cardH, config.bleedMargin * scale);
    }
  }
}

export function generatePdf(
  cardImages: { dataUrl: string; width: number; height: number }[],
  config: PdfExportConfig,
  projectName: string,
  backImages?: { dataUrl: string; width: number; height: number }[]
): void {
  const firstCard = cardImages[0];
  const aspectRatio = firstCard.height / firstCard.width;
  const layout = computePdfLayout(config, aspectRatio, firstCard.width);
  const { pageDim, cardsPerPage } = layout;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [pageDim.width, pageDim.height],
    hotfixes: ["px_scaling"],
  });

  const totalPages = Math.ceil(cardImages.length / cardsPerPage);
  let isFirstPage = true;

  for (let p = 0; p < totalPages; p++) {
    const start = p * cardsPerPage;
    const pageCards = cardImages.slice(start, start + cardsPerPage);

    if (!isFirstPage) {
      pdf.addPage([pageDim.width, pageDim.height]);
    }
    isFirstPage = false;
    renderPdfPage(pdf, pageCards, config, layout);

    if (backImages && backImages.length > 0) {
      pdf.addPage([pageDim.width, pageDim.height]);
      const pageBackCards = backImages.slice(start, start + cardsPerPage);
      renderPdfPage(pdf, pageBackCards, config, layout);
    }
  }

  pdf.save(`${projectName}-cards.pdf`);
}
