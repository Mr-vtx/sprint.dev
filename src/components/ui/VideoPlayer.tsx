"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Play, Pause, Volume2, VolumeX, Maximize2,
  Download, Trash2, CheckCircle, AlertCircle,
  WifiOff, Loader2,
} from "lucide-react";
import { useVideoCache } from "@/hooks/useVideoCache";

function fmtBytes(b: number) {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <iframe
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setActive(true)}
      className="group"
      style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: "var(--radius-md)", overflow: "hidden", cursor: "pointer" }}
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title} fill
        style={{ objectFit: "cover", opacity: 0.75, transition: "opacity 0.2s" }}
        className="group-hover:opacity-90"
        unoptimized
      />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className="group-hover:scale-110"
          style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.96)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        >
          <Play size={20} style={{ fill: "#0a0a12", color: "#0a0a12", marginLeft: 3 }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "48px 16px 14px", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
        <p className="line-clamp-1" style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{title}</p>
      </div>
    </div>
  );
}

function NativePlayer({ src, title }: { src: string; title: string }) {
  const ref    = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);
  const [ready,   setReady]   = useState(false);

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", background: "#000" }}>
      {!ready && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, background: "#0a0a12" }}>
          <Loader2 size={22} style={{ color: "#4c4c62" }} className="animate-spin" />
        </div>
      )}
      <video
        ref={ref}
        src={src}
        title={title}
        onClick={togglePlay}
        onCanPlay={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: "100%", display: ready ? "block" : "none", maxHeight: 380, cursor: "pointer" }}
      />
      {ready && (
        <div style={{ background: "#0d0d18", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}>
          <button onClick={togglePlay} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", padding: 0 }}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={toggleMute} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 0 }}>
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={() => ref.current?.requestFullscreen()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 0 }}>
            <Maximize2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function OfflineStrip({ videoUrl }: { videoUrl: string }) {
  const { status, progress, sizeBytes, download, removeCache } = useVideoCache(videoUrl);

  if (status === "checking") return null;

  if (status === "cached") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-green)", fontWeight: 600 }}>
          <CheckCircle size={12} />
          saved offline{sizeBytes ? ` · ${fmtBytes(sizeBytes)}` : ""}
        </span>
        <button
          onClick={removeCache}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <Trash2 size={10} /> remove
        </button>
      </div>
    );
  }

  if (status === "downloading") {
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 3, background: "var(--c-surface2)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--c-blue)", borderRadius: 99, transition: "width 0.25s" }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", whiteSpace: "nowrap" }}>
            {progress}%
          </span>
        </div>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
          downloading to device storage…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <AlertCircle size={12} style={{ color: "var(--c-red)" }} />
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-red)" }}>Download failed</span>
        <button onClick={download} style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-blue)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
          retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={download}
      style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--c-ink2)", background: "none", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", cursor: "pointer", transition: "border-color 0.12s, color 0.12s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-blue)"; (e.currentTarget as HTMLElement).style.color = "var(--c-blue)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; (e.currentTarget as HTMLElement).style.color = "var(--c-ink2)"; }}
    >
      <Download size={13} /> Save for offline
    </button>
  );
}

function OfflineUnavailable() {
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
        <WifiOff size={28} style={{ color: "var(--c-ink3)" }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--c-ink)", marginBottom: 4 }}>
            No internet connection
          </p>
          <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", lineHeight: 1.7 }}>
            This video wasn&apos;t saved offline.<br />
            Come back online and tap <strong style={{ color: "var(--c-ink2)" }}>Save for offline</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VideoPlayer({
  youtubeId,
  videoUrl,
  title,
}: {
  youtubeId?: string;
  videoUrl?: string;
  title: string;
}) {
  const cache = useVideoCache(videoUrl);

  if (videoUrl) {
    if (cache.isOffline && !cache.blobUrl) return <OfflineUnavailable />;
    return (
      <>
        <NativePlayer src={cache.blobUrl ?? videoUrl} title={title} />
        <OfflineStrip videoUrl={videoUrl} />
      </>
    );
  }

  if (youtubeId) {
    if (cache.isOffline) return <OfflineUnavailable />;
    return (
      <>
        <YouTubeEmbed videoId={youtubeId} title={title} />
        <p style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
          youtube · offline save not available for embedded videos
        </p>
      </>
    );
  }

  return (
    <div style={{ paddingTop: "56.25%", position: "relative", background: "var(--c-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--c-border)" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>No video source</p>
      </div>
    </div>
  );
}
