"use client";

import { useState } from "react";
import { Youtube, Send, X, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { submitSuggestion, parseYouTubeId } from "@/lib/courseStore";

interface Props {
  courseId:   string;
  lessonId:   string;
  lessonTitle: string;
}

export default function SuggestVideo({ courseId, lessonId, lessonTitle }: Props) {
  const [open,    setOpen]    = useState(false);
  const [url,     setUrl]     = useState("");
  const [note,    setNote]    = useState("");
  const [status,  setStatus]  = useState<"idle" | "success" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  const submit = () => {
    const youtubeId = parseYouTubeId(url);
    if (!youtubeId) {
      setErrMsg("Paste a valid YouTube URL or video ID.");
      setStatus("error");
      return;
    }

    submitSuggestion({
      courseId,
      lessonId,
      lessonTitle,
      youtubeUrl: url.trim(),
      youtubeId,
      note: note.trim(),
    });

    setStatus("success");
    setTimeout(() => {
      setOpen(false);
      setUrl("");
      setNote("");
      setStatus("idle");
      setErrMsg("");
    }, 2400);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)",
          background: "none", border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-sm)", padding: "5px 11px", cursor: "pointer",
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--c-blue)";
          (e.currentTarget as HTMLElement).style.color = "var(--c-blue)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
          (e.currentTarget as HTMLElement).style.color = "var(--c-ink3)";
        }}
      >
        <Youtube size={12} /> Suggest a video
      </button>
    );
  }

  return (
    <div style={{
      border: "1px solid var(--c-border)", borderRadius: "var(--radius-md)",
      background: "var(--c-surface)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--c-border)" }}>
        <Youtube size={13} style={{ color: "var(--c-blue)" }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--c-ink)" }}>
          Suggest a YouTube video
        </span>
        <button onClick={() => { setOpen(false); setStatus("idle"); setUrl(""); setNote(""); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-ink3)", display: "flex", padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {status === "success" ? (
        <div style={{ padding: "28px 16px", textAlign: "center" }}>
          <CheckCircle size={28} style={{ color: "var(--c-green)", margin: "0 auto 10px" }} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--c-ink)", marginBottom: 4 }}>
            Suggestion submitted!
          </p>
          <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
            The admin will review it. Thanks!
          </p>
        </div>
      ) : (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", marginBottom: 12, lineHeight: 1.6 }}>
            For: <strong style={{ color: "var(--c-ink2)" }}>{lessonTitle}</strong>
          </p>

          {/* YouTube URL */}
          <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
            YouTube URL or video ID *
          </label>
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setStatus("idle"); setErrMsg(""); }}
            placeholder="https://youtube.com/watch?v=... or dQw4w9WgXcQ"
            style={{
              width: "100%", padding: "8px 10px", fontSize: 12.5, fontFamily: "var(--font-mono)",
              background: "var(--c-bg)", border: `1px solid ${status === "error" ? "var(--c-red)" : "var(--c-border)"}`,
              borderRadius: "var(--radius-sm)", color: "var(--c-ink)", outline: "none",
              boxSizing: "border-box", marginBottom: 4,
              transition: "border-color 0.12s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = status === "error" ? "var(--c-red)" : "var(--c-border)")}
          />
          {errMsg && (
            <p style={{ fontSize: 11, color: "var(--c-red)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{errMsg}</p>
          )}

          {/* Note */}
          <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5, marginTop: 10 }}>
            Why does this fit? (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. covers the same topic but explains it from a different angle..."
            rows={2}
            style={{
              width: "100%", padding: "8px 10px", fontSize: 12.5, fontFamily: "var(--font-mono)",
              background: "var(--c-bg)", border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-sm)", color: "var(--c-ink)", outline: "none",
              resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
              transition: "border-color 0.12s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
          />

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={() => setOpen(false)}
              style={{ padding: "7px 14px", fontSize: 12, fontFamily: "var(--font-mono)", background: "none", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--c-ink2)" }}>
              Cancel
            </button>
            <button onClick={submit} disabled={!url.trim()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600,
                background: url.trim() ? "var(--c-blue)" : "var(--c-surface2)",
                color: url.trim() ? "#fff" : "var(--c-ink3)",
                border: "none", borderRadius: "var(--radius-sm)", cursor: url.trim() ? "pointer" : "not-allowed",
                transition: "all 0.12s",
              }}>
              <Send size={11} /> Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
