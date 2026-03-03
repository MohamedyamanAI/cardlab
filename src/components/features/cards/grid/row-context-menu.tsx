"use client";

import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { IconHistory } from "@tabler/icons-react";
import type { Card } from "@/lib/types";

interface RowContextMenuProps {
  card: Card;
  onViewHistory: (card: Card) => void;
  children: ReactNode;
}

export function RowContextMenu({
  card,
  onViewHistory,
  children,
}: RowContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onViewHistory(card)}>
          <IconHistory size={14} className="mr-2" />
          Version history
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
