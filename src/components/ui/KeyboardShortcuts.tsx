"use client";

import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}


export function useKeyboardShortcuts(shortcuts: ShortcutMap, deps: unknown[] = []) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const key = [
        e.ctrlKey  && "ctrl",
        e.metaKey  && "meta",
        e.shiftKey && "shift",
        e.altKey   && "alt",
        e.key.toLowerCase(),
      ].filter(Boolean).join("+");

      shortcuts[key]?.();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, deps);
}

export function Kbd({ keys }: { keys: string }) {
  return (
    <kbd style={{
      fontSize: 10, fontFamily: "var(--font-mono)", padding: "1px 5px",
      borderRadius: 3, background: "var(--c-surface2)", border: "1px solid var(--c-border)",
      color: "var(--c-ink3)", letterSpacing: "0.02em",
    }}>
      {keys}
    </kbd>
  );
}

export function ShortcutsPanel({ shortcuts }: { shortcuts: { key: string; desc: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
      {shortcuts.map(({ key, desc }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>{desc}</span>
          <Kbd keys={key} />
        </div>
      ))}
    </div>
  );
}
