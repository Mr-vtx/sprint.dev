"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const SYNC_EVENT = "vs-storage";

/**
 * localStorage-backed state.
 * - Starts with `initial` so server and first client render match.
 * - Loads the stored value after mount (`hydrated` flips to true).
 * - Stays in sync across components on the same page and across tabs.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) setValue(JSON.parse(stored));
      } catch {}
    };
    read();
    setHydrated(true);

    const onSync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) read();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) read();
    };
    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const next =
        typeof v === "function" ? (v as (p: T) => T)(latest.current) : v;
      latest.current = next;
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: key }));
      } catch {}
    },
    [key],
  );

  return [value, set, hydrated];
}
