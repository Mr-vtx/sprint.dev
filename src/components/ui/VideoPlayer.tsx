"use client";

import { useState } from "react";
import { Play, Download, Trash2, Check, AlertCircle, WifiOff, Video } from "lucide-react";
import { useVideoCache } from "@/hooks/useVideoCache";

function fmtBytes(b: number) {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

const FRAME: React.CSSProperties = {
  position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#05080c", overflow: "hidden",
};
const FILL: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" };

function Message({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ ...FRAME, background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
      <div style={{ ...FILL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center" }}>
        <span style={{ color: "var(--c-ink3)" }}>{icon}</span>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{title}</p>
        <p style={{ fontSize: 14, color: "var(--c-ink2)", maxWidth: 360 }}>{body}</p>
      </div>
    </div>
  );
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [active, setActive] = useState(false);
  const [thumb, setThumb] = useState("maxresdefault");

  if (active) {
    return (
      <div style={FRAME}>
        <iframe
          style={FILL}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      aria-label={`Play: ${title}`}
      style={{ ...FRAME, display: "block", border: "none", cursor: "pointer", padding: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/${thumb}.jpg`}
        alt=""
        onError={() => thumb !== "hqdefault" && setThumb("hqdefault")}
        style={{ ...FILL, objectFit: "cover", opacity: 0.8 }}
      />
      <span style={{ ...FILL, display: "grid", placeItems: "center" }}>
        <span style={{ width: 68, height: 68, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 6px 28px rgba(0,0,0,0.45)" }}>
          <Play size={24} style={{ fill: "#0e1620", color: "#0e1620", marginLeft: 4 }} />
        </span>
      </span>
    </button>
  );
}

function OfflineControls({ videoUrl }: { videoUrl: string }) {
  const { status, progress, sizeBytes, download, removeCache } = useVideoCache(videoUrl);
  if (status === "checking") return null;

  const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 14 };

  if (status === "cached")
    return (
      <div style={{ ...row, color: "var(--c-green)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <Check size={15} /> Saved for offline{sizeBytes ? ` (${fmtBytes(sizeBytes)})` : ""}
        </span>
        <button onClick={removeCache} className="btn btn-ghost btn-sm"><Trash2 size={13} /> Remove</button>
      </div>
    );

  if (status === "downloading")
    return (
      <div style={{ ...row, width: "100%" }}>
        <div className="progress-track" style={{ flex: 1, minWidth: 120 }}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <span className="label">{progress}%</span>
      </div>
    );

  if (status === "error")
    return (
      <div style={{ ...row, color: "var(--c-red)" }}>
        <AlertCircle size={15} /> Download failed.
        <button onClick={download} className="btn btn-outline btn-sm">Try again</button>
      </div>
    );

  return <button onClick={download} className="btn btn-outline btn-sm"><Download size={14} /> Save for offline</button>;
}

export default function VideoPlayer({ youtubeId, videoUrl, title }: { youtubeId?: string; videoUrl?: string; title: string }) {
  const cache = useVideoCache(videoUrl);

  if (videoUrl) {
    if (cache.isOffline && !cache.blobUrl)
      return <Message icon={<WifiOff size={28} />} title="You're offline" body="This video wasn't saved to your device. Reconnect and tap Save for offline." />;
    return <video key={videoUrl} src={cache.blobUrl ?? videoUrl} title={title} controls playsInline preload="metadata" style={{ ...FRAME, display: "block" }} />;
  }

  if (youtubeId) {
    if (cache.isOffline)
      return <Message icon={<WifiOff size={28} />} title="You're offline" body="YouTube lessons need a connection. Notes and progress still work." />;
    return <YouTubeEmbed key={youtubeId} videoId={youtubeId} title={title} />;
  }

  return <Message icon={<Video size={28} />} title="No video for this lesson yet" body="Read ahead in Resources, or suggest a video below." />;
}

export { OfflineControls };
