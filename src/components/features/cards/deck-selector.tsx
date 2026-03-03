"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCardsStore } from "@/lib/store/cards-store";
import { CreateDeckDialog } from "./create-deck-dialog";
import { DeckDetailDialog } from "./deck-detail-dialog";
import { IconStack2, IconDotsVertical } from "@tabler/icons-react";

export function DeckSelector() {
  const { decks, selectedDeckId, selectDeck, selectedProjectId } =
    useCardsStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  if (!selectedProjectId) return null;

  const selectedDeck = selectedDeckId
    ? decks.find((d) => d.id === selectedDeckId) ?? null
    : null;

  const handleValueChange = (value: string) => {
    if (value === "__new__") {
      setCreateOpen(true);
      return;
    }
    selectDeck(value === "__all__" ? null : value);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Select
          value={selectedDeckId ?? "__all__"}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-[200px]">
            <div className="flex items-center gap-2">
              <IconStack2 size={14} className="shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All cards" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All cards</SelectItem>
            {decks.length > 0 && <SelectSeparator />}
            {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id}>
                {deck.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="__new__">+ New Deck</SelectItem>
          </SelectContent>
        </Select>
        {selectedDeck && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDetailOpen(true)}
          >
            <IconDotsVertical size={14} />
          </Button>
        )}
      </div>
      <CreateDeckDialog open={createOpen} onOpenChange={setCreateOpen} />
      {selectedDeck && (
        <DeckDetailDialog
          key={selectedDeck.id}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          deck={selectedDeck}
        />
      )}
    </>
  );
}
