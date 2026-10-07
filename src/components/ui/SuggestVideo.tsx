"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { parseYouTubeId } from "@/lib/youtube";

const REPO = "https://github.com/Mr-vtx/sprint.dev";

/** Opens a prefilled GitHub issue, so suggestions actually reach the maintainer. */
export default function SuggestVideo({ courseId, lessonId, lessonTitle }: { courseId: string; lessonId: string; lessonTitle: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const id = parseYouTubeId(url);
    if (!id) return setError("Paste a YouTube link or an 11-character video ID.");
    const title = `Video suggestion: ${lessonTitle}`;
    const body = [
      `Course: ${courseId}`,
      `Lesson: ${lessonId} (${lessonTitle})`,
      `Video: https://www.youtube.com/watch?v=${id}`,
      note.trim() && `\nWhy it fits: ${note.trim()}`,
    ].filter(Boolean).join("\n");
    window.open(`${REPO}/issues/new?labels=video&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
    setOpen(false); setUrl(""); setNote(""); setError("");
  };

  if (!open) return <button onClick={() => setOpen(true)} className="btn btn-outline btn-sm">Suggest a video</button>;

  return (
    <div className="card" style={{ padding: 18, display: "grid", gap: 12, maxWidth: 520 }}>
      <p style={{ fontSize: 14, color: "var(--c-ink2)" }}>
        This opens a GitHub issue for <strong style={{ color: "var(--c-ink)", fontWeight: 600 }}>{lessonTitle}</strong>. You need a GitHub account to submit it.
      </p>
      <div>
        <label htmlFor="sv-url" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>YouTube link</label>
        <input id="sv-url" className="search-input" style={{ paddingLeft: 14 }} value={url} onChange={(e) => { setUrl(e.target.value); setError(""); }} placeholder="https://youtube.com/watch?v=…" aria-invalid={!!error} />
        {error && <p style={{ fontSize: 13, color: "var(--c-red)", marginTop: 6 }}>{error}</p>}
      </div>
      <div>
        <label htmlFor="sv-note" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Why it fits (optional)</label>
        <textarea id="sv-note" className="search-input" style={{ paddingLeft: 14, resize: "vertical" }} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} className="btn btn-primary btn-sm">Open GitHub issue <ExternalLink size={13} /></button>
        <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">Cancel</button>
      </div>
    </div>
  );
}
