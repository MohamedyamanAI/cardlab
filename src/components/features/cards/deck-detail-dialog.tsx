"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  VersionHistoryList,
  type VersionEntry,
} from "@/components/features/versions/version-history-list";
import { useCardsStore } from "@/lib/store/cards-store";
import {
  getDeckVersions,
  createDeckSnapshot,
  restoreDeckVersion,
} from "@/lib/actions/versions";
import { IconTrash } from "@tabler/icons-react";
import type { Deck, DeckVersion, StatusEnum } from "@/lib/types";
import { toast } from "sonner";

interface DeckDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: Deck;
}

export function DeckDetailDialog({
  open,
  onOpenChange,
  deck,
}: DeckDetailDialogProps) {
  const {
    updateDeck,
    deleteDeck,
    updateDeckStatus,
    updateDeckInStore,
    selectDeck,
    cards,
    deckCardQuantities,
  } = useCardsStore();

  // --- Details tab state ---
  // Use deck.name/description directly as initial state; the Dialog re-renders with fresh deck prop
  const [localName, setLocalName] = useState(deck.name);
  const [localDesc, setLocalDesc] = useState(deck.description ?? "");

  const handleNameBlur = () => {
    const trimmed = localName.trim();
    if (trimmed && trimmed !== deck.name) {
      updateDeck(deck.id, { name: trimmed });
    }
  };

  const handleDescBlur = () => {
    const trimmed = localDesc.trim();
    if (trimmed !== (deck.description ?? "")) {
      updateDeck(deck.id, { description: trimmed });
    }
  };

  const handleStatusChange = (value: string) => {
    updateDeckStatus(deck.id, value as StatusEnum);
  };

  const handleDelete = async () => {
    await deleteDeck(deck.id);
    onOpenChange(false);
  };

  // Build card composition table
  const composition = deckCardQuantities
    ? Array.from(deckCardQuantities.entries()).map(([cardId, quantity]) => {
        const card = cards.find((c) => c.id === cardId);
        const name =
          card?.data && typeof card.data === "object"
            ? String(Object.values(card.data as Record<string, unknown>)[0] ?? "")
            : "";
        return { cardId, name: name || cardId.slice(0, 8), quantity };
      })
    : [];

  // --- History tab state ---
  const [versions, setVersions] = useState<DeckVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DeckVersion | null>(
    null
  );
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    const result = await getDeckVersions(deck.id);
    if (result.success) {
      setVersions(result.data);
    } else {
      toast.error(result.error);
    }
    setVersionsLoading(false);
  }, [deck.id]);

  const handleTabChange = (tab: string) => {
    if (tab === "history" && !historyLoaded) {
      setHistoryLoaded(true);
      loadVersions();
    }
  };

  const handleSelectVersion = useCallback(
    (entry: VersionEntry) => {
      const version = versions.find((v) => v.id === entry.id) ?? null;
      setSelectedVersion(version);
    },
    [versions]
  );

  const handleSaveSnapshot = useCallback(
    async (label?: string) => {
      const result = await createDeckSnapshot(deck.id, { label });
      if (result.success) {
        toast.success("Snapshot saved");
        await loadVersions();
      } else {
        toast.error(result.error);
      }
    },
    [deck.id, loadVersions]
  );

  const handleRestore = useCallback(
    async (entry: VersionEntry) => {
      const result = await restoreDeckVersion(deck.id, entry.version_number);
      if (result.success) {
        toast.success(`Restored to v${entry.version_number}`);
        updateDeckInStore(result.data);
        await selectDeck(deck.id);
        await loadVersions();
      } else {
        toast.error(result.error);
      }
    },
    [deck.id, updateDeckInStore, selectDeck, loadVersions]
  );

  const versionEntries: VersionEntry[] = versions.map((v) => ({
    id: v.id,
    version_number: v.version_number,
    reason: v.reason,
    label: v.label,
    created_at: v.created_at,
  }));

  // Selected version's card composition
  const versionCards = selectedVersion?.cards
    ? (selectedVersion.cards as { card_id: string; quantity: number }[])
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{deck.name}</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 py-2">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={localDesc}
                  onChange={(e) => setLocalDesc(e.target.value)}
                  onBlur={handleDescBlur}
                  rows={3}
                  placeholder="Optional description…"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select value={deck.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card composition */}
              {composition.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    Cards ({composition.length})
                  </label>
                  <div className="rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                          <th className="px-3 py-1.5 text-left font-medium">
                            Card
                          </th>
                          <th className="px-3 py-1.5 text-right font-medium">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {composition.map((c) => (
                          <tr
                            key={c.cardId}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="truncate px-3 py-1.5">{c.name}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {c.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Delete */}
              <div className="pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <IconTrash size={14} />
                      Delete deck
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete deck?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &ldquo;{deck.name}&rdquo; and
                        remove all card associations. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <VersionHistoryList
                versions={versionEntries}
                isLoading={versionsLoading}
                selectedVersionId={selectedVersion?.id ?? null}
                onSelectVersion={handleSelectVersion}
                onSaveSnapshot={handleSaveSnapshot}
                onRestore={handleRestore}
              />
              {versionCards && (
                <div className="border-t border-border p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Deck composition (v{selectedVersion?.version_number})
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                          <th className="px-3 py-1.5 text-left font-medium">
                            Card ID
                          </th>
                          <th className="px-3 py-1.5 text-right font-medium">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {versionCards.map((c) => {
                          const card = cards.find((cd) => cd.id === c.card_id);
                          const name =
                            card?.data && typeof card.data === "object"
                              ? String(
                                  Object.values(
                                    card.data as Record<string, unknown>
                                  )[0] ?? ""
                                )
                              : c.card_id.slice(0, 8);
                          return (
                            <tr
                              key={c.card_id}
                              className="border-b border-border/50 last:border-0"
                            >
                              <td className="truncate px-3 py-1.5">{name}</td>
                              <td className="px-3 py-1.5 text-right tabular-nums">
                                {c.quantity}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
