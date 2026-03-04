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
        role: z.enum(["user", "assistant", "tool"]),
        content: z.string().max(50000).nullable(),
        toolCalls: z.unknown().optional(),
        attachments: z
          .array(
            z.object({
              mediaId: z.string().uuid(),
              filename: z.string(),
              mediaType: z.string(),
            })
          )
          .optional(),
        usage: z
          .object({
            inputTokens: z.number(),
            outputTokens: z.number(),
            reasoningTokens: z.number(),
            totalTokens: z.number(),
            model: z.string(),
            cost: z.object({
              inputCost: z.number(),
              outputCost: z.number(),
              reasoningCost: z.number(),
              totalCost: z.number(),
            }),
          })
          .optional(),
      })
    )
    .min(1),
});
