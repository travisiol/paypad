"use client";

import { useSyncExternalStore } from "react";

/**
 * A one-second clock as an external store.
 *
 * Reading `Date.now()` during render is rejected by the React Compiler lint
 * rules Next 16 ships, and so is setState inside an effect — so the ticking
 * value lives outside React and is cached between reads, which is also what
 * useSyncExternalStore requires of getSnapshot.
 */
let seconds = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function emit() {
  const next = Math.floor(Date.now() / 1000);
  if (next === seconds) return;
  seconds = next;
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (timer === undefined) {
    emit();
    timer = setInterval(emit, 1000);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Unix seconds, or 0 before the first tick (server render included). */
export function useNowSeconds() {
  return useSyncExternalStore(
    subscribe,
    () => seconds,
    () => 0,
  );
}
