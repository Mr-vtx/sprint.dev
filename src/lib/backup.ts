/**
 * Backup and restore for local-first progress.
 * Covers every localStorage key that starts with "vs-" (progress, notes,
 * last lesson, streak). Downloaded videos live in IndexedDB and are not included.
 */
const PREFIX = "vs-";

export function snapshot(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) out[k] = localStorage.getItem(k) ?? "";
  }
  return out;
}

export function exportJson(): string {
  return JSON.stringify({ app: "sprint.dev", version: 1, exportedAt: new Date().toISOString(), data: snapshot() }, null, 2);
}

/** Returns how many keys were restored. Throws on a file that isn't a Sprint.dev backup. */
export function importJson(text: string): number {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("That file isn't valid JSON."); }
  const data = (parsed as { app?: string; data?: unknown })?.data;
  if ((parsed as { app?: string })?.app !== "sprint.dev" || !data || typeof data !== "object")
    throw new Error("That file isn't a Sprint.dev backup.");
  let n = 0;
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (k.startsWith(PREFIX) && typeof v === "string") { localStorage.setItem(k, v); n++; }
  }
  return n;
}

export function resetAll(): void {
  Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
}
