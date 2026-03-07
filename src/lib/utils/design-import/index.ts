export {
  parseAiFile,
  renderPage,
  extractPageText,
  renderAllPages,
  getPdfjs,
  type PDFDocumentProxy,
} from "./illustrator/pdf-parser";

export { extractAiNativeText } from "./illustrator/native-text";

export {
  extractPageImages,
  extractImagePlacements,
  cropRegion,
  type ImagePlacement,
} from "./illustrator/pdf-images";
