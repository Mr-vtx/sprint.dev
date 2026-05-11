"use client";

import { useState, useEffect } from "react";
import { Download, X, Wifi } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (
      typeof localStorage !== "undefined" &&
      localStorage.getItem("pwa-dismissed")
    )
      return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        width: "calc(100% - 32px)",
        maxWidth: 480,
        background: "var(--c-ink)",
        color: "var(--c-bg)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
      className="dark:bg-[var(--c-dark-ink)] dark:text-[var(--c-dark-bg)]"
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          background: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Wifi size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "var(--font-display)",
            lineHeight: 1.3,
          }}
        >
          Install Sprintdev
        </p>
        <p
          style={{
            fontSize: 11.5,
            opacity: 0.7,
            lineHeight: 1.4,
            marginTop: 1,
          }}
        >
          Works offline — save courses &amp; roadmaps on your device.
        </p>
      </div>
      <button
        onClick={install}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          background: "rgba(255,255,255,0.18)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          color: "inherit",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        <Download size={12} /> Install
      </button>
      <button
        onClick={dismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.5,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
