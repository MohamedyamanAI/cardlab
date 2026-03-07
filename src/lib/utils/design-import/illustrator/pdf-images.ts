import { getPdfjs, type PDFDocumentProxy } from "./pdf-parser";

export interface ImagePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extract embedded raster images from a PDF page via the operator list.
 * Returns base64 PNG strings sorted by pixel area (largest first).
 * Returns an empty array if the page has no raster images (e.g. vector-only artwork).
 */
export async function extractPageImages(
  pdf: PDFDocumentProxy,
  pageNumber: number
): Promise<string[]> {
  const pdfjsLib = await getPdfjs();
  const page = await pdf.getPage(pageNumber);
  const opList = await page.getOperatorList();

  const imageNames = new Set<string>();
  for (let i = 0; i < opList.fnArray.length; i++) {
    if (
      opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
      opList.fnArray[i] === pdfjsLib.OPS.paintImageXObjectRepeat
    ) {
      imageNames.add(opList.argsArray[i][0] as string);
    }
  }

  const images: { base64: string; area: number }[] = [];

  for (const name of imageNames) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imgData = await new Promise<any>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("timeout")), 5000);
        page.objs.get(name, (d: unknown) => {
          clearTimeout(t);
          resolve(d);
        });
      });

      const canvas = document.createElement("canvas");
      let w = 0,
        h = 0;

      if (
        imgData instanceof HTMLImageElement ||
        imgData instanceof ImageBitmap
      ) {
        w = imgData.width;
        h = imgData.height;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(imgData, 0, 0);
      } else if (imgData?.data && imgData.width && imgData.height) {
        w = imgData.width;
        h = imgData.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        const id = ctx.createImageData(w, h);

        if (imgData.kind === pdfjsLib.ImageKind.RGB_24BPP) {
          const src = imgData.data as Uint8ClampedArray;
          const dst = id.data;
          for (let j = 0, k = 0; j < src.length; j += 3, k += 4) {
            dst[k] = src[j];
            dst[k + 1] = src[j + 1];
            dst[k + 2] = src[j + 2];
            dst[k + 3] = 255;
          }
        } else if (imgData.kind === pdfjsLib.ImageKind.RGBA_32BPP) {
          id.data.set(imgData.data as Uint8ClampedArray);
        } else {
          continue;
        }

        ctx.putImageData(id, 0, 0);
      } else {
        continue;
      }

      images.push({
        base64: canvas.toDataURL("image/png").split(",")[1],
        area: w * h,
      });
    } catch {
      continue;
    }
  }

  images.sort((a, b) => b.area - a.area);
  return images.map((i) => i.base64);
}

/** Multiply two 6-element PDF transformation matrices [a,b,c,d,e,f]. */
function multiplyMatrices(a: number[], b: number[]): number[] {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/**
 * Extract exact bounding boxes of raster images on a PDF page by tracking
 * the Current Transformation Matrix through the operator list.
 * Returns placements in top-down PDF point coordinates, sorted by area (largest first).
 */
export async function extractImagePlacements(
  pdf: PDFDocumentProxy,
  pageNumber: number
): Promise<ImagePlacement[]> {
  const pdfjsLib = await getPdfjs();
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const opList = await page.getOperatorList();

  let ctm = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  const placements: ImagePlacement[] = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const op = opList.fnArray[i];
    const args = opList.argsArray[i];

    if (op === pdfjsLib.OPS.save) {
      stack.push([...ctm]);
    } else if (op === pdfjsLib.OPS.restore) {
      ctm = stack.length > 0 ? stack.pop()! : [1, 0, 0, 1, 0, 0];
    } else if (op === pdfjsLib.OPS.transform) {
      ctm = multiplyMatrices(ctm, args as number[]);
    } else if (
      op === pdfjsLib.OPS.paintImageXObject ||
      op === pdfjsLib.OPS.paintImageXObjectRepeat
    ) {
      const corners = [
        [ctm[4], ctm[5]],
        [ctm[0] + ctm[4], ctm[1] + ctm[5]],
        [ctm[2] + ctm[4], ctm[3] + ctm[5]],
        [ctm[0] + ctm[2] + ctm[4], ctm[1] + ctm[3] + ctm[5]],
      ];

      const xs = corners.map((c) => c[0]);
      const ys = corners.map((c) => c[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      placements.push({
        x: minX,
        y: viewport.height - maxY,
        width: maxX - minX,
        height: maxY - minY,
      });
    }
  }

  placements.sort((a, b) => b.width * b.height - a.width * a.height);
  return placements;
}

/**
 * Crop a rectangular region from a base64 PNG image.
 * Bounds are in PDF coordinate space; `scale` converts PDF points → rendered pixels.
 * Adds padding (% of card dimensions) to avoid over-cropping.
 */
export async function cropRegion(
  base64: string,
  bounds: { x: number; y: number; width: number; height: number },
  scale: number,
  pageWidth: number,
  pageHeight: number,
  padding = 0.05
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const padX = pageWidth * padding;
      const padY = pageHeight * padding;
      const x = Math.max(0, bounds.x - padX);
      const y = Math.max(0, bounds.y - padY);
      const right = Math.min(pageWidth, bounds.x + bounds.width + padX);
      const bottom = Math.min(pageHeight, bounds.y + bounds.height + padY);
      const w = right - x;
      const h = bottom - y;

      const sx = x * scale;
      const sy = y * scale;
      const sw = w * scale;
      const sh = h * scale;

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl.split(",")[1]);
    };
    img.onerror = () =>
      reject(new Error("Failed to load image for cropping"));
    img.src = `data:image/png;base64,${base64}`;
  });
}
