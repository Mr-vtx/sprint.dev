"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

const NOTES_KEY = (lessonId: string) => `vs-note-${lessonId}`;

/** Notes autosave to this device half a second after you stop typing. */
export default function LessonNotes({ lessonId }: { lessonId: string; lessonTitle?: string }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"saved" | "saving">("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ id: string; value: string } | null>(null);

  const write = (id: string, value: string) => {
    try {
      if (value) localStorage.setItem(NOTES_KEY(id), value);
      else localStorage.removeItem(NOTES_KEY(id));
    } catch {}
    setState("saved");
  };

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    if (pending.current) write(pending.current.id, pending.current.value);
    pending.current = null;
  };

  // Load this lesson's note; save any unsaved text from the previous lesson first.
  useEffect(() => {
    try { setText(localStorage.getItem(NOTES_KEY(lessonId)) ?? ""); } catch { setText(""); }
    setState("saved");
    return flush;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const onChange = (value: string) => {
    setText(value);
    setState("saving");
    pending.current = { id: lessonId, value };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  };

  const clear = () => {
    if (!text || !confirm("Delete the notes for this lesson?")) return;
    pending.current = null;
    if (timer.current) clearTimeout(timer.current);
    setText("");
    write(lessonId, "");
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <label htmlFor="lesson-notes" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Notes for this lesson</label>
      <textarea
        id="lesson-notes"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write what you want to remember. Notes stay on this device."
        style={{ width: "100%", minHeight: 240, padding: "16px 18px", background: "transparent", border: "none", outline: "none", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--c-ink)", lineHeight: 1.7 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 18px", borderTop: "1px solid var(--c-border)" }}>
        <span className="label" aria-live="polite">{state === "saving" ? "Saving…" : text ? "Saved on this device" : "Nothing written yet"}</span>
        {text && <button onClick={clear} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}><Trash2 size={13} /> Delete</button>}
      </div>
    </div>
  );
}

export function countNotes(lessonIds: string[]): number {
  try {
    return lessonIds.filter((id) => {
      const v = localStorage.getItem(NOTES_KEY(id));
      return v && v.trim().length > 0;
    }).length;
  } catch { return 0; }
}
