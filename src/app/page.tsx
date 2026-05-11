"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Map,
  Users,
  Star,
  Download,
  WifiOff,
  Terminal,
  ChevronRight,
  Zap,
  Code2,
  Network,
  Database,
  Globe,
  Cpu,
  GitBranch,
  Search,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CourseCard from "@/components/ui/CourseCard";
import InstallBanner from "@/components/ui/InstallBanner";
import { courses, roadmaps } from "@/lib/data";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setVal(Math.round(ease * to));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

const PHRASES = [
  "Build real things.",
  "Ship what you learn.",
  "No fluff. Just code.",
  "Own your stack.",
];

function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    if (!deleting && displayed.length < phrase.length) {
      const t = setTimeout(
        () => setDisplayed(phrase.slice(0, displayed.length + 1)),
        55,
      );
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === phrase.length) {
      if (done) return;
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
    }
  }, [displayed, deleting, phraseIdx, done]);

  return (
    <span style={{ color: "var(--c-blue)" }}>
      {displayed}
      <span style={{ opacity: 0.6, animation: "blink 1s step-end infinite" }}>
        |
      </span>
    </span>
  );
}

const TECH = [
  { icon: <Terminal size={16} />, name: "Rust", desc: "Systems & CLI" },
  { icon: <Globe size={16} />, name: "Next.js", desc: "Fullstack web" },
  { icon: <Code2 size={16} />, name: "TypeScript", desc: "Type-safe JS" },
  { icon: <Database size={16} />, name: "PostgreSQL", desc: "Relational DB" },
  { icon: <Network size={16} />, name: "Networking", desc: "TCP/IP, DNS, TLS" },
  { icon: <Cpu size={16} />, name: "Node.js", desc: "Backend runtime" },
  {
    icon: <GitBranch size={16} />,
    name: "Git & CI/CD",
    desc: "Ship confidently",
  },
  { icon: <Zap size={16} />, name: "Linux", desc: "CLI & ops" },
];

const phaseColors: Record<string, string> = {
  blue: "var(--c-blue)",
  green: "var(--c-green)",
  amber: "var(--c-amber)",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick a roadmap or course",
    body: "Roadmaps give you a week-by-week plan. Courses give you videos and milestones. Start either way.",
  },
  {
    step: "02",
    title: "Watch, take notes, build milestones",
    body: "Each lesson has a notes panel that saves locally. Every topic ends with something to build — not just read.",
  },
  {
    step: "03",
    title: "Save for offline, keep learning",
    body: "Install the PWA and save videos to your device's private storage. Works on the bus, no WiFi needed.",
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filtered = courses.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const inProgress = courses.filter(
    (c) => c.progress && c.progress > 0 && c.progress < 100,
  );
  const totalStudents = courses.reduce((s, c) => s + c.students, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      <Navbar onSearch={setSearch} />
      <InstallBanner />

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "104px 24px 80px" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--c-border)",
            marginBottom: 28,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--c-ink3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <Terminal size={10} />
          self-taught curriculum · open-source
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5.5vw, 68px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                marginBottom: 24,
                color: "var(--c-ink)",
              }}
            >
              Learn it properly.
              <br />
              <Typewriter />
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                marginBottom: 36,
                maxWidth: 520,
                color: "var(--c-ink2)",
              }}
            >
              Structured roadmaps and video courses for self-taught developers —
              backend, systems, networking, tooling. Works offline on any
              device.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <Link
                href="/courses"
                className="btn btn-primary"
                style={{ fontSize: 14, padding: "11px 22px" }}
              >
                Browse courses <ArrowRight size={14} />
              </Link>
              <Link
                href="/roadmaps"
                className="btn btn-outline"
                style={{ fontSize: 14, padding: "11px 22px" }}
              >
                <Map size={14} /> View roadmaps
              </Link>
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "k",
                      metaKey: true,
                      bubbles: true,
                    }),
                  )
                }
                className="btn btn-ghost"
                style={{ fontSize: 13, padding: "11px 16px", gap: 7 }}
              >
                <Search size={13} />
                <span style={{ color: "var(--c-ink3)" }}>Search</span>
                <kbd
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: "var(--c-surface2)",
                    border: "1px solid var(--c-border)",
                    color: "var(--c-ink3)",
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                paddingTop: 28,
                borderTop: "1px solid var(--c-border)",
              }}
            >
              {[
                {
                  icon: <BookOpen size={11} />,
                  value: <Counter to={courses.length} />,
                  label: "courses",
                },
                {
                  icon: <Users size={11} />,
                  value: <Counter to={totalStudents} />,
                  label: "students",
                },
                {
                  icon: (
                    <Star
                      size={11}
                      style={{
                        fill: "var(--c-amber)",
                        color: "var(--c-amber)",
                      }}
                    />
                  ),
                  value: "4.8",
                  label: "avg rating",
                },
                {
                  icon: <WifiOff size={11} />,
                  value: "PWA",
                  label: "works offline",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                  }}
                >
                  {s.icon}
                  <strong style={{ color: "var(--c-ink)", fontWeight: 700 }}>
                    {s.value}
                  </strong>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          <div
            className="hidden lg:grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 8, width: 280 }}
          >
            {TECH.map((t) => (
              <div
                key={t.name}
                className="card"
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ color: "var(--c-blue)" }}>{t.icon}</div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--c-ink)",
                    lineHeight: 1.2,
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                  }}
                >
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid var(--c-border)",
          background: "var(--c-surface)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
          <span
            className="label"
            style={{ display: "block", marginBottom: 14 }}
          >
            how it works
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 0,
            }}
          >
            {HOW_IT_WORKS.map((h, i) => (
              <div
                key={h.step}
                style={{
                  padding: "24px 28px",
                  borderRight: i < 2 ? "1px solid var(--c-border)" : "none",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--c-blue)",
                    letterSpacing: "0.1em",
                    marginBottom: 14,
                  }}
                >
                  {h.step}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--c-ink)",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {h.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    color: "var(--c-ink2)",
                  }}
                >
                  {h.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {inProgress.length > 0 && !search && (
        <section
          style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 0" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span className="label">continue learning</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {inProgress.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span className="label">
            {search ? `results for "${search}"` : "all courses"}
          </span>
          {!search && (
            <Link
              href="/courses"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--c-ink3)",
              }}
              className="hover:text-[var(--c-ink)] transition-colors"
            >
              see all <ChevronRight size={12} />
            </Link>
          )}
        </div>
        {filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <BookOpen
              size={32}
              style={{
                margin: "0 auto 12px",
                color: "var(--c-ink3)",
                opacity: 0.3,
              }}
            />
            <p
              style={{
                fontSize: 13,
                color: "var(--c-ink3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              No courses match.
            </p>
          </div>
        )}
      </section>

      {!search && (
        <section
          style={{
            borderTop: "1px solid var(--c-border)",
            background: "var(--c-surface)",
          }}
        >
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 36,
              }}
            >
              <div>
                <span
                  className="label"
                  style={{ display: "block", marginBottom: 12 }}
                >
                  learning paths
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(22px, 3vw, 32px)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "var(--c-ink)",
                  }}
                >
                  Week-by-week roadmaps
                </h2>
              </div>
              <Link
                href="/roadmaps"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-ink3)",
                }}
                className="hidden sm:flex hover:text-[var(--c-ink)] transition-colors"
              >
                all roadmaps <ChevronRight size={12} />
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 14,
              }}
            >
              {roadmaps.map((r) => (
                <Link
                  key={r.id}
                  href={`/roadmaps/${r.id}`}
                  className="block group"
                >
                  <div
                    className="card card-hover"
                    style={{
                      padding: "20px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div style={{ display: "flex", gap: 3 }}>
                      {r.phases.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            height: 2,
                            flex: 1,
                            borderRadius: 99,
                            background: phaseColors[p.color],
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 700,
                          letterSpacing: "-0.015em",
                          lineHeight: 1.25,
                          marginBottom: 6,
                          color: "var(--c-ink)",
                        }}
                        className="group-hover:text-[var(--c-blue)] transition-colors"
                      >
                        {r.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: "var(--c-ink2)",
                        }}
                      >
                        {r.tagline}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink3)",
                        borderTop: "1px solid var(--c-border)",
                        paddingTop: 12,
                      }}
                    >
                      <span>{r.duration}</span>
                      <span>{r.hoursPerWeek}/wk</span>
                      <span>{r.phases.length} phases</span>
                      <span
                        style={{ marginLeft: "auto", color: "var(--c-blue)" }}
                      >
                        view →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!search && (
        <section
          style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                icon: <WifiOff size={16} />,
                title: "Offline first",
                body: "Videos save to your private browser storage — never in your gallery or file system. Works on the bus.",
              },
              {
                icon: <Download size={16} />,
                title: "Installable PWA",
                body: "Add to home screen on any device. Feels like a native app, zero app store needed.",
              },
              {
                icon: <Terminal size={16} />,
                title: "Keyboard driven",
                body: "⌘K search, ←→ lessons, M to mark done. Full keyboard nav on course pages.",
              },
              {
                icon: <CheckCircle2 size={16} />,
                title: "Track progress",
                body: "Per-lesson notes, streak calendar, completion tracking — all local, no account needed.",
              },
            ].map((f) => (
              <div key={f.title} className="card" style={{ padding: "20px" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--c-surface2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                    color: "var(--c-blue)",
                  }}
                >
                  {f.icon}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--c-ink)",
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "var(--c-ink2)",
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer
        style={{ borderTop: "1px solid var(--c-border)", padding: "28px 24px" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: "var(--c-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={11} style={{ color: "var(--c-bg)" }} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--c-ink)",
              }}
            >
              Sprintdev
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--c-ink3)",
            }}
          >
            built by{" "}
            <a
              href="https://github.com/mr-vtx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--c-blue)", textDecoration: "none" }}
            >
              mr-vtx
            </a>
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              ["/courses", "courses"],
              ["/roadmaps", "roadmaps"],
              ["/progress", "progress"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-ink3)",
                  transition: "color 0.12s",
                }}
                className="hover:text-[var(--c-ink)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
