ALTER TABLE ai_chat_messages ADD COLUMN usage JSONB;

-- Update the check constraint to also allow usage-only rows
ALTER TABLE ai_chat_messages DROP CONSTRAINT message_has_content_or_tool_call;
ALTER TABLE ai_chat_messages ADD CONSTRAINT message_has_content_or_tool_call
  CHECK (content IS NOT NULL OR tool_calls IS NOT NULL OR attachments IS NOT NULL OR usage IS NOT NULL);
