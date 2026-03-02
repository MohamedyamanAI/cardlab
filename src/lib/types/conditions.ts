import type { PropertyType } from "@/lib/types";

export type ComparisonOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is_empty"
  | "is_not_empty";

export interface LayoutCondition {
  field: string;
  operator: ComparisonOperator;
  value?: string | number | boolean | null;
}

export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  eq: "equals",
  neq: "does not equal",
  gt: "greater than",
  gte: "greater than or equal",
  lt: "less than",
  lte: "less than or equal",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export const OPERATORS_BY_TYPE: Record<PropertyType, ComparisonOperator[]> = {
  text: ["eq", "neq", "is_empty", "is_not_empty"],
  number: ["eq", "neq", "gt", "gte", "lt", "lte", "is_empty", "is_not_empty"],
  select: ["eq", "neq", "is_empty", "is_not_empty"],
  boolean: ["eq", "neq"],
  color: ["eq", "neq", "is_empty", "is_not_empty"],
  image: ["is_empty", "is_not_empty"],
};

/** Operators that don't require a value input */
export const VALUE_LESS_OPERATORS: ComparisonOperator[] = [
  "is_empty",
  "is_not_empty",
];
