"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sun, Moon, Menu, X, Download } from "lucide-react";
import Logo from "./Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const LINKS = [
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/courses", label: "Courses" },
  { href: "/progress", label: "Progress" },
];

// `onSearch` is kept so existing pages compile; global search is the ⌘K palette.
export default function Navbar(_props: { onSearch?: (q: string) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };

  const openSearch = () =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 50,
        background: scrolled ? "color-mix(in srgb, var(--c-bg) 88%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--c-border)" : "transparent"}`,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", height: 60, gap: 8 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }} aria-label="Sprint.dev home">
          <Logo />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em" }}>
            Sprint<span style={{ color: "var(--c-ink3)" }}>.dev</span>
          </span>
        </Link>

        <nav className="hidden md:flex" style={{ gap: 2, marginRight: "auto" }} aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              style={{
                padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500,
                color: isActive(l.href) ? "var(--c-ink)" : "var(--c-ink2)",
                background: isActive(l.href) ? "var(--c-surface2)" : "transparent",
              }}
              className="hover:text-[var(--c-ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={openSearch} className="btn btn-outline btn-sm hidden sm:inline-flex" style={{ color: "var(--c-ink3)", gap: 10, fontWeight: 500 }}>
            <Search size={13} /> Search
            <kbd style={{ fontSize: 11, padding: "0 5px", borderRadius: 3, background: "var(--c-surface2)", border: "1px solid var(--c-border)" }}>⌘K</kbd>
          </button>

          {installEvt && (
            <button onClick={install} className="btn btn-primary btn-sm hidden sm:inline-flex">
              <Download size={13} /> Install
            </button>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="btn btn-ghost" style={{ padding: 8 }}
              aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <button onClick={() => setOpen(!open)} className="btn btn-ghost md:hidden" style={{ padding: 8 }} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden" style={{ background: "var(--c-bg)", borderTop: "1px solid var(--c-border)", padding: "10px 24px 18px" }}>
          <button onClick={() => { openSearch(); setOpen(false); }} className="btn btn-outline" style={{ width: "100%", justifyContent: "flex-start", color: "var(--c-ink3)", marginBottom: 8 }}>
            <Search size={14} /> Search
          </button>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "11px 4px", fontSize: 16, fontWeight: 500, borderBottom: "1px solid var(--c-border)" }}>
              {l.label}
            </Link>
          ))}
          {installEvt && (
            <button onClick={install} className="btn btn-primary" style={{ marginTop: 14, width: "100%" }}>
              <Download size={14} /> Install app
            </button>
          )}
        </div>
      )}
    </header>
  );
}
