"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DB_NAME = "sprintdev-cache";
const STORE = "videos";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE))
        req.result.createObjectStore(STORE, { keyPath: "url" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(
  url: string,
): Promise<{ blob: Blob; size: number; savedAt: number } | null> {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const r = db.transaction(STORE, "readonly").objectStore(STORE).get(url);
      r.onsuccess = () => {
        db.close();
        res(r.result ?? null);
      };
      r.onerror = () => {
        db.close();
        rej(r.error);
      };
    });
  } catch {
    return null;
  }
}

async function dbPut(url: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .put({ url, blob, size: blob.size, savedAt: Date.now() });
    r.onsuccess = () => {
      db.close();
      res();
    };
    r.onerror = () => {
      db.close();
      rej(r.error);
    };
  });
}

async function dbDelete(url: string): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE, "readwrite").objectStore(STORE).delete(url);
    r.onsuccess = () => {
      db.close();
      res();
    };
    r.onerror = () => {
      db.close();
      rej(r.error);
    };
  });
}

export type CacheStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "cached"
  | "error";

export interface UseVideoCacheResult {
  status: CacheStatus;
  progress: number;
  blobUrl: string | null;
  sizeBytes: number | null;
  isOffline: boolean;
  download: () => Promise<void>;
  removeCache: () => Promise<void>;
}

export function useVideoCache(
  videoUrl: string | undefined,
): UseVideoCacheResult {
  const [status, setStatus] = useState<CacheStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const blobRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const sync = () => setIsOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!videoUrl) return;

    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
      setBlobUrl(null);
    }

    setStatus("checking");
    dbGet(videoUrl).then((record) => {
      if (record) {
        const obj = URL.createObjectURL(record.blob);
        blobRef.current = obj;
        setBlobUrl(obj);
        setSizeBytes(record.size);
        setStatus("cached");
      } else {
        setStatus("idle");
      }
    });

    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, [videoUrl]);

  const download = useCallback(async () => {
    if (!videoUrl || status === "downloading" || status === "cached") return;

    abortRef.current = new AbortController();
    setStatus("downloading");
    setProgress(0);

    try {
      const res = await fetch(videoUrl, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const total = parseInt(res.headers.get("Content-Length") ?? "0", 10);
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0)
          setProgress(Math.min(99, Math.round((received / total) * 100)));
      }

      const blob = new Blob(chunks, { type: "video/mp4" });
      await dbPut(videoUrl, blob);

      const obj = URL.createObjectURL(blob);
      blobRef.current = obj;
      setBlobUrl(obj);
      setSizeBytes(blob.size);
      setProgress(100);
      setStatus("cached");
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      setStatus(isAbort ? "idle" : "error");
      setProgress(0);
    }
  }, [videoUrl, status]);

  const removeCache = useCallback(async () => {
    if (!videoUrl) return;
    await dbDelete(videoUrl);
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setBlobUrl(null);
    setSizeBytes(null);
    setStatus("idle");
  }, [videoUrl]);

  return {
    status,
    progress,
    blobUrl,
    sizeBytes,
    isOffline,
    download,
    removeCache,
  };
}

export interface CachedEntry {
  url: string;
  size: number;
  savedAt: number;
}

export async function getAllCached(): Promise<CachedEntry[]> {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const r = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      r.onsuccess = () => {
        db.close();
        res(r.result ?? []);
      };
      r.onerror = () => {
        db.close();
        rej(r.error);
      };
    });
  } catch {
    return [];
  }
}
