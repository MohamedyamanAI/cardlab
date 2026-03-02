-- ============================================================================
-- Migration 001: Rename games → projects
-- ============================================================================
-- Renames the `games` table to `projects` and updates all `game_id` columns
-- to `project_id` across the entire schema.
-- ============================================================================

BEGIN;

-- 1. Rename the table
ALTER TABLE games RENAME TO projects;

-- 2. Rename game_id columns in all related tables
ALTER TABLE properties RENAME COLUMN game_id TO project_id;
ALTER TABLE cards RENAME COLUMN game_id TO project_id;
ALTER TABLE layouts RENAME COLUMN game_id TO project_id;
ALTER TABLE decks RENAME COLUMN game_id TO project_id;
ALTER TABLE ai_chats RENAME COLUMN game_id TO project_id;

-- 3. Drop and recreate foreign key constraints with new names
-- properties
ALTER TABLE properties DROP CONSTRAINT properties_game_id_fkey;
ALTER TABLE properties ADD CONSTRAINT properties_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- cards
ALTER TABLE cards DROP CONSTRAINT cards_game_id_fkey;
ALTER TABLE cards ADD CONSTRAINT cards_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- layouts
ALTER TABLE layouts DROP CONSTRAINT layouts_game_id_fkey;
ALTER TABLE layouts ADD CONSTRAINT layouts_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- decks
ALTER TABLE decks DROP CONSTRAINT decks_game_id_fkey;
ALTER TABLE decks ADD CONSTRAINT decks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- ai_chats
ALTER TABLE ai_chats DROP CONSTRAINT ai_chats_game_id_fkey;
ALTER TABLE ai_chats ADD CONSTRAINT ai_chats_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 4. Rename indexes
ALTER INDEX idx_games_user_id RENAME TO idx_projects_user_id;
ALTER INDEX idx_properties_game_id RENAME TO idx_properties_project_id;
ALTER INDEX idx_cards_game_id RENAME TO idx_cards_project_id;
ALTER INDEX idx_layouts_game_id RENAME TO idx_layouts_project_id;
ALTER INDEX idx_decks_game_id RENAME TO idx_decks_project_id;

-- 5. Rename the unique constraint on properties
ALTER TABLE properties DROP CONSTRAINT uk_properties_slug;
ALTER TABLE properties ADD CONSTRAINT uk_properties_slug UNIQUE (project_id, slug);

-- 6. Update the FK constraint name for games_user_id_fkey → projects_user_id_fkey
ALTER TABLE projects DROP CONSTRAINT games_user_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Update comments
COMMENT ON TABLE projects IS 'Top-level container for a card project';
COMMENT ON COLUMN properties.slug IS 'The JSON key used in the cards.data column';
COMMENT ON COLUMN properties.options IS 'JSON array of string options for select type properties';

COMMIT;
