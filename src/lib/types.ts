import type { Tables, Enums } from "@/lib/supabase/database.types";

// Row types
export type Project = Tables<"projects">;
export type Property = Tables<"properties">;
export type Card = Tables<"cards">;

export type Media = Tables<"media">;

// Enum types
export type PropertyType = Enums<"property_type_enum">;
export type StatusEnum = Enums<"status_enum">;
export type MediaType = Enums<"media_type_enum">;

// Server action result wrapper
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
