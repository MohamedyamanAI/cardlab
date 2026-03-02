import type { SpritesheetConfig } from "@/lib/types/export";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function generateSpritesheet(
  cardImages: { dataUrl: string; width: number; height: number }[],
  config: SpritesheetConfig,
  projectName: string
): Promise<void> {
  if (cardImages.length === 0) return;

  const { cols, reserveSlots } = config;
  const maxPerSheet = reserveSlots > 0 ? cols * 7 - reserveSlots : Infinity;
  const cardW = cardImages[0].width;
  const cardH = cardImages[0].height;

  // Split into sheets if needed
  const sheets: { dataUrl: string; width: number; height: number }[][] = [];
  for (let i = 0; i < cardImages.length; i += maxPerSheet) {
    sheets.push(cardImages.slice(i, i + maxPerSheet));
  }

  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    const totalSlots = reserveSlots > 0 ? sheet.length + reserveSlots : sheet.length;
    const rows = Math.ceil(totalSlots / cols);
    const canvasW = cols * cardW;
    const canvasH = rows * cardH;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasW, canvasH);

    for (let i = 0; i < sheet.length; i++) {
      const img = await loadImage(sheet[i].dataUrl);
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.drawImage(img, col * cardW, row * cardH, cardW, cardH);
    }

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const suffix = sheets.length > 1 ? `-${s + 1}` : "";
    link.download = `${projectName}-spritesheet${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
