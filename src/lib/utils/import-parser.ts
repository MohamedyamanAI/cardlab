import Papa from "papaparse";
import type { ParsedImportData, ImportColumn } from "@/lib/types/import";
import type { PropertyType } from "@/lib/types";

const MAX_ROWS = 2000;

/** Infer the PropertyType from a sample of string values */
export function inferType(values: string[]): PropertyType {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "text";

  const allNumbers = nonEmpty.every((v) => !isNaN(Number(v)));
  if (allNumbers) return "number";

  const allBooleans = nonEmpty.every((v) =>
    ["true", "false", "yes", "no", "1", "0"].includes(v.toLowerCase())
  );
  if (allBooleans) return "boolean";

  const allColors = nonEmpty.every((v) =>
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)
  );
  if (allColors) return "color";

  // If fewer than 10 unique values and more than 5 rows, suggest select
  const unique = new Set(nonEmpty);
  if (unique.size <= 10 && nonEmpty.length >= 5) return "select";

  return "text";
}

/** Extract ImportColumn metadata from headers + data rows */
export function buildColumns(headers: string[], rows: string[][]): ImportColumn[] {
  return headers.map((name, index) => {
    const columnValues = rows.map((row) => row[index] ?? "");
    const nonEmpty = columnValues.filter((v) => v.trim() !== "");
    return {
      name: name.trim() || `Column ${index + 1}`,
      index,
      inferredType: inferType(nonEmpty),
      sampleValues: nonEmpty.slice(0, 5),
    };
  });
}

export function parseCSV(text: string): ParsedImportData {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
  });
  const allRows = result.data;
  if (allRows.length === 0) throw new Error("CSV file is empty");

  const rawRows = allRows.slice(0, MAX_ROWS + 1);
  const headers = rawRows[0];
  const rows = rawRows.slice(1);
  return {
    columns: buildColumns(headers, rows),
    rows,
    rawRows,
    headerRowIndex: 0,
    sourceType: "csv",
  };
}

export function parseJSON(text: string): ParsedImportData {
  const parsed = JSON.parse(text);
  const arr: Record<string, unknown>[] = Array.isArray(parsed)
    ? parsed
    : [parsed];
  if (arr.length === 0) throw new Error("JSON contains no records");

  // Collect all keys from all objects
  const keySet = new Set<string>();
  for (const obj of arr) {
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((k) => keySet.add(k));
    }
  }
  const headers = Array.from(keySet);

  const dataRows = arr.slice(0, MAX_ROWS).map((obj) =>
    headers.map((key) => {
      const val = (obj as Record<string, unknown>)[key];
      return val === null || val === undefined ? "" : String(val);
    })
  );

  // For JSON, rawRows includes headers as row 0 + data rows
  const rawRows = [headers, ...dataRows];

  return {
    columns: buildColumns(headers, dataRows),
    rows: dataRows,
    rawRows,
    headerRowIndex: 0,
    sourceType: "json",
  };
}

export function parsePaste(text: string): ParsedImportData {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
    delimiter: "\t",
  });
  const allRows = result.data;
  if (allRows.length === 0) throw new Error("Pasted data is empty");

  // Heuristic: if first row looks like headers (non-numeric, unique), treat as headers
  const firstRow = allRows[0];
  const hasHeaders =
    firstRow.every((v) => isNaN(Number(v))) &&
    new Set(firstRow).size === firstRow.length;

  const rawRows = allRows.slice(0, MAX_ROWS + 1);
  const headerRowIndex = 0;
  const headers = hasHeaders
    ? firstRow
    : firstRow.map((_, i) => `Column ${i + 1}`);
  const rows = hasHeaders ? rawRows.slice(1) : rawRows;

  return {
    columns: buildColumns(headers, rows),
    rows,
    rawRows,
    headerRowIndex,
    sourceType: "paste",
  };
}
