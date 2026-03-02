import type { PropertyType } from "@/lib/types";

/** A single column detected in the import source */
export interface ImportColumn {
  /** Original header name from the source data */
  name: string;
  /** Index in the source data */
  index: number;
  /** Auto-inferred type from sampling the data */
  inferredType: PropertyType;
  /** Sample values (first 5 non-empty) for display in the mapping UI */
  sampleValues: string[];
}

/** How a single import column maps to a project property */
export interface ColumnMapping {
  /** Index of the import column */
  sourceIndex: number;
  /** Target action */
  action: "map_existing" | "create_new" | "skip";
  /** If action is "map_existing": the slug of the existing property */
  existingPropertySlug?: string;
  /** If action is "create_new": the name for the new property */
  newPropertyName?: string;
  /** If action is "create_new": the type for the new property */
  newPropertyType?: PropertyType;
  /** If action is "create_new" and type is "select": the option values */
  newPropertyOptions?: string[];
}

/** Parsed import data ready for mapping */
export interface ParsedImportData {
  columns: ImportColumn[];
  rows: string[][];
  /** All rows including the header row (row at headerRowIndex) */
  rawRows: string[][];
  /** Which raw row index is treated as headers (default 0) */
  headerRowIndex: number;
  sourceType: "csv" | "json" | "paste";
  fileName?: string;
}

/** Result of the import execution */
export interface ImportResult {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: Array<{ row: number; message: string }>;
  createdProperties: string[];
  projectId: string;
}
