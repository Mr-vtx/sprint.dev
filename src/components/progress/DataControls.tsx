"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { exportJson, importJson, resetAll } from "@/lib/backup";

export default function DataControls() {
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `sprintdev-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ text: "Backup downloaded." });
  };

  const restore = async (f?: File) => {
    if (!f) return;
    try {
      const n = importJson(await f.text());
      setMsg({ text: `Restored ${n} items. Reloading…` });
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setMsg({ text: (e as Error).message, error: true });
    }
    if (file.current) file.current.value = "";
  };

  const reset = () => {
    if (!confirm("Delete all progress, notes and streaks on this device? This can't be undone. Export a backup first if you might want it back.")) return;
    resetAll();
    window.location.reload();
  };

  return (
    <div>
      <p style={{ fontSize: 15, color: "var(--c-ink2)", maxWidth: 560, marginBottom: 16 }}>
        There's no account, so your progress lives in this browser. Export a backup to move to another device or keep it safe, and import it there.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={download} className="btn btn-outline"><Download size={15} /> Export backup</button>
        <button onClick={() => file.current?.click()} className="btn btn-outline"><Upload size={15} /> Import backup</button>
        <button onClick={reset} className="btn btn-ghost" style={{ color: "var(--c-red)" }}>Delete all progress</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
      </div>
      <p aria-live="polite" style={{ marginTop: 12, fontSize: 14, minHeight: 20, color: msg?.error ? "var(--c-red)" : "var(--c-ink2)" }}>{msg?.text}</p>
    </div>
  );
}
