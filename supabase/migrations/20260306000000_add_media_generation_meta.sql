ALTER TABLE media ADD COLUMN generation_meta JSONB;
COMMENT ON COLUMN media.generation_meta IS 'AI generation metadata: model, prompt, usage tokens, cost';
