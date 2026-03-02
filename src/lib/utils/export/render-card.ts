import { toPng, toSvg } from "html-to-image";

const exportFilter = (el: Element) => {
  if (el instanceof HTMLElement && el.dataset.exportIgnore === "true") {
    return false;
  }
  return true;
};

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
    filter: exportFilter,
  });
}

export async function renderCardToSvg(
  node: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  return toSvg(node, {
    width,
    height,
    cacheBust: true,
    filter: exportFilter,
  });
}
