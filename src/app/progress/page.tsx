"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  WifiOff,
  Wifi,
  Trash2,
  Flame,
  Calendar,
  Target,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ActivityHeatmap from "@/components/ui/ActivityHeatmap";
import { courses } from "@/lib/data";
import { getAllCached, type CachedEntry } from "@/hooks/useVideoCache";
import { useStreak } from "@/hooks/useStreak";

function fmtBytes(b: number) {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function Ring({
  pct,
  size = 56,
  stroke = 4,
  color = "var(--c-blue)",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const c = size / 2;
  const len = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="var(--c-surface2)"
        strokeWidth={stroke}
      />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${(pct / 100) * len} ${len}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

const accentColor: Record<string, string> = {
  blue: "var(--c-blue)",
  green: "var(--c-green)",
  amber: "var(--c-amber)",
};

export default function ProgressPage() {
  const [cached, setCached] = useState<CachedEntry[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const { data: streak, mounted } = useStreak();

  const [completionMap, setCompletionMap] = useState<Record<string, string[]>>(
    {},
  );
  useEffect(() => {
    const map: Record<string, string[]> = {};
    courses.forEach((c) => {
      try {
        const s = localStorage.getItem(`vs-done-${c.id}`);
        map[c.id] = s ? JSON.parse(s) : [];
      } catch {
        map[c.id] = [];
      }
    });
    setCompletionMap(map);
  }, []);

  const completions = courses.map((c) => ({
    course: c,
    done: completionMap[c.id] ?? [],
  }));

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    getAllCached().then(setCached);
  }, []);

  const clearOne = async (url: string) => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open("sprintdev-cache", 1);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    await new Promise<void>((res, rej) => {
      const r = db
        .transaction("videos", "readwrite")
        .objectStore("videos")
        .delete(url);
      r.onsuccess = () => {
        db.close();
        res();
      };
      r.onerror = () => {
        db.close();
        rej(r.error);
      };
    });
    setCached((p) => p.filter((c) => c.url !== url));
  };

  const clearAll = async () => {
    if (!confirm("Remove all offline videos from this device?")) return;
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open("sprintdev-cache", 1);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    await new Promise<void>((res, rej) => {
      const r = db
        .transaction("videos", "readwrite")
        .objectStore("videos")
        .clear();
      r.onsuccess = () => {
        db.close();
        res();
      };
      r.onerror = () => {
        db.close();
        rej(r.error);
      };
    });
    setCached([]);
  };

  const inProgress = completions.filter(
    ({ done, course }) =>
      done.length > 0 && done.length < course.lessons.length,
  );
  const completed = completions.filter(
    ({ done, course }) =>
      done.length >= course.lessons.length && course.lessons.length > 0,
  );
  const notStarted = completions.filter(({ done }) => done.length === 0);
  const totalDone = completions.reduce((s, { done }) => s + done.length, 0);
  const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
  const totalBytes = cached.reduce((s, c) => s + c.size, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <Navbar />
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px 64px" }}
      >
        <div style={{ marginBottom: 40 }}>
          <span
            className="label"
            style={{ display: "block", marginBottom: 12 }}
          >
            dashboard
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--c-ink)",
            }}
          >
            My Progress
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            {
              icon: <Flame size={15} />,
              label: "day streak",
              value: mounted ? streak.current : "—",
              color: "var(--c-amber)",
            },
            {
              icon: <TrendingUp size={15} />,
              label: "in progress",
              value: inProgress.length,
              color: "var(--c-blue)",
            },
            {
              icon: <CheckCircle2 size={15} />,
              label: "completed",
              value: completed.length,
              color: "var(--c-green)",
            },
            {
              icon: <BookOpen size={15} />,
              label: "lessons done",
              value: totalDone,
              color: "var(--c-blue)",
            },
            {
              icon: <HardDrive size={15} />,
              label: "offline saved",
              value: cached.length,
              color: "var(--c-ink2)",
            },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="label">{s.label}</span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 32,
                  fontWeight: 800,
                  color: s.color,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {mounted && (
              <div className="card" style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <span
                      className="label"
                      style={{ display: "block", marginBottom: 4 }}
                    >
                      learning activity
                    </span>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--c-ink2)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {mounted
                        ? streak.longest > 0
                          ? `longest streak: ${streak.longest} days`
                          : "start your streak today"
                        : ""}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Flame size={16} style={{ color: "var(--c-amber)" }} />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 22,
                        color: "var(--c-amber)",
                      }}
                    >
                      {mounted ? streak.current : 0}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink3)",
                      }}
                    >
                      days
                    </span>
                  </div>
                </div>
                <ActivityHeatmap
                  activity={mounted ? streak.activity : {}}
                  weeks={16}
                />
              </div>
            )}

            <div>
              <span
                className="label"
                style={{ display: "block", marginBottom: 14 }}
              >
                courses
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {completions.map(({ course: c, done }) => {
                  const pct = Math.round(
                    (done.length / c.lessons.length) * 100,
                  );
                  const color = accentColor[c.color];
                  return (
                    <Link
                      key={c.id}
                      href={`/courses/${c.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className="card card-hover"
                        style={{
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Ring pct={pct} size={48} stroke={3} color={color} />
                          <span
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              fontWeight: 700,
                              color,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: "var(--font-display)",
                              color: "var(--c-ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.title}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              color: "var(--c-ink3)",
                              marginTop: 3,
                            }}
                          >
                            {done.length}/{c.lessons.length} lessons · {c.level}
                          </p>
                          {done.length > 0 &&
                            done.length < c.lessons.length && (
                              <div
                                style={{
                                  marginTop: 6,
                                  height: 2,
                                  background: "var(--c-surface2)",
                                  borderRadius: 99,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: color,
                                    borderRadius: 99,
                                  }}
                                />
                              </div>
                            )}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {pct === 100 ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                color: "var(--c-green)",
                                fontWeight: 700,
                                background: "var(--c-green-dim)",
                                padding: "3px 8px",
                                borderRadius: 3,
                              }}
                            >
                              DONE
                            </span>
                          ) : pct === 0 ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                color: color,
                              }}
                            >
                              start →
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                color: "var(--c-ink3)",
                              }}
                            >
                              continue →
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div
              className="card"
              style={{ overflow: "hidden", position: "sticky", top: 80 }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--c-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <HardDrive size={14} style={{ color: "var(--c-blue)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--c-ink)",
                    flex: 1,
                  }}
                >
                  Offline storage
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: isOnline ? "var(--c-green)" : "var(--c-amber)",
                    fontWeight: 600,
                  }}
                >
                  {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {isOnline ? "online" : "offline"}
                </span>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-ink3)",
                    }}
                  >
                    {cached.length} video{cached.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--c-ink2)",
                    }}
                  >
                    {fmtBytes(totalBytes)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                    lineHeight: 1.65,
                  }}
                >
                  Sandboxed in browser IndexedDB.
                  <br />
                  Invisible to your OS file system.
                </p>
              </div>

              {cached.length === 0 ? (
                <div style={{ padding: "28px 16px", textAlign: "center" }}>
                  <HardDrive
                    size={24}
                    style={{
                      color: "var(--c-ink3)",
                      margin: "0 auto 10px",
                      opacity: 0.3,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-ink3)",
                      lineHeight: 1.75,
                    }}
                  >
                    No videos saved yet.
                    <br />
                    Open a lesson with a<br />
                    <strong style={{ color: "var(--c-ink2)" }}>
                      Save for offline
                    </strong>{" "}
                    button.
                  </p>
                </div>
              ) : (
                <div>
                  {cached.map((entry) => {
                    const lesson = courses
                      .flatMap((c) => c.lessons)
                      .find((l) => l.videoUrl === entry.url);
                    const label =
                      lesson?.title ?? entry.url.split("/").pop() ?? "Video";
                    return (
                      <div
                        key={entry.url}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderBottom: "1px solid var(--c-border)",
                        }}
                      >
                        <CheckCircle2
                          size={13}
                          style={{ color: "var(--c-green)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 12,
                              fontFamily: "var(--font-mono)",
                              color: "var(--c-ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontSize: 10.5,
                              fontFamily: "var(--font-mono)",
                              color: "var(--c-ink3)",
                              marginTop: 2,
                            }}
                          >
                            {fmtBytes(entry.size)} · {fmtDate(entry.savedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => clearOne(entry.url)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--c-ink3)",
                            display: "flex",
                            padding: 4,
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                  <div style={{ padding: "10px 14px" }}>
                    <button
                      onClick={clearAll}
                      style={{
                        width: "100%",
                        padding: "8px 0",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-red)",
                        background: "none",
                        border: "1px solid var(--c-border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                      }}
                    >
                      clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
