"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Trash2, Upload } from "lucide-react";
import { courses } from "@/lib/data";

interface StoredFile { key: string; size: number; lastModified: string }
interface Files { configured: boolean; videos: StoredFile[]; pdfs: StoredFile[] }

const fmt = (b: number) => (b < 1024 ** 2 ? `${(b / 1024).toFixed(0)} KB` : b < 1024 ** 3 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${(b / 1024 ** 3).toFixed(2)} GB`);

async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (res.status === 401) { window.location.reload(); throw new Error("Session expired."); }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body as T;
}

/** PUT a file straight to the bucket via a presigned URL, reporting progress. */
function putFile(url: string, file: File, type: string, onPct: (n: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onPct(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}). Check the bucket's CORS rule allows PUT from this site.`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check the bucket's CORS rule allows PUT from this site."));
    xhr.send(file);
  });
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); })} aria-label={label}>
      {ok ? <Check size={13} /> : <Copy size={13} />} {ok ? "Copied" : "Copy snippet"}
    </button>
  );
}

export default function Dashboard() {
  const [files, setFiles] = useState<Files | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<Record<string, number | "deleting">>({});

  const load = useCallback(() => api<Files>("/api/admin/files").then(setFiles).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const videoSize = (lessonId: string) => files?.videos.find((v) => v.key === `videos/${lessonId}.mp4`)?.size;
  const pdfsFor = (courseId: string) => (files?.pdfs ?? []).filter((p) => p.key.startsWith(`pdfs/${courseId}/`));

  const run = async (id: string, job: () => Promise<void>) => {
    setError("");
    try { await job(); await load(); } catch (e) { setError((e as Error).message); }
    setBusy((b) => { const { [id]: _, ...rest } = b; return rest; });
  };

  const uploadVideo = (lessonId: string, file: File) =>
    run(`v:${lessonId}`, async () => {
      setBusy((b) => ({ ...b, [`v:${lessonId}`]: 0 }));
      const type = file.type || "video/mp4";
      const { uploadUrl } = await api<{ uploadUrl: string }>("/api/admin/videos/sign", { method: "POST", body: JSON.stringify({ lessonId, contentType: type, size: file.size }) });
      await putFile(uploadUrl, file, type, (n) => setBusy((b) => ({ ...b, [`v:${lessonId}`]: n })));
    });

  const removeVideo = (lessonId: string, title: string) => {
    if (!confirm(`Delete the hosted video for "${title}"?`)) return;
    setBusy((b) => ({ ...b, [`v:${lessonId}`]: "deleting" }));
    run(`v:${lessonId}`, async () => { await api(`/api/admin/videos/${lessonId}`, { method: "DELETE" }); });
  };

  const uploadPdf = (courseId: string, file: File) =>
    run(`p:${courseId}`, async () => {
      setBusy((b) => ({ ...b, [`p:${courseId}`]: 0 }));
      const { uploadUrl } = await api<{ uploadUrl: string }>("/api/admin/pdfs/sign", { method: "POST", body: JSON.stringify({ courseId, filename: file.name, size: file.size }) });
      await putFile(uploadUrl, file, "application/pdf", (n) => setBusy((b) => ({ ...b, [`p:${courseId}`]: n })));
    });

  const removePdf = (courseId: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    run(`p:${courseId}:${name}`, async () => { await api(`/api/admin/pdfs/${courseId}?file=${encodeURIComponent(name)}`, { method: "DELETE" }); });
  };

  const signOut = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.reload(); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <div style={{ maxWidth: 620 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Files</h1>
          <p style={{ color: "var(--c-ink2)", fontSize: 15.5, lineHeight: 1.65 }}>
            Host lesson videos and course PDFs in your own storage. Course content itself lives in <code className="code-inline">src/lib/data.ts</code>; after uploading a video, add the snippet to that lesson and commit.
          </p>
        </div>
        <button onClick={signOut} className="btn btn-outline">Sign out</button>
      </div>

      {error && <p role="alert" style={{ background: "var(--c-red-dim)", color: "var(--c-red)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 14, marginBottom: 24 }}>{error}</p>}

      {files && !files.configured && (
        <p style={{ background: "var(--c-amber-dim)", padding: "14px 16px", borderRadius: "var(--radius-sm)", fontSize: 14.5, marginBottom: 32 }}>
          Storage isn&apos;t configured. Set the <code className="code-inline">STORAGE_*</code> variables from <code className="code-inline">.env.example</code> to enable uploads.
        </p>
      )}

      {courses.map((c) => (
        <section key={c.id} style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{c.title}</h2>
          <ul style={{ listStyle: "none", borderTop: "1px solid var(--c-border)" }}>
            {c.lessons.map((l) => {
              const size = videoSize(l.id);
              const b = busy[`v:${l.id}`];
              const linked = Boolean(l.videoUrl);
              return (
                <li key={l.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "6px 16px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>{l.title} <span className="label">{l.id}</span></p>
                    <p className="label" style={{ marginTop: 2 }}>
                      {typeof b === "number" ? `Uploading ${b}%` : b === "deleting" ? "Deleting…"
                        : size !== undefined ? `Hosted, ${fmt(size)}${linked ? "" : ". Not linked in data.ts yet."}`
                        : l.youtubeId ? "YouTube" : linked ? "Linked in data.ts, but no file uploaded" : "No video"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {size !== undefined && !linked && <CopyButton text={`videoUrl: "/api/videos/${l.id}"`} label={`Copy videoUrl snippet for ${l.title}`} />}
                    <label className="btn btn-outline btn-sm" style={{ cursor: files?.configured && b === undefined ? "pointer" : "not-allowed", opacity: files?.configured && b === undefined ? 1 : 0.5 }}>
                      <Upload size={13} /> {size !== undefined ? "Replace" : "Upload"}
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden disabled={!files?.configured || b !== undefined}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(l.id, f); e.target.value = ""; }} />
                    </label>
                    {size !== undefined && <button className="btn btn-ghost btn-sm" onClick={() => removeVideo(l.id, l.title)} disabled={b !== undefined} aria-label={`Delete hosted video for ${l.title}`}><Trash2 size={13} /></button>}
                  </div>
                  {typeof b === "number" && <div className="progress-track" style={{ gridColumn: "1 / -1" }}><div className="progress-fill" style={{ width: `${b}%` }} /></div>}
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>PDFs</p>
            {pdfsFor(c.id).map((p) => {
              const name = p.key.split("/").pop()!;
              return (
                <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", fontSize: 14.5 }}>
                  <a href={`/api/pdfs/${c.id}?file=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-blue)" }}>{name}</a>
                  <span className="label">{fmt(p.size)}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removePdf(c.id, name)} disabled={busy[`p:${c.id}:${name}`] !== undefined} aria-label={`Delete ${name}`}><Trash2 size={13} /></button>
                </div>
              );
            })}
            {pdfsFor(c.id).length === 0 && <p className="label" style={{ marginBottom: 6 }}>None uploaded.</p>}
            <label className="btn btn-outline btn-sm" style={{ marginTop: 8, opacity: files?.configured ? 1 : 0.5, cursor: files?.configured ? "pointer" : "not-allowed" }}>
              <Upload size={13} /> {typeof busy[`p:${c.id}`] === "number" ? `Uploading ${busy[`p:${c.id}`]}%` : "Upload PDF"}
              <input type="file" accept="application/pdf" hidden disabled={!files?.configured || busy[`p:${c.id}`] !== undefined}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdf(c.id, f); e.target.value = ""; }} />
            </label>
          </div>
        </section>
      ))}
    </div>
  );
}
