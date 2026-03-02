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

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPng(dataUrl: string, filename: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

export function downloadSvg(svgDataUrl: string, filename: string): void {
  const svgString = decodeURIComponent(
    svgDataUrl.replace("data:image/svg+xml;charset=utf-8,", "")
  );
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}
