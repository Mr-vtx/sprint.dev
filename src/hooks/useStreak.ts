"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface StreakData {
  current: number;
  longest: number;
  /** completions per local calendar day, keyed YYYY-MM-DD */
  activity: Record<string, number>;
}

const KEY = "vs-streak";

/** Local calendar day, so a lesson finished at 11pm counts for that day. */
export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
}

export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => dayKey(daysAgo(n - 1 - i)));
}

/** A streak is consecutive days with at least one completion. It stays alive until the end of the next day. */
export function computeStreak(activity: Record<string, number>): Pick<StreakData, "current" | "longest"> {
  const active = (k: string) => (activity[k] ?? 0) > 0;

  let current = 0;
  let i = active(dayKey(daysAgo(0))) ? 0 : 1;
  while (active(dayKey(daysAgo(i)))) { current++; i++; }

  let longest = 0;
  let run = 0;
  const days = Object.keys(activity).filter(active).sort();
  days.forEach((k, idx) => {
    const [y, m, d] = k.split("-").map(Number);
    const prev = idx > 0 ? days[idx - 1].split("-").map(Number) : null;
    const gap = prev ? Math.round((new Date(y, m - 1, d).getTime() - new Date(prev[0], prev[1] - 1, prev[2]).getTime()) / 864e5) : 0;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });

  return { current, longest: Math.max(longest, current) };
}

type Stored = { activity?: Record<string, number> };

export function useStreak() {
  const [raw, setRaw, mounted] = useLocalStorage<Stored>(KEY, {});
  const activity = raw.activity ?? {};

  const data: StreakData = useMemo(() => ({ ...computeStreak(activity), activity }), [activity]);

  const bump = useCallback(
    (delta: 1 | -1) =>
      setRaw((prev) => {
        const t = dayKey();
        const a = { ...(prev.activity ?? {}) };
        a[t] = Math.max(0, (a[t] ?? 0) + delta);
        return { activity: a };
      }),
    [setRaw],
  );

  return {
    data,
    mounted,
    /** Call when the learner completes a lesson or topic. */
    recordLesson: useCallback(() => bump(1), [bump]),
    /** Call when they un-complete one, so toggling can't inflate the count. */
    undoLesson: useCallback(() => bump(-1), [bump]),
  };
}
