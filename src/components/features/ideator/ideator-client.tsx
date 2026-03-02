"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

const transport = new DefaultChatTransport({ api: "/api/chat" });

type IdeatorClientProps = {
  initialChats: AiChat[];
};

export function IdeatorClient({ initialChats }: IdeatorClientProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingUserMessage = useRef<string | null>(null);

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

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <ChatHistory
          initialChats={initialChats}
          currentChatId={chatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshKey={historyRefreshKey}
        />
        <h1 className="text-sm font-semibold">Ideator</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="min-h-0 flex-1">
        <div ref={scrollRef} className="flex flex-col gap-4 p-4">
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
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your card game idea..."
            rows={1}
            className="bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-[2.5rem] max-h-32 flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px]"
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
