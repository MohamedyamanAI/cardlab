"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WorkHistoryIcon,
  Cancel01Icon,
  Delete01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChats, deleteChat } from "@/lib/actions/chats";
import type { AiChat } from "@/lib/types";

type ChatHistoryProps = {
  initialChats: AiChat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  refreshKey: number;
};

export function ChatHistory({
  initialChats,
  currentChatId,
  onSelectChat,
  onNewChat,
  refreshKey,
}: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<AiChat[]>(initialChats);

  // Re-fetch when panel opens and refreshKey changes (new chat created)
  useEffect(() => {
    if (!isOpen) return;
    if (refreshKey === 0) return; // Skip initial render, use initialChats
    getChats().then((result) => {
      if (result.success) setChats(result.data);
    });
  }, [isOpen, refreshKey]);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await deleteChat(chatId);
    if (result.success) {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="shrink-0"
      >
        {isOpen ? (
          <HugeiconsIcon icon={Cancel01Icon} size={20} />
        ) : (
          <HugeiconsIcon icon={WorkHistoryIcon} size={20} />
        )}
      </Button>

      {isOpen && (
        <div className="absolute inset-0 z-20 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Chat History</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onNewChat();
                  setIsOpen(false);
                }}
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-0.5 p-2">
              {chats.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No conversations yet
                </p>
              )}
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectChat(chat.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    chat.id === currentChatId
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex-1 truncate">{chat.title}</span>
                  <button
                    onClick={(e) => handleDelete(chat.id, e)}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      size={14}
                      className="text-muted-foreground hover:text-destructive"
                    />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
