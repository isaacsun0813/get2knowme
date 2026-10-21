"use client";

import { useSyncExternalStore } from "react";

function subscribe(changed: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", changed);
  return () => preference.removeEventListener("change", changed);
}

function snapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
