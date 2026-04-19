"use client";

import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type UseDebouncedAutosaveOptions<T> = {
  value: T;
  enabled: boolean;
  isDirty: boolean;
  delayMs?: number;
  resetKey?: string;
  onSave: (value: T) => Promise<void>;
  onSaved?: () => void;
  onError?: (error: unknown) => void;
};

const serialize = <T,>(value: T) => JSON.stringify(value);

export function useDebouncedAutosave<T>({
  value,
  enabled,
  isDirty,
  delayMs = 900,
  resetKey,
  onSave,
  onSaved,
  onError,
}: UseDebouncedAutosaveOptions<T>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);
  const lastPersistedRef = useRef<string>("");
  const [status, setStatus] = useState<AutoSaveStatus>("idle");

  const markPersisted = (nextValue: T) => {
    lastPersistedRef.current = serialize(nextValue);
    setStatus("saved");
  };

  useEffect(() => {
    isInitializedRef.current = false;
    lastPersistedRef.current = "";
    setStatus("idle");
  }, [resetKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const serializedValue = serialize(value);
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      lastPersistedRef.current = serializedValue;
      return;
    }

    if (!isDirty || serializedValue === lastPersistedRef.current) {
      return;
    }

    setStatus("pending");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSave(value);
        lastPersistedRef.current = serialize(value);
        setStatus("saved");
        onSaved?.();
      } catch (error) {
        setStatus("error");
        onError?.(error);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delayMs, enabled, isDirty, onError, onSave, onSaved, value]);

  return {
    status,
    markPersisted,
  };
}
