"use client";

import { useEffect, useState, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WorkHistoryIcon,
  Cancel01Icon,
  Delete01Icon,
  Add01Icon,
  Search01Icon,
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
  const [search, setSearch] = useState("");

  // Re-fetch when panel opens and refreshKey changes (new chat created)
  useEffect(() => {
    if (!isOpen) return;
    if (refreshKey === 0) return; // Skip initial render, use initialChats
    getChats().then((result) => {
      if (result.success) setChats(result.data);
    });
  }, [isOpen, refreshKey]);

  // Clear search when panel closes
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter((c) => c.title?.toLowerCase().includes(q));
  }, [chats, search]);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await deleteChat(chatId);
    if (result.success) {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    }
  };

  if (!isOpen) {
    return (
      <div className="flex shrink-0 items-start pt-3 pl-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <HugeiconsIcon icon={WorkHistoryIcon} size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-1/2 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">Chat History</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              onNewChat();
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

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-input/30 px-3 py-1.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="shrink-0 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {filteredChats.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {search ? "No matches" : "No conversations yet"}
            </p>
          )}
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                onSelectChat(chat.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectChat(chat.id);
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
  );
}
