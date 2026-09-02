"use client";

import { useCallback, useSyncExternalStore } from "react";
import { emptyDraft, type LaunchDraft } from "./launch-plan";
import { feeBounds, maxCreatorShareBps } from "./economics";

/**
 * The launch draft, kept in this browser and nowhere else.
 *
 * There is no factory to write it to, and there is no backend on this site at
 * all, so a draft that survives a reload is the honest version of "we saved
 * your work": it never leaves the tab, and the console says so.
 *
 * Reads go through useSyncExternalStore rather than an effect, both because
 * the React Compiler lint rules Next 16 ships reject setState-in-effect and
 * because it keeps the server render and the hydration render agreed on the
 * same value (the empty draft) — a stored draft appearing during hydration
 * would be a mismatch.
 *
 * getSnapshot has to return a stable reference between reads or React loops,
 * hence the cached object rather than a fresh parse each call.
 */
const KEY = "paypad.draft.v1";

let cached: LaunchDraft = emptyDraft;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(value: unknown): LaunchDraft {
  if (typeof value !== "object" || value === null) return emptyDraft;
  const raw = value as Record<string, unknown>;
  const str = (key: keyof LaunchDraft) =>
    typeof raw[key] === "string" ? (raw[key] as string) : "";
  const num = (key: keyof LaunchDraft, fallback: number, max: number) => {
    const parsed = raw[key];
    return typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0 && parsed <= max
      ? parsed
      : fallback;
  };

  return {
    name: str("name").slice(0, 64),
    symbol: str("symbol").slice(0, 16),
    supply: str("supply").slice(0, 32),
    payoutAddress: str("payoutAddress").slice(0, 64),
    tradeFeeBps: num("tradeFeeBps", feeBounds.defaultTradeFeeBps, 10_000),
    creatorShareBps: num("creatorShareBps", emptyDraft.creatorShareBps, maxCreatorShareBps),
    treasury: str("treasury").slice(0, 64),
  };
}

function readStorage(): LaunchDraft {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw)) : emptyDraft;
  } catch {
    // Private mode, blocked storage, malformed JSON: not an error here.
    return emptyDraft;
  }
}

function getSnapshot(): LaunchDraft {
  if (!loaded) {
    cached = readStorage();
    loaded = true;
  }
  return cached;
}

function onStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== KEY) return;
  cached = readStorage();
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorageEvent);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorageEvent);
    }
  };
}

function commit(next: LaunchDraft) {
  cached = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Editing still works for this session if storage is unavailable.
  }
  for (const listener of listeners) listener();
}

export function useDraft() {
  const draft = useSyncExternalStore(subscribe, getSnapshot, () => emptyDraft);

  const update = useCallback((patch: Partial<LaunchDraft>) => {
    commit({ ...getSnapshot(), ...patch });
  }, []);

  const reset = useCallback(() => {
    commit(emptyDraft);
  }, []);

  return { draft, update, reset };
}
