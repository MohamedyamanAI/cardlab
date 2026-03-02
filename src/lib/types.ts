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
export type Deck = Tables<"decks">;
export type DeckCard = Tables<"deck_cards">;
export type Layout = Tables<"layouts">;
export type AiChat = Tables<"ai_chats">;
export type AiChatMessage = Tables<"ai_chat_messages">;
export type Document = Tables<"documents">;

// Enum types (additional)
export type UnitEnum = Enums<"unit_enum">;
export type DocType = Enums<"doc_type_enum">;

// Server action result wrapper
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
