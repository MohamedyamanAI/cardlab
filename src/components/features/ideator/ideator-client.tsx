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
  SourceCodeIcon,
  Copy01Icon,
  Tick02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistory } from "./chat-history";
import {
  createChat,
  getChatMessages,
  saveMessages,
} from "@/lib/actions/chats";
import type { UIMessage } from "ai";
import type { AiChat } from "@/lib/types";

const MODELS = [
  { id: "gemini-2.5-flash", label: "Flash", icon: AiChat02Icon },
  { id: "gemini-2.5-pro", label: "Pro", icon: AiBrain04Icon },
] as const;

type IdeatorClientProps = {
  initialChats: AiChat[];
};

export function IdeatorClient({ initialChats }: IdeatorClientProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingUserMessage = useRef<string | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

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
    onFinish: async ({ message }) => {
      if (!chatIdRef.current || !pendingUserMessage.current) return;

      const userText = pendingUserMessage.current;
      const persistChatId = chatIdRef.current;
      pendingUserMessage.current = null;

      const assistantText = message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n");

      if (assistantText) {
        await saveMessages(persistChatId, [
          { role: "user", content: userText },
          { role: "assistant", content: assistantText },
        ]);
      }
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

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const title = text.length > 60 ? text.slice(0, 57) + "..." : text;
      const result = await createChat(title);
      if (!result.success) return;
      currentChatId = result.data.id;
      chatIdRef.current = currentChatId;
      setChatId(currentChatId);
      setHistoryRefreshKey((k) => k + 1);
    }

    pendingUserMessage.current = text;
    setInput("");
    sendMessage({ text });
  }, [input, status, chatId, sendMessage]);

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
    inputRef.current?.focus();
  }, [setMessages]);

  const handleSelectChat = useCallback(
    async (selectedChatId: string) => {
      setChatId(selectedChatId);
      setInput("");

      const result = await getChatMessages(selectedChatId);
      if (result.success) {
        const uiMessages: UIMessage[] = result.data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: msg.content ?? "" }],
          createdAt: new Date(msg.created_at ?? Date.now()),
        }));
        setMessages(uiMessages);
      }
    },
    [setMessages]
  );

  const isLoading = status === "streaming" || status === "submitted";
  const isDev = process.env.NODE_ENV === "development";
  const [showDebug, setShowDebug] = useState(false);
  const [debugCopied, setDebugCopied] = useState(false);

  const rawChatJson = useMemo(() => {
    return JSON.stringify(messages, null, 2);
  }, [messages]);

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
          <div className="mx-auto flex max-w-2xl items-end gap-2">
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
              disabled={!input.trim() || isLoading}
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
          <div className="mx-auto mt-2 flex max-w-2xl items-center gap-1">
            {MODELS.map((m) => (
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
                <HugeiconsIcon icon={m.icon} size={12} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Debug panel — right side */}
        {showDebug && (
          <div className="flex w-[40%] shrink-0 flex-col border-l border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <HugeiconsIcon icon={SourceCodeIcon} size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Raw JSON</span>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1.5 px-2 text-xs"
                onClick={handleCopyDebug}
              >
                <HugeiconsIcon icon={debugCopied ? Tick02Icon : Copy01Icon} size={12} />
                {debugCopied ? "Copied" : "Copy all"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowDebug(false)}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </Button>
            </div>
            <pre className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {rawChatJson || "[]"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const streamdownPlugins = { code };

const TOOL_DISPLAY: Record<string, { label: string; icon: typeof Search01Icon }> = {
  google_search: { label: "Searching the web", icon: Search01Icon },
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

  const sources = message.parts.filter(
    (p): p is { type: "source-url"; url: string; sourceId: string; title?: string } =>
      p.type === "source-url"
  );

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
          <div className="whitespace-pre-wrap">{textContent}</div>
        ) : (
          <>
            {activeTools.map((toolPart) => {
              const name = getToolName(toolPart);
              const display = getToolDisplay(name);
              const isDone = toolPart.state === "output-available";

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
