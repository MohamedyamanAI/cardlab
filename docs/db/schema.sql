-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE property_type_enum AS ENUM ('text', 'number', 'image', 'select', 'boolean', 'color');
CREATE TYPE unit_enum AS ENUM ('px', 'mm', 'in');
CREATE TYPE doc_type_enum AS ENUM (
  'theme', 'lore', 'rules', 'card_types', 'sets',
  'distribution', 'art_style_guide', 'keywords',
  'resource_system', 'balance_rules'
);
CREATE TYPE media_type_enum AS ENUM ('image', 'document', 'spreadsheet');
CREATE TYPE message_role_enum AS ENUM ('user', 'assistant', 'tool');
CREATE TYPE status_enum AS ENUM ('draft', 'active', 'archived');
CREATE TYPE version_reason_enum AS ENUM (
  'manual', 'status_change', 'pre_import',
  'pre_restore', 'pre_ai_edit', 'periodic_auto_save'
);

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
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
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
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type property_type_enum NOT NULL,
  default_value TEXT,
  options JSONB, -- For 'select' types
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uk_properties_slug UNIQUE(project_id, slug)
);

-- ============================================================================
-- CARDS
-- ============================================================================

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

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
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
  generation_meta JSONB,

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
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  title TEXT NOT NULL DEFAULT 'Untitled',
  type doc_type_enum,
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AI CHATS & MESSAGES
-- ============================================================================

CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
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
  attachments JSONB,
  usage JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT message_has_content_or_tool_call
    CHECK (content IS NOT NULL OR tool_calls IS NOT NULL OR attachments IS NOT NULL OR usage IS NOT NULL)
);

-- ============================================================================
-- VERSIONING
-- ============================================================================

CREATE TABLE card_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  status status_enum NOT NULL,

  reason version_reason_enum,
  label TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_card_version UNIQUE(card_id, version_number)
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  type doc_type_enum,
  content JSONB NOT NULL,

  reason version_reason_enum,
  label TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_document_version UNIQUE(document_id, version_number)
);

CREATE TABLE deck_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status status_enum NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,

  reason version_reason_enum,
  label TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_deck_version UNIQUE(deck_id, version_number)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_properties_project_id ON properties(project_id);
CREATE INDEX idx_cards_project_id ON cards(project_id);
CREATE INDEX idx_cards_data ON cards USING gin (data);
CREATE INDEX idx_layouts_project_id ON layouts(project_id);
CREATE INDEX idx_decks_project_id ON decks(project_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_ai_chat_messages_chat_id ON ai_chat_messages(chat_id);
CREATE INDEX idx_card_versions_card_id ON card_versions(card_id);
CREATE INDEX idx_card_versions_project_id ON card_versions(project_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_user_id ON document_versions(user_id);
CREATE INDEX idx_deck_versions_deck_id ON deck_versions(deck_id);
CREATE INDEX idx_deck_versions_project_id ON deck_versions(project_id);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'Public profile table extending auth.users';
COMMENT ON TABLE projects IS 'Top-level container for a card project';
COMMENT ON TABLE properties IS 'Schema definitions (columns) for cards in a project';
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
COMMENT ON COLUMN media.generation_meta IS 'AI generation metadata: model, prompt, usage tokens, cost';
COMMENT ON TABLE ai_chats IS 'Conversation history with the AI assistant';
COMMENT ON COLUMN ai_chats.project_id IS 'Optional link to a specific project context';
COMMENT ON TABLE ai_chat_messages IS 'Individual messages in a chat session';
COMMENT ON COLUMN ai_chat_messages.tool_calls IS 'JSON array of tool calls made by the assistant';
COMMENT ON TABLE card_versions IS 'Immutable snapshots of card state for version history';
COMMENT ON COLUMN card_versions.reason IS 'What triggered this version: manual, status-change, pre-import, pre-restore';
COMMENT ON TABLE document_versions IS 'Immutable snapshots of document state for version history';
COMMENT ON COLUMN document_versions.content IS 'TipTap JSON content at this version';
COMMENT ON TABLE deck_versions IS 'Immutable snapshots of deck state and composition for version history';
COMMENT ON COLUMN deck_versions.cards IS 'JSON array of {card_id, quantity} representing deck composition at this version';

-- ============================================================================
-- EXAMPLE DATA
-- ============================================================================

/*
-- 1. Create a Project
INSERT INTO projects (user_id, name) VALUES ('...uuid...', 'Fantasy Battle');

-- 2. Define Properties
INSERT INTO properties (project_id, name, slug, type) VALUES
('...project_id...', 'Attack', 'attack', 'number'),
('...project_id...', 'Name', 'name', 'text');

-- 3. Create a Card
INSERT INTO cards (project_id, data) VALUES
('...project_id...', '{"name": "Goblin", "attack": 3}');

-- 4. Create a Layout
INSERT INTO layouts (project_id, name, canvas_elements) VALUES
('...project_id...', 'Standard Minion', '[{"type": "text", "bind_to": "name", "x": 10, "y": 10}]');
*/
