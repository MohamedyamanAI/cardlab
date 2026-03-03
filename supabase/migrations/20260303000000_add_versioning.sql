-- ============================================================================
-- VERSIONING TABLES
-- Snapshot-based version history for cards, documents, and decks.
-- Main tables remain the source of truth for current state.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CARD VERSIONS
-- ----------------------------------------------------------------------------

CREATE TABLE card_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  status status_enum NOT NULL,

  reason TEXT,        -- e.g. 'manual', 'status-change', 'pre-import', 'pre-restore'
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_card_version UNIQUE(card_id, version_number)
);

CREATE INDEX idx_card_versions_card_id ON card_versions(card_id);
CREATE INDEX idx_card_versions_project_id ON card_versions(project_id);

COMMENT ON TABLE card_versions IS 'Immutable snapshots of card state for version history';
COMMENT ON COLUMN card_versions.version_number IS 'Auto-incrementing per card_id, starting at 1';
COMMENT ON COLUMN card_versions.reason IS 'What triggered this version: manual, status-change, pre-import, pre-restore';

-- ----------------------------------------------------------------------------
-- DOCUMENT VERSIONS
-- ----------------------------------------------------------------------------

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  type doc_type_enum,
  content JSONB NOT NULL,

  reason TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_document_version UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_user_id ON document_versions(user_id);

COMMENT ON TABLE document_versions IS 'Immutable snapshots of document state for version history';
COMMENT ON COLUMN document_versions.content IS 'TipTap JSON content at this version';

-- ----------------------------------------------------------------------------
-- DECK VERSIONS
-- ----------------------------------------------------------------------------

CREATE TABLE deck_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status status_enum NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,

  reason TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uk_deck_version UNIQUE(deck_id, version_number)
);

CREATE INDEX idx_deck_versions_deck_id ON deck_versions(deck_id);
CREATE INDEX idx_deck_versions_project_id ON deck_versions(project_id);

COMMENT ON TABLE deck_versions IS 'Immutable snapshots of deck state and composition for version history';
COMMENT ON COLUMN deck_versions.cards IS 'JSON array of {card_id, quantity} representing deck composition at this version';
