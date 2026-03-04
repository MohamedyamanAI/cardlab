"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  Loading03Icon,
  BulbIcon,
  Globe02Icon,
  Search01Icon,
  Settings01Icon,
  AiChat02Icon,
  AiBrain04Icon,
  NoteIcon,
  SourceCodeIcon,
  Copy01Icon,
  Tick02Icon,
  Cancel01Icon,
  Attachment01Icon,
  Pdf01Icon,
  Table01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistory } from "./chat-history";
import { DocumentPreviewCard } from "./document-preview-card";
import {
  createChat,
  getChatMessages,
  saveMessages,
} from "@/lib/actions/chats";
import { uploadMedia, resolveMediaIds } from "@/lib/actions/media";
import { z } from "zod/v4";
import type { UIMessage, FileUIPart } from "ai";
import type { AiChat } from "@/lib/types";
import type { UsageData } from "@/lib/intelligence/core/pricing";
import { CHAT_MODELS, type ChatModelId } from "@/lib/intelligence/core/providers";

const MODEL_ICONS: Record<ChatModelId, typeof AiChat02Icon> = {
  "gemini-2.5-flash": AiChat02Icon,
  "gemini-2.5-pro": AiBrain04Icon,
};

const ACCEPTED_FILE_TYPES = "image/*,.pdf,.csv,.xlsx,.xls";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type PendingAttachment = {
  id: string;
  file: File;
  dataUrl: string;
  mediaId: string | null;
  filename: string;
  mediaType: string;
  status: "uploading" | "done" | "error";
};

type ChatMessageMetadata = {
  usage?: UsageData;
};

const messageMetadataSchema = z.object({
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
});

type DebugTab = "json" | "usage";

type IdeatorClientProps = {
  initialChats: AiChat[];
};

export function IdeatorClient({ initialChats }: IdeatorClientProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(CHAT_MODELS[0].id);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingUserMessage = useRef<string | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

  // Attachment state
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAttachmentsRef = useRef<PendingAttachment[]>([]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ model: modelRef.current }),
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messageMetadataSchema,
    onFinish: async ({ message }) => {
      if (!chatIdRef.current || !pendingUserMessage.current) return;

      const userText = pendingUserMessage.current;
      const persistChatId = chatIdRef.current;
      const snapshotAttachments = pendingAttachmentsRef.current;
      pendingUserMessage.current = null;
      pendingAttachmentsRef.current = [];

      const assistantText = message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n");

      // Extract completed tool results for persistence
      const toolResults = message.parts
        .filter(isToolUIPart)
        .filter((p) => p.state === "output-available" && p.output)
        .map((p) => ({
          toolName: getToolName(p),
          toolCallId: p.toolCallId,
          output: p.output,
        }));

      const completedAttachments = snapshotAttachments
        .filter((a) => a.status === "done" && a.mediaId)
        .map((a) => ({
          mediaId: a.mediaId!,
          filename: a.filename,
          mediaType: a.mediaType,
        }));

      const usage = (message as UIMessage<ChatMessageMetadata>).metadata?.usage;

      const msgs: {
        role: "user" | "assistant" | "tool";
        content: string | null;
        toolCalls?: unknown;
        attachments?: { mediaId: string; filename: string; mediaType: string }[];
        usage?: UsageData;
      }[] = [
        {
          role: "user",
          content: userText || null,
          ...(completedAttachments.length > 0 && { attachments: completedAttachments }),
        },
      ];

      if (assistantText || toolResults.length > 0) {
        msgs.push({
          role: "assistant",
          content: assistantText || null,
          ...(toolResults.length > 0 && { toolCalls: toolResults }),
          ...(usage && { usage }),
        });
      }

      await saveMessages(persistChatId, msgs);
    },
  });

  // Keep chatId ref in sync
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-expand textarea up to 4 rows
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [input]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          continue; // silently skip oversized files
        }

        const id = crypto.randomUUID();
        const pending: PendingAttachment = {
          id,
          file,
          dataUrl: "",
          mediaId: null,
          filename: file.name,
          mediaType: file.type,
          status: "uploading",
        };

        setAttachments((prev) => [...prev, pending]);

        // Read as data URL + upload in parallel
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setAttachments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, dataUrl } : a))
          );
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadMedia(formData);

        if (result.success) {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, mediaId: result.data.id, status: "done" }
                : a
            )
          );
        } else {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, status: "error" } : a
            )
          );
        }
      }

      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    const readyAttachments = attachments.filter((a) => a.status === "done" && a.dataUrl);
    if ((!text && readyAttachments.length === 0) || status === "streaming" || status === "submitted") return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const titleSource = text || readyAttachments[0]?.filename || "Attachment";
      const title = titleSource.length > 60 ? titleSource.slice(0, 57) + "..." : titleSource;
      const result = await createChat(title);
      if (!result.success) return;
      currentChatId = result.data.id;
      chatIdRef.current = currentChatId;
      setChatId(currentChatId);
      setHistoryRefreshKey((k) => k + 1);
    }

    pendingUserMessage.current = text || "[attachment]";
    pendingAttachmentsRef.current = [...attachments];

    // Build file parts from ready attachments
    const files: FileUIPart[] = readyAttachments.map((a) => ({
      type: "file" as const,
      mediaType: a.mediaType,
      filename: a.filename,
      url: a.dataUrl,
    }));

    setInput("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (files.length > 0) {
      sendMessage({ text: text || undefined, files });
    } else {
      sendMessage({ text });
    }
  }, [input, status, chatId, sendMessage, attachments]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = useCallback(() => {
    setChatId(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    inputRef.current?.focus();
  }, [setMessages]);

  const handleSelectChat = useCallback(
    async (selectedChatId: string) => {
      setChatId(selectedChatId);
      setInput("");
      setAttachments([]);

      const result = await getChatMessages(selectedChatId);
      if (result.success) {
        // Collect all media IDs from attachments across messages
        type AttachmentMeta = { mediaId: string; filename: string; mediaType: string };
        const allMediaIds: string[] = [];
        const messageAttachments = new Map<string, AttachmentMeta[]>();

        for (const msg of result.data) {
          if (msg.attachments && Array.isArray(msg.attachments)) {
            const atts = msg.attachments as AttachmentMeta[];
            messageAttachments.set(msg.id, atts);
            for (const a of atts) {
              allMediaIds.push(a.mediaId);
            }
          }
        }

        // Bulk-resolve signed URLs
        let mediaUrlMap: Record<string, { signedUrl: string; storagePath: string; originalName: string }> = {};
        if (allMediaIds.length > 0) {
          const mediaResult = await resolveMediaIds(allMediaIds);
          if (mediaResult.success) {
            mediaUrlMap = mediaResult.data;
          }
        }

        const uiMessages: UIMessage[] = result.data.map((msg) => {
          const parts: UIMessage["parts"] = [];

          // Reconstruct file parts from persisted attachments
          const atts = messageAttachments.get(msg.id);
          if (atts) {
            for (const a of atts) {
              const resolved = mediaUrlMap[a.mediaId];
              if (resolved) {
                parts.push({
                  type: "file",
                  mediaType: a.mediaType,
                  filename: a.filename,
                  url: resolved.signedUrl,
                } as FileUIPart);
              }
            }
          }

          // Reconstruct tool parts from persisted tool_calls
          if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
            for (const call of msg.tool_calls as { toolName: string; toolCallId: string; output: unknown }[]) {
              parts.push({
                type: `tool-${call.toolName}`,
                toolCallId: call.toolCallId,
                state: "output-available",
                input: {},
                output: call.output,
              } as unknown as UIMessage["parts"][number]);
            }
          }

          if (msg.content) {
            parts.push({ type: "text" as const, text: msg.content });
          }

          return {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            parts,
            createdAt: new Date(msg.created_at ?? Date.now()),
          };
        });
        setMessages(uiMessages);
      }
    },
    [setMessages]
  );

  const isLoading = status === "streaming" || status === "submitted";
  const hasUploadingAttachments = attachments.some((a) => a.status === "uploading");
  const canSend = (input.trim() || attachments.some((a) => a.status === "done")) && !isLoading && !hasUploadingAttachments;

  const isDev = process.env.NODE_ENV === "development";
  const [showDebug, setShowDebug] = useState(false);
  const [debugTab, setDebugTab] = useState<DebugTab>("json");
  const [debugCopied, setDebugCopied] = useState(false);

  const rawChatJson = useMemo(() => {
    return JSON.stringify(messages, null, 2);
  }, [messages]);

  const usageSummary = useMemo(() => {
    return (messages as UIMessage<ChatMessageMetadata>[])
      .filter((m) => m.role === "assistant" && m.metadata?.usage)
      .map((m) => m.metadata!.usage!);
  }, [messages]);

  const totalCost = useMemo(
    () => usageSummary.reduce((sum, u) => sum + u.cost.totalCost, 0),
    [usageSummary]
  );

  const handleCopyDebug = useCallback(async () => {
    await navigator.clipboard.writeText(rawChatJson);
    setDebugCopied(true);
    setTimeout(() => setDebugCopied(false), 2000);
  }, [rawChatJson]);

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-border">
      {/* Chat history side panel */}
      <ChatHistory
        initialChats={initialChats}
        currentChatId={chatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        refreshKey={historyRefreshKey}
      />

      {/* Chat column */}
      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — debug toggle (dev only) */}
        {isDev && messages.length > 0 && (
          <div className="flex justify-end px-3 py-1.5">
            <button
              type="button"
              onClick={() => setShowDebug((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors ${
                showDebug
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle raw chat debug"
            >
              <HugeiconsIcon icon={SourceCodeIcon} size={12} />
              Debug
            </button>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1">
          <div ref={scrollRef} className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
              <HugeiconsIcon
                icon={BulbIcon}
                size={40}
                className="text-muted-foreground/50"
              />
              <div>
                <p className="font-medium text-muted-foreground">
                  Start brainstorming
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Ask me about game mechanics, card designs, themes, or anything
                  card-game related.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isLoading && message === messages[messages.length - 1]
              }
            />
          ))}

          {status === "submitted" &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  className="animate-spin"
                />
                <span>Thinking...</span>
              </div>
            )}
        </div>
      </ScrollArea>

        {/* Input */}
        <div className="p-4">
          <div className="mx-auto max-w-2xl">
            {/* Attachment preview chips */}
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <AttachmentChip
                    key={a.id}
                    attachment={a}
                    onRemove={() => removeAttachment(a.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Attach button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach files"
              >
                <HugeiconsIcon icon={Attachment01Icon} size={16} />
              </Button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your card game idea..."
                rows={1}
                className="bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-[2.5rem] max-h-24 flex-1 resize-none overflow-y-auto rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px]"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
              >
                {isLoading ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {CHAT_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    model === m.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={MODEL_ICONS[m.id]} size={12} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Debug panel — right side */}
        {showDebug && (
          <div className="flex w-[40%] shrink-0 flex-col border-l border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <div className="flex gap-1">
                {(["json", "usage"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDebugTab(tab)}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                      debugTab === tab
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "json" ? "Raw JSON" : "Usage"}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              {debugTab === "json" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1.5 px-2 text-xs"
                  onClick={handleCopyDebug}
                >
                  <HugeiconsIcon icon={debugCopied ? Tick02Icon : Copy01Icon} size={12} />
                  {debugCopied ? "Copied" : "Copy all"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowDebug(false)}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </Button>
            </div>

            {debugTab === "json" ? (
              <pre className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {rawChatJson || "[]"}
              </pre>
            ) : (
              <div className="flex-1 overflow-auto p-3">
                {usageSummary.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No usage data yet.</p>
                ) : (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-1.5 pr-3 font-medium">Model</th>
                        <th className="pb-1.5 pr-3 font-medium text-right">In</th>
                        <th className="pb-1.5 pr-3 font-medium text-right">Out</th>
                        <th className="pb-1.5 pr-3 font-medium text-right">Think</th>
                        <th className="pb-1.5 font-medium text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {usageSummary.map((u, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5 pr-3 font-mono">{u.model}</td>
                          <td className="py-1.5 pr-3 text-right tabular-nums">{u.inputTokens.toLocaleString()}</td>
                          <td className="py-1.5 pr-3 text-right tabular-nums">{u.outputTokens.toLocaleString()}</td>
                          <td className="py-1.5 pr-3 text-right tabular-nums">{u.reasoningTokens.toLocaleString()}</td>
                          <td className="py-1.5 text-right tabular-nums">${u.cost.totalCost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-medium text-foreground">
                        <td className="pt-1.5" colSpan={4}>Total</td>
                        <td className="pt-1.5 text-right tabular-nums">${totalCost.toFixed(4)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Attachment chip component ---

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: PendingAttachment;
  onRemove: () => void;
}) {
  const isImage = attachment.mediaType.startsWith("image/");

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2 py-1">
      {attachment.status === "uploading" ? (
        <HugeiconsIcon icon={Loading03Icon} size={14} className="shrink-0 animate-spin text-muted-foreground" />
      ) : isImage && attachment.dataUrl ? (
        <img
          src={attachment.dataUrl}
          alt={attachment.filename}
          className="h-8 w-8 shrink-0 rounded object-cover"
        />
      ) : (
        <HugeiconsIcon
          icon={getFileIcon(attachment.mediaType)}
          size={14}
          className="shrink-0 text-muted-foreground"
        />
      )}
      <span className="max-w-[120px] truncate text-xs">
        {attachment.filename}
      </span>
      {attachment.status === "error" && (
        <span className="text-[10px] text-destructive">Failed</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={10} />
      </button>
    </div>
  );
}

// --- Helpers ---

function getFileIcon(mediaType: string) {
  if (mediaType === "application/pdf") return Pdf01Icon;
  if (
    mediaType === "text/csv" ||
    mediaType.includes("spreadsheet") ||
    mediaType.includes("excel")
  )
    return Table01Icon;
  if (mediaType.startsWith("image/")) return Image01Icon;
  return NoteIcon;
}

// --- Message bubble ---

const streamdownPlugins = { code };

const TOOL_DISPLAY: Record<string, { label: string; icon: typeof Search01Icon }> = {
  google_search: { label: "Searching the web", icon: Search01Icon },
  create_document: { label: "Creating document", icon: NoteIcon },
};

function getToolDisplay(toolName: string) {
  return TOOL_DISPLAY[toolName] ?? {
    label: toolName.replace(/_/g, " "),
    icon: Settings01Icon,
  };
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: UIMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  const textContent = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  const fileParts = message.parts.filter(
    (p): p is FileUIPart => p.type === "file"
  );

  const sources = message.parts.filter(
    (p): p is { type: "source-url"; url: string; sourceId: string; title?: string } =>
      p.type === "source-url"
  );

  const reasoningParts = message.parts.filter(
    (p): p is { type: "reasoning"; text: string } => p.type === "reasoning"
  );
  const reasoningText = reasoningParts.map((p) => p.text).join("");

  const toolParts = message.parts.filter(isToolUIPart);
  const activeTools = toolParts.filter(
    (p) =>
      p.state === "input-streaming" ||
      p.state === "input-available" ||
      p.state === "output-available"
  );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {isUser ? (
          <>
            {/* File attachments in user messages */}
            {fileParts.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {fileParts.map((fp, i) => (
                  <FilePartDisplay key={i} filePart={fp} isUser />
                ))}
              </div>
            )}
            {textContent && (
              <div className="whitespace-pre-wrap">{textContent}</div>
            )}
          </>
        ) : (
          <>
            {reasoningText && (
              <details className="mb-2 text-xs text-muted-foreground">
                <summary className="inline-flex cursor-pointer items-center gap-1.5">
                  <HugeiconsIcon icon={AiBrain04Icon} size={12} />
                  Thinking
                </summary>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-background/50 p-2 font-mono text-[11px]">
                  {reasoningText}
                </pre>
              </details>
            )}

            {activeTools.map((toolPart) => {
              const name = getToolName(toolPart);
              const display = getToolDisplay(name);
              const isDone = toolPart.state === "output-available";

              // Rich preview for completed create_document
              if (name === "create_document" && isDone) {
                const result = toolPart.output as {
                  success: boolean;
                  documentId: string;
                  title: string;
                  type: string | null;
                  content: Record<string, unknown>;
                } | null;
                if (result?.success) {
                  return (
                    <DocumentPreviewCard
                      key={toolPart.toolCallId}
                      documentId={result.documentId}
                      title={result.title}
                      type={result.type}
                      content={result.content}
                    />
                  );
                }
              }

              return (
                <div
                  key={toolPart.toolCallId}
                  className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"
                >
                  {isDone ? (
                    <HugeiconsIcon
                      icon={display.icon}
                      size={14}
                      className="shrink-0"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={14}
                      className="shrink-0 animate-spin"
                    />
                  )}
                  <span>
                    {isDone ? display.label.replace(/ing/, "ed") : `${display.label}...`}
                  </span>
                </div>
              );
            })}

            {textContent && (
              <Streamdown
                animated
                plugins={streamdownPlugins}
                isAnimating={isStreaming}
              >
                {textContent}
              </Streamdown>
            )}

            {isStreaming && !textContent && activeTools.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={14}
                  className="animate-spin"
                />
                <span>Thinking...</span>
              </div>
            )}
          </>
        )}

        {sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
              >
                <HugeiconsIcon icon={Globe02Icon} size={12} />
                <span className="underline">
                  {source.title ?? source.url}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilePartDisplay({
  filePart,
  isUser,
}: {
  filePart: FileUIPart;
  isUser?: boolean;
}) {
  const isImage = filePart.mediaType.startsWith("image/");

  if (isImage) {
    return (
      <img
        src={filePart.url}
        alt={filePart.filename ?? "Image"}
        className="max-h-[120px] rounded-lg object-cover"
      />
    );
  }

  const icon = getFileIcon(filePart.mediaType);
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
        isUser ? "bg-primary-foreground/15" : "bg-background/60"
      }`}
    >
      <HugeiconsIcon icon={icon} size={14} className="shrink-0" />
      <span className="max-w-[150px] truncate">
        {filePart.filename ?? "File"}
      </span>
    </div>
  );
}
