"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import type { Lesson } from "@/lib/data";

interface Props {
  lessons: Lesson[];
  activeId: string;
  done: string[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  maxHeight?: string;
}

/** The lesson list as a route: a node per lesson, filled when complete. */
export default function LessonOutline({ lessons, activeId, done, onSelect, onToggle, maxHeight }: Props) {
  const box = useRef<HTMLDivElement>(null);

  // Keep the active lesson visible inside the list without scrolling the page.
  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-lesson="${activeId}"]`);
    const parent = box.current;
    if (!el || !parent) return;
    const top = el.offsetTop - parent.offsetTop;
    if (top < parent.scrollTop || top + el.offsetHeight > parent.scrollTop + parent.clientHeight) {
      parent.scrollTop = Math.max(0, top - parent.clientHeight / 3);
    }
  }, [activeId]);

  return (
    <div ref={box} style={{ maxHeight, overflowY: maxHeight ? "auto" : undefined, padding: "4px 4px 4px 0" }}>
      <ol className="route" style={{ listStyle: "none", display: "grid", gap: 2 }}>
        {lessons.map((l, i) => {
          const isDone = done.includes(l.id);
          const isActive = l.id === activeId;
          const hasVideo = Boolean(l.youtubeId || l.videoUrl);
          return (
            <li key={l.id} data-lesson={l.id} className="route-row">
              <button
                className="node"
                aria-pressed={isDone}
                aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${l.title}`}
                onClick={() => onToggle(l.id)}
                style={{ top: 11 }}
              >
                <Check strokeWidth={4} />
              </button>
              <button
                onClick={() => onSelect(l.id)}
                aria-current={isActive ? "true" : undefined}
                className="hover:bg-[var(--c-surface2)]"
                style={{
                  width: "100%", textAlign: "left", background: isActive ? "var(--c-blue-dim)" : "transparent",
                  border: "none", borderRadius: "var(--radius-sm)", padding: "8px 10px", cursor: "pointer", color: "inherit",
                  display: "grid", gap: 2,
                }}
              >
                <span style={{ fontSize: 14.5, fontWeight: isActive ? 600 : 500, lineHeight: 1.35, color: isActive ? "var(--c-blue)" : isDone ? "var(--c-ink3)" : "var(--c-ink)" }}>
                  {i + 1}. {l.title}
                </span>
                <span className="label">{hasVideo ? l.duration : "No video yet"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
