-- ============================================================================
-- DOCUMENT TYPE ENUM
-- ============================================================================

CREATE TYPE doc_type_enum AS ENUM (
  'theme',
  'lore',
  'rules',
  'card_types',
  'sets',
  'distribution',
  'art_style_guide',
  'keywords',
  'resource_system',
  'balance_rules'
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

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);

COMMENT ON TABLE documents IS 'Rich text design documents (lore, rules, themes, etc.)';
COMMENT ON COLUMN documents.type IS 'Optional document category from doc_type_enum';
COMMENT ON COLUMN documents.content IS 'TipTap JSON document content';
COMMENT ON COLUMN documents.project_id IS 'Optional link to a specific project';
