-- Add attachments column to ai_chat_messages for file references
ALTER TABLE ai_chat_messages
  ADD COLUMN attachments JSONB;

-- Update constraint to allow messages with only attachments
ALTER TABLE ai_chat_messages
  DROP CONSTRAINT message_has_content_or_tool_call;

ALTER TABLE ai_chat_messages
  ADD CONSTRAINT message_has_content_or_tool_call
    CHECK (content IS NOT NULL OR tool_calls IS NOT NULL OR attachments IS NOT NULL);

COMMENT ON COLUMN ai_chat_messages.attachments IS 'JSON array of {mediaId, filename, mediaType} for attached files';
