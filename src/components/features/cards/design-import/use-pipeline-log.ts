import { useCallback, useRef, useState } from "react";

export type StepStatus = "pending" | "running" | "success" | "error" | "skipped";

export interface PipelineStep {
  id: string;
  label: string;
  status: StepStatus;
  startedAt?: number;
  duration?: number;
  message?: string;
  rawData?: unknown;
}

export interface PipelineLog {
  steps: PipelineStep[];
  /** Declare a step upfront so it shows as pending */
  declare: (id: string, label: string) => void;
  /** Mark a step as running */
  start: (id: string) => void;
  /** Mark a step as succeeded, with optional raw data */
  success: (id: string, opts?: { message?: string; rawData?: unknown }) => void;
  /** Mark a step as failed */
  error: (id: string, opts?: { message?: string; rawData?: unknown }) => void;
  /** Mark a step as skipped */
  skip: (id: string, message?: string) => void;
  /** Add or update raw data on an existing step */
  setRawData: (id: string, rawData: unknown) => void;
  /** Reset all steps */
  reset: () => void;
}

export function usePipelineLog(): PipelineLog {
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const startTimesRef = useRef<Map<string, number>>(new Map());

  const updateStep = useCallback(
    (id: string, updates: Partial<PipelineStep>) => {
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        if (idx === -1) {
          // Auto-declare if not found
          return [
            ...prev,
            {
              id,
              label: id,
              status: "pending" as StepStatus,
              ...updates,
            },
          ];
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updates };
        return copy;
      });
    },
    []
  );

  const declare = useCallback(
    (id: string, label: string) => {
      setSteps((prev) => {
        if (prev.some((s) => s.id === id)) return prev;
        return [...prev, { id, label, status: "pending" }];
      });
    },
    []
  );

  const start = useCallback(
    (id: string) => {
      const now = performance.now();
      startTimesRef.current.set(id, now);
      updateStep(id, { status: "running", startedAt: now });
    },
    [updateStep]
  );

  const success = useCallback(
    (id: string, opts?: { message?: string; rawData?: unknown }) => {
      const startTime = startTimesRef.current.get(id);
      const duration = startTime ? performance.now() - startTime : undefined;
      updateStep(id, {
        status: "success",
        duration,
        message: opts?.message,
        rawData: opts?.rawData,
      });
    },
    [updateStep]
  );

  const error = useCallback(
    (id: string, opts?: { message?: string; rawData?: unknown }) => {
      const startTime = startTimesRef.current.get(id);
      const duration = startTime ? performance.now() - startTime : undefined;
      updateStep(id, {
        status: "error",
        duration,
        message: opts?.message,
        rawData: opts?.rawData,
      });
    },
    [updateStep]
  );

  const skip = useCallback(
    (id: string, message?: string) => {
      updateStep(id, { status: "skipped", message });
    },
    [updateStep]
  );

  const setRawData = useCallback(
    (id: string, rawData: unknown) => {
      updateStep(id, { rawData });
    },
    [updateStep]
  );

  const reset = useCallback(() => {
    setSteps([]);
    startTimesRef.current.clear();
  }, []);

  return { steps, declare, start, success, error, skip, setRawData, reset };
}
