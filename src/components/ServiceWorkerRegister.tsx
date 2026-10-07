"use client";

import { useEffect } from "react";
import { courses, roadmaps } from "@/lib/data";

/** Registers the service worker and asks it to cache every course and roadmap page. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const urls = [
      ...courses.map((c) => `/courses/${c.id}`),
      ...roadmaps.map((r) => `/roadmaps/${r.id}`),
    ];
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.active?.postMessage({ type: "CACHE_URLS", urls }))
      .catch(() => {});
  }, []);
  return null;
}
