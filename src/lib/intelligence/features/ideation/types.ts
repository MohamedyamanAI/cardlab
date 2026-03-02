import type { UIMessage } from "ai";

export type IdeationStreamParams = {
  messages: UIMessage[];
  abortSignal?: AbortSignal;
};
