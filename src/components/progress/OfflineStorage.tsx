"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getAllCached, removeCached, clearAllCached, type CachedEntry } from "@/hooks/useVideoCache";
import { courses } from "@/lib/data";

function fmtBytes(b: number) {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

export default function OfflineStorage() {
  const [items, setItems] = useState<CachedEntry[] | null>(null);
  const [online, setOnline] = useState(true);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllCached().then(setItems);
    const map: Record<string, string> = {};
    courses.forEach((c) => c.lessons.forEach((l) => l.videoUrl && (map[l.videoUrl] = `${c.title}: ${l.title}`)));
    setNames(map);
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
  }, []);

  const label = (url: string) => names[url] ?? decodeURIComponent(url.split("?")[0].split("/").pop() || url);
  const total = (items ?? []).reduce((n, i) => n + i.size, 0);

  const removeOne = async (url: string) => {
    await removeCached(url);
    setItems((p) => (p ?? []).filter((i) => i.url !== url));
  };
  const removeAll = async () => {
    if (!confirm("Remove every offline video from this device?")) return;
    await clearAllCached();
    setItems([]);
  };

  return (
    <div>
      <p style={{ fontSize: 15, color: "var(--c-ink2)", marginBottom: 14 }}>
        {online ? "You're online." : "You're offline. Saved videos below still play."}{" "}
        {items && items.length > 0 ? `${items.length} saved, ${fmtBytes(total)} on this device.` : "Nothing saved yet. Lessons hosted on Sprint.dev have a Save for offline button; YouTube lessons can't be saved."}
      </p>
      {items && items.length > 0 && (
        <>
          <ul style={{ listStyle: "none", borderTop: "1px solid var(--c-border)" }}>
            {items.map((i) => (
              <li key={i.url} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--c-border)" }}>
                <span style={{ flex: 1, fontSize: 15, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label(i.url)}</span>
                <span className="label">{fmtBytes(i.size)}</span>
                <button onClick={() => removeOne(i.url)} className="btn btn-ghost btn-sm" aria-label={`Remove ${label(i.url)}`}><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
          <button onClick={removeAll} className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>Remove all</button>
        </>
      )}
    </div>
  );
}
