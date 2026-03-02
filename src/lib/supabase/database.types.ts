export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["message_role_enum"]
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["message_role_enum"]
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["message_role_enum"]
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chats: {
        Row: {
          created_at: string | null
          project_id: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          project_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          project_id: string | null
          title: string
          type: Database["public"]["Enums"]["doc_type_enum"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          project_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["doc_type_enum"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          project_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["doc_type_enum"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          created_at: string | null
          data: Json
          project_id: string
          id: string
          status: Database["public"]["Enums"]["status_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          project_id: string
          id?: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          project_id?: string
          id?: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_cards: {
        Row: {
          card_id: string
          deck_id: string
          quantity: number | null
        }
        Insert: {
          card_id: string
          deck_id: string
          quantity?: number | null
        }
        Update: {
          card_id?: string
          deck_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string | null
          description: string | null
          project_id: string
          id: string
          name: string
          status: Database["public"]["Enums"]["status_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          project_id: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          project_id?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["status_enum"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      layouts: {
        Row: {
          bleed_margin: number | null
          canvas_elements: Json
          condition: Json | null
          created_at: string | null
          project_id: string
          height: number
          id: string
          name: string
          unit: Database["public"]["Enums"]["unit_enum"] | null
          updated_at: string | null
          width: number
        }
        Insert: {
          bleed_margin?: number | null
          canvas_elements?: Json
          condition?: Json | null
          created_at?: string | null
          project_id: string
          height?: number
          id?: string
          name: string
          unit?: Database["public"]["Enums"]["unit_enum"] | null
          updated_at?: string | null
          width?: number
        }
        Update: {
          bleed_margin?: number | null
          canvas_elements?: Json
          condition?: Json | null
          created_at?: string | null
          project_id?: string
          height?: number
          id?: string
          name?: string
          unit?: Database["public"]["Enums"]["unit_enum"] | null
          updated_at?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "layouts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          id: string
          mime_type: string | null
          original_name: string | null
          size_bytes: number | null
          storage_path: string
          type: Database["public"]["Enums"]["media_type_enum"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path: string
          type?: Database["public"]["Enums"]["media_type_enum"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path?: string
          type?: Database["public"]["Enums"]["media_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          created_at: string | null
          default_value: string | null
          project_id: string
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          slug: string
          sort_order: number | null
          type: Database["public"]["Enums"]["property_type_enum"]
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          project_id: string
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          slug: string
          sort_order?: number | null
          type: Database["public"]["Enums"]["property_type_enum"]
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          project_id?: string
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          slug?: string
          sort_order?: number | null
          type?: Database["public"]["Enums"]["property_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "properties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      doc_type_enum:
        | "theme"
        | "lore"
        | "rules"
        | "card_types"
        | "sets"
        | "distribution"
        | "art_style_guide"
        | "keywords"
        | "resource_system"
        | "balance_rules"
      media_type_enum: "image" | "document" | "spreadsheet"
      message_role_enum: "user" | "assistant" | "tool"
      property_type_enum:
        | "text"
        | "number"
        | "image"
        | "select"
        | "boolean"
        | "color"
      status_enum: "draft" | "active" | "archived"
      unit_enum: "px" | "mm" | "in"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      doc_type_enum: [
        "theme",
        "lore",
        "rules",
        "card_types",
        "sets",
        "distribution",
        "art_style_guide",
        "keywords",
        "resource_system",
        "balance_rules",
      ],
      media_type_enum: ["image", "document", "spreadsheet"],
      message_role_enum: ["user", "assistant", "tool"],
      property_type_enum: [
        "text",
        "number",
        "image",
        "select",
        "boolean",
        "color",
      ],
      status_enum: ["draft", "active", "archived"],
      unit_enum: ["px", "mm", "in"],
    },
  },
} as const
