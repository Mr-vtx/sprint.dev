"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Search, Sun, Moon, Menu, X, Download, Terminal } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Navbar({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  const openSearch = () =>
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      }),
    );

  const links = [
    { href: "/courses", label: "Courses" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "/progress", label: "Progress" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
          ? "color-mix(in srgb, var(--c-bg) 92%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${
          scrolled ? "var(--c-border)" : "transparent"
        }`,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 8,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 5,
              background: "var(--c-ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Terminal size={13} style={{ color: "var(--c-bg)" }} />
          </div>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16.5,
              letterSpacing: "-0.02em",
              color: "var(--c-ink)",
            }}
          >
            Sprintdev
          </span>
        </Link>

        <nav
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: 2,
            marginRight: "auto",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "5px 11px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13.5,
                fontWeight: 500,
                color: "var(--c-ink2)",
                transition: "all 0.12s",
                textDecoration: "none",
              }}
              className="hover:bg-[var(--c-surface2)] hover:text-[var(--c-ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={openSearch}
          className="hidden sm:flex"
          style={{
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "var(--font-body)",
            color: "var(--c-ink3)",
            marginRight: 6,
            transition: "border-color 0.12s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor =
              "var(--c-ink3)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor =
              "var(--c-border)")
          }
        >
          <Search size={13} />

          <span style={{ fontSize: 12.5 }}>Search…</span>

          <kbd
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              padding: "1px 5px",
              borderRadius: 3,
              background: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              marginLeft: 4,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {showInstall && (
          <button
            onClick={handleInstall}
            className="hidden sm:flex btn btn-primary btn-sm"
            style={{ gap: 5 }}
          >
            <Download size={12} />
            Install
          </button>
        )}

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--c-border)",
                background: "transparent",
                cursor: "pointer",
                color: "var(--c-ink2)",
                transition: "all 0.12s",
              }}
              className="hover:bg-[var(--c-surface2)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--c-border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--c-ink2)",
            }}
            className="md:hidden"
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            background: "var(--c-bg)",
            borderTop: "1px solid var(--c-border)",
            padding: "12px 20px 16px",
          }}
        >
          <button
            onClick={() => {
              openSearch();
              setMobileOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 12px",
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--c-ink3)",
              marginBottom: 10,
              fontFamily: "var(--font-body)",
            }}
          >
            <Search size={13} />
            Search courses…
          </button>

          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "9px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--c-ink)",
                marginBottom: 2,
                textDecoration: "none",
              }}
              className="hover:bg-[var(--c-surface2)]"
            >
              {l.label}
            </Link>
          ))}

          {showInstall && (
            <button
              onClick={handleInstall}
              className="btn btn-primary btn-sm"
              style={{
                marginTop: 10,
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Download size={13} />
              Install app
            </button>
          )}
        </div>
      )}
    </header>
  );
}
