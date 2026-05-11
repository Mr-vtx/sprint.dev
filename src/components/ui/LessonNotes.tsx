"use client";

import { useState, useEffect } from "react";
import { FileText, Save, Trash2 } from "lucide-react";

const NOTES_KEY = (lessonId: string) => `vs-note-${lessonId}`;

export default function LessonNotes({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [text,  setText]  = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try { setText(localStorage.getItem(NOTES_KEY(lessonId)) ?? ""); } catch {}
    setSaved(true);
  }, [lessonId]);

  const save = () => {
    try { localStorage.setItem(NOTES_KEY(lessonId), text); setSaved(true); } catch {}
  };

  const clear = () => {
    if (!text || !confirm("Clear notes for this lesson?")) return;
    localStorage.removeItem(NOTES_KEY(lessonId));
    setText("");
    setSaved(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--c-border)" }}>
        <FileText size={13} style={{ color: "var(--c-blue)" }} />
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lessonTitle}</span>
        {!saved && (
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--c-amber)" }}>unsaved</span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        placeholder={`Notes for this lesson…\n\nMarkdown-friendly: use # headings, - bullets, \`code\`.`}
        style={{ flex: 1, width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--c-ink)", lineHeight: 1.75, minHeight: 200 }}
      />

      <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--c-border)" }}>
        <button
          onClick={save}
          disabled={saved}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, background: saved ? "var(--c-surface2)" : "var(--c-blue)", color: saved ? "var(--c-ink3)" : "#fff", border: "none", borderRadius: "var(--radius-sm)", cursor: saved ? "default" : "pointer", transition: "all 0.12s" }}
        >
          <Save size={11} /> {saved ? "Saved" : "Save notes"}
        </button>
        {text && (
          <button
            onClick={clear}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", background: "none", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
          >
            <Trash2 size={11} />
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", alignSelf: "center" }}>
          {text.length} chars
        </span>
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
