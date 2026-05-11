"use client";
import { useState, useEffect } from "react";

export interface StreakData {
  current: number;
  longest: number;
  lastVisit: string | null;    
  activity: Record<string, number>; 
}

const KEY = "vs-streak";
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

function load(): StreakData {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { current: 0, longest: 0, lastVisit: null, activity: {} };
}

function save(d: StreakData) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}

export function useStreak() {
  const [data, setData] = useState<StreakData>({ current: 0, longest: 0, lastVisit: null, activity: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = load();
    const t = today();
    const y = yesterday();

    if (d.lastVisit !== t) {
      if (d.lastVisit === y) {
        d.current += 1;
      } else if (d.lastVisit !== t) {
        d.current = 1; 
      }
      d.longest   = Math.max(d.longest, d.current);
      d.lastVisit = t;
      d.activity[t] = (d.activity[t] ?? 0);
      save(d);
    }
    setData(d);
  }, []);

  const recordLesson = () => {
    setData((prev) => {
      const t = today();
      const next = { ...prev, activity: { ...prev.activity, [t]: (prev.activity[t] ?? 0) + 1 } };
      save(next);
      return next;
    });
  };

  return { data, mounted, recordLesson };
}

export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
