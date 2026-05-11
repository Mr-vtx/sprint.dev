"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Image from "next/image";

export default function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "#000" }}>
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
    <div onClick={() => setPlaying(true)}
      style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "#111", cursor: "pointer" }}
      className="group">
      <Image
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        fill
        style={{ objectFit: "cover", opacity: 0.75, transition: "opacity 0.2s" }}
        className="group-hover:opacity-90"
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.15s, background 0.15s",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }} className="group-hover:scale-110">
          <Play size={20} style={{ fill: "#1c1917", color: "#1c1917", marginLeft: 3 }} />
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "32px 14px 12px",
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
      }}>
        <p style={{ color: "white", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }} className="line-clamp-1">{title}</p>
      </div>
    </div>
  );
}
