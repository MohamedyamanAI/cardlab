/**
 * Extract readable text from Adobe Illustrator's native private data.
 *
 * Illustrator files with PDF compatibility embed the native AI format
 * inside PDF streams. Text is stored as PostScript `(text) Tx` operators
 * with proper encoding, unlike the PDF layer which uses custom glyph indices.
 */

export async function extractAiNativeText(
  buffer: ArrayBuffer
): Promise<{ pageTexts: Map<number, string[]>; rawDebug: string } | null> {
  const bytes = new Uint8Array(buffer);
  const rawText = new TextDecoder("latin1").decode(bytes);

  // Try 1: Search for uncompressed Tx operators directly
  let searchText = rawText;
  let foundInRaw = true;

  if (!hasTxOperators(rawText)) {
    // Try 2: Find and decompress PDF streams, then search
    foundInRaw = false;
    searchText = await decompressPdfStreams(bytes, rawText);
  }

  if (!hasTxOperators(searchText)) {
    return null;
  }

  // Parse text blocks grouped by page/artboard
  const pageTexts = parseTxByPage(searchText);

  const debugSample = foundInRaw
    ? "found in raw file"
    : "found after decompressing streams";
  const pages = Array.from(pageTexts.entries())
    .map(([p, texts]) => `  page ${p}: ${JSON.stringify(texts)}`)
    .join("\n");

  return {
    pageTexts,
    rawDebug: `${debugSample}\n${pages}`,
  };
}

function hasTxOperators(text: string): boolean {
  return /\([^)]+\)\s*Tx/.test(text);
}

/**
 * Unescape PostScript string literals.
 * Handles: \\ \( \) \n \r \t \NNN (octal)
 */
function unescapePostScript(s: string): string {
  return s.replace(/\\(?:([nrt\\()])|(\d{1,3}))/g, (_, ch, octal) => {
    if (ch === "n") return "\n";
    if (ch === "r") return "\r";
    if (ch === "t") return "\t";
    if (ch === "\\") return "\\";
    if (ch === "(") return "(";
    if (ch === ")") return ")";
    if (octal) return String.fromCharCode(parseInt(octal, 8));
    return _;
  });
}

/**
 * Parse Tx operators from the text, grouping by page.
 * In AI format, pages are delimited by %%Page: comments or
 * artboard markers. Text blocks are between To/TO operators,
 * with (text) Tx containing the actual strings.
 */
function parseTxByPage(text: string): Map<number, string[]> {
  const pageTexts = new Map<number, string[]>();
  let currentPage = 1;

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    // Detect page boundaries
    const pageMatch = line.match(/%%Page:\s*(\d+)\s+(\d+)/);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }

    // Also detect artboard markers (newer AI format)
    const artboardMatch = line.match(/%%AI\d+_BeginArtboard\((\d+)\)/);
    if (artboardMatch) {
      currentPage = parseInt(artboardMatch[1], 10);
      continue;
    }

    // Extract Tx text — handles multi-Tx per line
    const txRegex = /\(([^)]*(?:\\.[^)]*)*)\)\s*Tx/g;
    let m;
    while ((m = txRegex.exec(line)) !== null) {
      const decoded = unescapePostScript(m[1]);
      if (decoded.length > 0 && /[\x20-\x7E]/.test(decoded)) {
        if (!pageTexts.has(currentPage)) {
          pageTexts.set(currentPage, []);
        }
        pageTexts.get(currentPage)!.push(decoded);
      }
    }
  }

  return pageTexts;
}

/**
 * Find PDF streams in the raw file, decompress FlateDecode streams,
 * and return the concatenated decompressed text.
 */
async function decompressPdfStreams(
  bytes: Uint8Array,
  rawText: string
): Promise<string> {
  const results: string[] = [];

  let searchStart = 0;
  while (true) {
    const streamIdx = rawText.indexOf("stream\n", searchStart);
    if (streamIdx === -1) break;

    const dataStart = streamIdx + "stream\n".length;
    const actualStart =
      rawText[dataStart - 1] === "\r" ? dataStart : dataStart;

    const endIdx = rawText.indexOf("endstream", actualStart);
    if (endIdx === -1) break;

    const dictStart = Math.max(0, streamIdx - 500);
    const dictText = rawText.slice(dictStart, streamIdx);
    const isFlate = dictText.includes("/FlateDecode");

    if (isFlate) {
      const streamData = bytes.slice(actualStart, endIdx);

      try {
        const inflated = await decompressFlate(streamData);
        const decoded = new TextDecoder("latin1").decode(inflated);
        results.push(decoded);
      } catch {
        // Not all streams decompress cleanly — skip failures
      }
    }

    searchStart = endIdx + "endstream".length;
  }

  // Check for %AI9_PrivateDataBegin marker in the raw text
  const privateBegin = rawText.indexOf("%AI9_PrivateDataBegin");
  if (privateBegin !== -1) {
    const privateEnd = rawText.indexOf("%AI9_PrivateDataEnd", privateBegin);
    if (privateEnd !== -1) {
      results.push(rawText.slice(privateBegin, privateEnd));
    }
  }

  return results.join("\n");
}

/**
 * Decompress a FlateDecode (zlib) stream using the browser's DecompressionStream API.
 */
async function decompressFlate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(data as ArrayBufferView<ArrayBuffer>);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
