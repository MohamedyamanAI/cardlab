"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconX,
  IconLoader2,
  IconCircleDashed,
  IconChevronDown,
  IconMinus,
  IconCopy,
} from "@tabler/icons-react";
import type { PipelineStep, StepStatus } from "./use-pipeline-log";

interface PipelinePanelProps {
  steps: PipelineStep[];
}

const STATUS_ICON: Record<StepStatus, React.ReactNode> = {
  pending: <IconCircleDashed size={14} className="text-muted-foreground" />,
  running: <IconLoader2 size={14} className="text-primary animate-spin" />,
  success: <IconCheck size={14} className="text-green-500" />,
  error: <IconX size={14} className="text-destructive" />,
  skipped: <IconMinus size={14} className="text-muted-foreground" />,
};

function formatDuration(ms?: number): string {
  if (ms == null) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function buildCopyText(steps: PipelineStep[]): string {
  const totalDuration = steps.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const failed = steps.filter((s) => s.status === "error").length;

  const lines: string[] = [
    "=== Design Import Pipeline ===",
    `Timestamp: ${new Date().toISOString()}`,
    `User Agent: ${navigator.userAgent}`,
    `Steps: ${steps.length} total, ${failed} failed, ${formatDuration(totalDuration)} elapsed`,
    "",
  ];

  for (const step of steps) {
    const statusLabel = step.status.toUpperCase().padEnd(7);
    const duration = step.duration ? ` (${formatDuration(step.duration)})` : "";
    const msg = step.message ? ` — ${step.message}` : "";
    lines.push(`[${statusLabel}] ${step.label}${duration}${msg}`);

    if (step.rawData != null) {
      const json =
        typeof step.rawData === "string"
          ? step.rawData
          : JSON.stringify(step.rawData, null, 2);
      for (const line of json.split("\n")) {
        lines.push(`    ${line}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function StepRow({ step }: { step: PipelineStep }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = step.rawData != null || step.message;

  return (
    <div
      className={cn(
        "border-b last:border-0",
        step.status === "error" && "bg-destructive/5"
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs",
          hasDetails && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => hasDetails && setExpanded(!expanded)}
        disabled={!hasDetails}
      >
        {STATUS_ICON[step.status]}
        <span
          className={cn(
            "flex-1 truncate",
            step.status === "pending" && "text-muted-foreground"
          )}
        >
          {step.label}
        </span>
        {step.message && step.status !== "error" && (
          <span className="text-muted-foreground truncate max-w-[40%]">
            {step.message}
          </span>
        )}
        {step.status === "error" && step.message && (
          <span className="text-destructive truncate max-w-[40%]">
            {step.message}
          </span>
        )}
        {step.duration != null && (
          <span className="text-muted-foreground tabular-nums shrink-0">
            {formatDuration(step.duration)}
          </span>
        )}
        {hasDetails && (
          <IconChevronDown
            size={12}
            className={cn(
              "text-muted-foreground transition-transform shrink-0",
              expanded && "rotate-180"
            )}
          />
        )}
      </button>
      {expanded && step.rawData != null && (
        <div className="border-t bg-muted/30 px-3 py-2">
          <pre className="max-h-48 overflow-auto text-[10px] leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap break-all">
            {typeof step.rawData === "string"
              ? step.rawData
              : JSON.stringify(step.rawData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function PipelinePanel({ steps }: PipelinePanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = buildCopyText(steps);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [steps]);

  if (steps.length === 0) return null;

  const completedCount = steps.filter(
    (s) => s.status === "success" || s.status === "skipped"
  ).length;
  const hasError = steps.some((s) => s.status === "error");
  const isRunning = steps.some((s) => s.status === "running");

  return (
    <div className="mt-4 rounded-lg border overflow-hidden">
      <div className="flex items-center">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
          onClick={() => setOpen(!open)}
        >
          {isRunning ? (
            <IconLoader2 size={14} className="text-primary animate-spin" />
          ) : hasError ? (
            <IconX size={14} className="text-destructive" />
          ) : (
            <IconCheck size={14} className="text-green-500" />
          )}
          <span className="font-medium">Pipeline Details</span>
          <span className="text-muted-foreground text-xs">
            {completedCount}/{steps.length} steps
          </span>
          <IconChevronDown
            size={14}
            className={cn(
              "ml-auto text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="mr-1 h-7 px-2 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <IconCheck size={12} className="mr-1" />
          ) : (
            <IconCopy size={12} className="mr-1" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {open && (
        <div className="border-t max-h-64 overflow-auto">
          {steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}
