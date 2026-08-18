"use client";

import { useSyncExternalStore } from "react";

// Matches Tailwind's `lg` breakpoint, which is also where ProductGrid
// switches from 3 to 4 columns.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
