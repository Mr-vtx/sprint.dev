"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Map, ArrowRight, X } from "lucide-react";
import { courses, roadmaps } from "@/lib/data";

interface Result {
  type: "course" | "roadmap" | "lesson";
  title: string;
  subtitle: string;
  href: string;
  tag?: string;
}

function buildIndex(): Result[] {
  const out: Result[] = [];
  courses.forEach((c) => {
    out.push({ type: "course", title: c.title, subtitle: `${c.level} · ${c.duration}`, href: `/courses/${c.id}`, tag: c.color });
    c.lessons.forEach((l) => {
      out.push({ type: "lesson", title: l.title, subtitle: c.title, href: `/courses/${c.id}?lesson=${l.id}`, tag: c.color });
    });
  });
  roadmaps.forEach((r) => {
    out.push({ type: "roadmap", title: r.title, subtitle: r.tagline, href: `/roadmaps/${r.id}` });
  });
  return out;
}

const INDEX = buildIndex();

export default function CommandPalette() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [cursor,  setCursor]  = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const results: Result[] = query.length < 1
    ? INDEX.slice(0, 8)
    : INDEX.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const close = useCallback(() => { setOpen(false); setQuery(""); setCursor(0); }, []);

  const go = useCallback((r: Result) => {
    router.push(r.href);
    close();
  }, [router, close]);

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && results[cursor]) go(results[cursor]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, cursor, results, go]);

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => { setCursor(0); }, [query]);

  const icon = (type: string) => {
    if (type === "course")  return <BookOpen size={13} style={{ color: "var(--c-blue)" }} />;
    if (type === "roadmap") return <Map      size={13} style={{ color: "var(--c-green)" }} />;
    return <ArrowRight size={11} style={{ color: "var(--c-ink3)" }} />;
  };

  if (!open) return null;

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "14vh" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.28)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--c-border)" }}>
          <Search size={16} style={{ color: "var(--c-ink3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, roadmaps, lessons…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, fontFamily: "var(--font-body)", color: "var(--c-ink)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-ink3)", display: "flex", padding: 2 }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: 4, background: "var(--c-surface2)", border: "1px solid var(--c-border)", color: "var(--c-ink3)" }}>esc</kbd>
        </div>

        <div ref={listRef} style={{ maxHeight: 380, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>No results for &quot;{query}&quot;</p>
            </div>
          ) : results.map((r, i) => (
            <div
              key={r.href + i}
              onClick={() => go(r)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: cursor === i ? "var(--c-surface)" : "transparent", borderBottom: "1px solid var(--c-border)", transition: "background 0.08s" }}
              onMouseEnter={() => setCursor(i)}
            >
              <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: "var(--c-surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon(r.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subtitle}</p>
              </div>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", background: "var(--c-surface2)", padding: "2px 7px", borderRadius: 3, flexShrink: 0 }}>{r.type}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 16 }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([k, v]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
              <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--c-surface2)", border: "1px solid var(--c-border)" }}>{k}</kbd> {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
