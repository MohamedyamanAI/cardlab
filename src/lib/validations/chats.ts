import { z } from "zod/v4";

export const createChatSchema = z.object({
  title: z.string().min(1).max(200),
});

export const chatIdSchema = z.object({
  chatId: z.string().uuid(),
});

export const saveMessagesSchema = z.object({
  chatId: z.string().uuid(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(50000),
      })
    )
    .min(1),
});
