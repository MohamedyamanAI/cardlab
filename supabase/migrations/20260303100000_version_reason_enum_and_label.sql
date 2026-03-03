-- ============================================================================
-- Add reason enum and optional label to version tables
-- ============================================================================

CREATE TYPE version_reason_enum AS ENUM (
  'manual',
  'status_change',
  'pre_import',
  'pre_restore',
  'pre_ai_edit',
  'periodic_auto_save'
);

-- Card versions: convert reason TEXT → reason enum, add label
ALTER TABLE card_versions
  ALTER COLUMN reason TYPE version_reason_enum USING reason::version_reason_enum,
  ADD COLUMN label TEXT;

-- Document versions: same
ALTER TABLE document_versions
  ALTER COLUMN reason TYPE version_reason_enum USING reason::version_reason_enum,
  ADD COLUMN label TEXT;

-- Deck versions: same
ALTER TABLE deck_versions
  ALTER COLUMN reason TYPE version_reason_enum USING reason::version_reason_enum,
  ADD COLUMN label TEXT;

COMMENT ON COLUMN card_versions.reason IS 'What triggered this version';
COMMENT ON COLUMN card_versions.label IS 'Optional user-facing name for the version';
COMMENT ON COLUMN document_versions.label IS 'Optional user-facing name for the version';
COMMENT ON COLUMN deck_versions.label IS 'Optional user-facing name for the version';
