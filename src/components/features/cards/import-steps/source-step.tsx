"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { IconUpload, IconClipboard } from "@tabler/icons-react";
import { parseCSV, parseJSON, parsePaste } from "@/lib/utils/import-parser";
import type { ParsedImportData } from "@/lib/types/import";

interface SourceStepProps {
  onDataParsed: (data: ParsedImportData) => void;
}

export function ImportSourceStep({ onDataParsed }: SourceStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const isJson = file.name.endsWith(".json");
          const parsed = isJson ? parseJSON(text) : parseCSV(text);
          parsed.fileName = file.name;
          onDataParsed(parsed);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to parse file"
          );
        }
      };
      reader.readAsText(file);
    },
    [onDataParsed]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (files[0]) processFile(files[0]);
    },
    [processFile]
  );

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    setError(null);
    try {
      const parsed = parsePaste(pasteText);
      onDataParsed(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse data");
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="file">
        <TabsList>
          <TabsTrigger value="file">
            <IconUpload size={14} className="mr-1.5" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="paste">
            <IconClipboard size={14} className="mr-1.5" />
            Paste Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <FileUpload
            onChange={handleFileUpload}
            accept={{
              "text/csv": [".csv"],
              "application/json": [".json"],
            }}
            title="Upload file"
            subtitle="Drag & drop a CSV or JSON file, or click to browse"
          />
        </TabsContent>

        <TabsContent value="paste" className="mt-4 space-y-3">
          <Textarea
            placeholder="Paste tab-separated data from Excel or Google Sheets..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
          <Button onClick={handlePaste} disabled={!pasteText.trim()}>
            Parse Data
          </Button>
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
