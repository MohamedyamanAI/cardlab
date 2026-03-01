-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE property_type_enum AS ENUM ('text', 'number', 'image', 'select', 'boolean', 'color');
CREATE TYPE unit_enum AS ENUM ('px', 'mm', 'in');
CREATE TYPE media_type_enum AS ENUM ('image', 'document', 'spreadsheet');
CREATE TYPE message_role_enum AS ENUM ('user', 'assistant', 'tool');
CREATE TYPE status_enum AS ENUM ('draft', 'active', 'archived');

-- ============================================================================
-- USERS (Extends auth.users)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a public user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- GAMES
-- ============================================================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROPERTIES
-- ============================================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type property_type_enum NOT NULL,
  default_value TEXT,
  options JSONB, -- For 'select' types
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uk_properties_slug UNIQUE(game_id, slug)
);

-- ============================================================================
-- CARDS
-- ============================================================================

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status status_enum NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LAYOUTS
-- ============================================================================

CREATE TABLE layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  width INTEGER NOT NULL DEFAULT 825,
  height INTEGER NOT NULL DEFAULT 1125,
  unit unit_enum DEFAULT 'px',
  bleed_margin INTEGER DEFAULT 37,
  
  condition JSONB, 
  canvas_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DECKS
-- ============================================================================

CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DECK CARDS (Junction)
-- ============================================================================

CREATE TABLE deck_cards (
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  
  CONSTRAINT pk_deck_cards PRIMARY KEY (deck_id, card_id)
);

-- ============================================================================
-- MEDIA & STORAGE
-- ============================================================================

-- Create the storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  type media_type_enum NOT NULL DEFAULT 'image',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Policies (RLS)
-- Users can only access their own folder: users/{user_id}/*

CREATE POLICY "Users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================================================
-- AI CHATS & MESSAGES
-- ============================================================================

CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE, -- Optional: Link chat to a specific game
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  role message_role_enum NOT NULL,
  content TEXT,
  tool_calls JSONB,
  tool_call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT message_has_content_or_tool_call 
    CHECK (content IS NOT NULL OR tool_calls IS NOT NULL)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_properties_game_id ON properties(game_id);
CREATE INDEX idx_cards_game_id ON cards(game_id);
CREATE INDEX idx_cards_data ON cards USING gin (data);
CREATE INDEX idx_layouts_game_id ON layouts(game_id);
CREATE INDEX idx_decks_game_id ON decks(game_id);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_ai_chat_messages_chat_id ON ai_chat_messages(chat_id);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'Public profile table extending auth.users';
COMMENT ON TABLE games IS 'Top-level container for a card game project';
COMMENT ON TABLE properties IS 'Schema definitions (columns) for cards in a game';
COMMENT ON COLUMN properties.slug IS 'The JSON key used in the cards.data column';
COMMENT ON COLUMN properties.options IS 'JSON array of string options for select type properties';
COMMENT ON TABLE cards IS 'Individual cards containing dynamic data based on properties';
COMMENT ON COLUMN cards.data IS 'Dynamic key-value pairs matching property slugs';
COMMENT ON TABLE layouts IS 'Visual blueprints for rendering cards';
COMMENT ON COLUMN layouts.width IS 'Card width in pixels (default 300 DPI)';
COMMENT ON COLUMN layouts.canvas_elements IS 'Array of visual elements and their data bindings';
COMMENT ON TABLE decks IS 'Collections of cards (e.g. Starter Deck, Booster Pack)';
COMMENT ON TABLE deck_cards IS 'Junction table linking cards to decks with quantities';
COMMENT ON TABLE media IS 'Metadata for user-uploaded files stored in Supabase Storage';
COMMENT ON COLUMN media.storage_path IS 'Path in storage bucket: users/{user_id}/{filename}';
COMMENT ON TABLE ai_chats IS 'Conversation history with the AI assistant';
COMMENT ON COLUMN ai_chats.game_id IS 'Optional link to a specific game context';
COMMENT ON TABLE ai_chat_messages IS 'Individual messages in a chat session';
COMMENT ON COLUMN ai_chat_messages.tool_calls IS 'JSON array of tool calls made by the assistant';

-- ============================================================================
-- EXAMPLE DATA
-- ============================================================================

/*
-- 1. Create a Game
INSERT INTO games (user_id, name) VALUES ('...uuid...', 'Fantasy Battle');

-- 2. Define Properties
INSERT INTO properties (game_id, name, slug, type) VALUES 
('...game_id...', 'Attack', 'attack', 'number'),
('...game_id...', 'Name', 'name', 'text');

-- 3. Create a Card
INSERT INTO cards (game_id, data) VALUES 
('...game_id...', '{"name": "Goblin", "attack": 3}');

-- 4. Create a Layout
INSERT INTO layouts (game_id, name, canvas_elements) VALUES 
('...game_id...', 'Standard Minion', '[{"type": "text", "bind_to": "name", "x": 10, "y": 10}]');
*/
