"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDownload } from "@tabler/icons-react";
import type { AnalysisResult, DetectedProperty, DetectedCard } from "@/lib/types/design-import";
import type { PropertyType } from "@/lib/types";

const PROPERTY_TYPES: PropertyType[] = [
  "text",
  "number",
  "image",
  "select",
  "boolean",
  "color",
];

interface ReviewStepProps {
  analysis: AnalysisResult;
  onConfirm: (adjusted: {
    projectName: string;
    properties: DetectedProperty[];
    cards: DetectedCard[];
  }) => void;
  onBack: () => void;
  importing: boolean;
}

export function ReviewStep({
  analysis,
  onConfirm,
  onBack,
  importing,
}: ReviewStepProps) {
  const [projectName, setProjectName] = useState(analysis.projectName);
  const [properties, setProperties] = useState<
    Array<DetectedProperty & { included: boolean }>
  >(analysis.properties.map((p) => ({ ...p, included: true })));
  const [cards, setCards] = useState<
    Array<DetectedCard & { included: boolean }>
  >(analysis.cards.map((c) => ({ ...c, included: true })));

  const updateProperty = (
    index: number,
    updates: Partial<DetectedProperty & { included: boolean }>
  ) => {
    setProperties((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleConfirm = () => {
    const includedProps = properties.filter((p) => p.included);
    const includedCards = cards.filter((c) => c.included);

    // Filter card data to only include included property names
    const propNames = new Set(includedProps.map((p) => p.name));
    const filteredCards = includedCards.map((c) => ({
      pageNumber: c.pageNumber,
      data: Object.fromEntries(
        Object.entries(c.data).filter(([key]) => propNames.has(key))
      ),
    }));

    onConfirm({
      projectName,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      properties: includedProps.map(({ included: _included, ...p }) => p),
      cards: filteredCards,
    });
  };

  const includedPropCount = properties.filter((p) => p.included).length;
  const includedCardCount = cards.filter((c) => c.included).length;

  return (
    <div className="space-y-4">
      {/* Project Name */}
      <div className="space-y-1.5">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      {/* Properties Table */}
      <div>
        <h4 className="mb-2 text-sm font-medium">
          Properties ({includedPropCount}/{properties.length})
        </h4>
        <div className="rounded-lg border max-h-48 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-3 py-2" />
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={prop.included}
                      onCheckedChange={(checked) =>
                        updateProperty(i, { included: !!checked })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={prop.name}
                      onChange={(e) =>
                        updateProperty(i, { name: e.target.value })
                      }
                      className="h-7 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={prop.type}
                      onValueChange={(val) =>
                        updateProperty(i, { type: val as PropertyType })
                      }
                    >
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">
            Cards ({includedCardCount}/{cards.length})
          </h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() =>
                setCards((prev) => prev.map((c) => ({ ...c, included: true })))
              }
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() =>
                setCards((prev) => prev.map((c) => ({ ...c, included: false })))
              }
            >
              None
            </Button>
          </div>
        </div>
        <div className="rounded-lg border max-h-36 overflow-auto">
          <div className="grid grid-cols-2 gap-1 p-2">
            {cards.map((card, i) => (
              <label
                key={i}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={card.included}
                  onCheckedChange={(checked) =>
                    setCards((prev) =>
                      prev.map((c, j) =>
                        j === i ? { ...c, included: !!checked } : c
                      )
                    )
                  }
                />
                <span className="truncate">
                  Page {card.pageNumber}
                  {card.data["Card Name"] || card.data["Name"]
                    ? ` — ${card.data["Card Name"] ?? card.data["Name"]}`
                    : ""}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        Will create: 1 project, {includedPropCount} properties, 1 layout,{" "}
        {includedCardCount} cards
        {analysis.artworkBounds
          ? `, ${includedCardCount} artwork images`
          : ""}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={importing}>
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={
            importing ||
            !projectName.trim() ||
            includedPropCount === 0 ||
            includedCardCount === 0
          }
        >
          {importing ? (
            <>
              <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Importing...
            </>
          ) : (
            <>
              <IconDownload size={14} className="mr-1.5" />
              Import
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
