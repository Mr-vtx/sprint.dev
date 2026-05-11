"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Terminal,
  Sun,
  Moon,
  Lock,
  Eye,
  EyeOff,
  Youtube,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Inbox,
  Check,
  X,
  Edit3,
  Save,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  getMergedCourses,
  setLessonData,
  clearLessonData,
  getAllLessonData,
  addExtraLesson,
  removeExtraLesson,
  getSuggestions,
  approveSuggestion,
  updateSuggestionStatus,
  deleteSuggestion,
  parseYouTubeId,
  formatDate,
  type VideoSuggestion,
} from "@/lib/courseStore";
import { courses as STATIC, type Course } from "@/lib/data";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "admin123";
const AUTH_KEY = "vs:authed";

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

function ytLink(id: string) {
  return `https://youtube.com/watch?v=${id}`;
}

type AdminTab = "courses" | "suggestions";

export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinVis, setPinVis] = useState(false);
  const [pinErr, setPinErr] = useState(false);
  const [tab, setTab] = useState<AdminTab>("courses");

  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [lessonSearch, setLessonSearch] = useState("");

  const [editing, setEditing] = useState<string | null>(null); // lessonId
  const [editYtUrl, setEditYtUrl] = useState("");
  const [editDur, setEditDur] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editErr, setEditErr] = useState("");
  const [editSaved, setEditSaved] = useState(false);

  const [addingTo, setAddingTo] = useState<string | null>(null); // courseId
  const [newTitle, setNewTitle] = useState("");
  const [newYtUrl, setNewYtUrl] = useState("");
  const [newDur, setNewDur] = useState("");
  const [newErr, setNewErr] = useState("");

  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [sugFilter, setSugFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const reload = useCallback(() => {
    setCourses(getMergedCourses());
    setSuggestions(getSuggestions());
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === "1") {
      setAuthed(true);
      reload();
    }
  }, [reload]);

  const login = () => {
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      sessionStorage.setItem(AUTH_KEY, "1");
      reload();
    } else {
      setPinErr(true);
      setTimeout(() => setPinErr(false), 1200);
    }
  };

  const saveLesson = (lessonId: string) => {
    const ytId = parseYouTubeId(editYtUrl);
    if (editYtUrl.trim() && !ytId) {
      setEditErr("Invalid YouTube URL or ID.");
      return;
    }
    setLessonData(lessonId, {
      youtubeId: ytId ?? undefined,
      duration: editDur.trim() || undefined,
      title: editTitle.trim() || undefined,
    });
    setEditing(null);
    setEditErr("");
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2000);
    reload();
  };

  const clearLesson = (lessonId: string) => {
    if (!confirm("Remove all overrides for this lesson?")) return;
    clearLessonData(lessonId);
    reload();
  };

  const startEdit = (
    lessonId: string,
    currentYtId?: string,
    currentDur?: string,
    currentTitle?: string,
  ) => {
    setEditing(lessonId);
    setEditYtUrl(currentYtId ?? "");
    setEditDur(currentDur ?? "");
    setEditTitle(currentTitle ?? "");
    setEditErr("");
  };

  const addLesson = (courseId: string) => {
    if (!newTitle.trim()) {
      setNewErr("Title is required.");
      return;
    }
    const ytId = parseYouTubeId(newYtUrl);
    if (newYtUrl.trim() && !ytId) {
      setNewErr("Invalid YouTube URL or ID.");
      return;
    }

    const id = `custom-${courseId}-${Date.now()}`;
    addExtraLesson(courseId, {
      id,
      title: newTitle.trim(),
      duration: newDur.trim() || "—",
      youtubeId: ytId ?? undefined,
    });

    setNewTitle("");
    setNewYtUrl("");
    setNewDur("");
    setNewErr("");
    setAddingTo(null);
    reload();
  };

  const approve = (s: VideoSuggestion) => {
    approveSuggestion(s);
    reload();
  };
  const reject = (id: string) => {
    updateSuggestionStatus(id, "rejected");
    reload();
  };
  const remove = (id: string) => {
    deleteSuggestion(id);
    reload();
  };

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const filteredSug = suggestions.filter(
    (s) => sugFilter === "all" || s.status === sugFilter,
  );

  const overrideMap = getAllLessonData();

  if (!mounted) return null;

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--c-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="card"
          style={{ width: "100%", maxWidth: 380, padding: 32 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--c-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={15} style={{ color: "var(--c-bg)" }} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--c-ink)",
                }}
              >
                Sprintdev
              </p>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-ink3)",
                  marginTop: 1,
                }}
              >
                admin panel
              </p>
            </div>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  marginLeft: "auto",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "1px solid var(--c-border)",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--c-ink2)",
                }}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
          </div>

          <label
            style={{
              display: "block",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--c-ink3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Admin PIN
          </label>
          <div style={{ position: "relative", marginBottom: 6 }}>
            <input
              type={pinVis ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter PIN"
              autoFocus
              style={{
                width: "100%",
                padding: "10px 38px 10px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                background: "var(--c-surface)",
                border: `1.5px solid ${pinErr ? "var(--c-red)" : "var(--c-border)"}`,
                borderRadius: "var(--radius-sm)",
                color: "var(--c-ink)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
            <button
              onClick={() => setPinVis(!pinVis)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--c-ink3)",
                display: "flex",
              }}
            >
              {pinVis ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {pinErr && (
            <p
              style={{
                fontSize: 11,
                color: "var(--c-red)",
                fontFamily: "var(--font-mono)",
                marginBottom: 10,
              }}
            >
              Wrong PIN.
            </p>
          )}

          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--c-ink3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Default:{" "}
            <code
              style={{
                background: "var(--c-surface2)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              admin123
            </code>
            <br />
            Change via{" "}
            <code
              style={{
                background: "var(--c-surface2)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              NEXT_PUBLIC_ADMIN_PIN
            </code>{" "}
            in .env.local
          </p>

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "11px 0",
              background: "var(--c-blue)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "var(--font-body)",
            }}
          >
            <Lock size={14} /> Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 5,
              background: "var(--c-ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Terminal size={12} style={{ color: "var(--c-bg)" }} />
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
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              background: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              padding: "2px 7px",
              borderRadius: 3,
              color: "var(--c-ink3)",
            }}
          >
            admin
          </span>

          <div style={{ marginLeft: 16, display: "flex", gap: 2 }}>
            {(["courses", "suggestions"] as AdminTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "5px 12px",
                  fontSize: 12.5,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: tab === t ? "var(--c-blue)" : "var(--c-ink3)",
                  background: tab === t ? "var(--c-blue-dim)" : "transparent",
                  position: "relative",
                }}
              >
                {" "}
                {t}
                {t === "suggestions" && pendingCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--c-red)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {editSaved && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-green)",
                }}
              >
                <CheckCircle size={12} /> Saved
              </span>
            )}
            <button
              onClick={reload}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                background: "none",
                border: "1px solid var(--c-border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--c-ink2)",
              }}
            >
              <RefreshCw size={11} /> refresh
            </button>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  color: "var(--c-ink2)",
                }}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "courses" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <span
                className="label"
                style={{ display: "block", marginBottom: 8 }}
              >
                course management
              </span>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--c-ink2)",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Add YouTube links to any lesson. Changes save instantly to your
                browser and appear on the public site immediately. No
                deployment, no server. Paste a full YouTube URL or just the
                video ID.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STATIC.map((course) => {
                const merged =
                  courses.find((c) => c.id === course.id) ?? course;
                const isOpen = expandedCourse === course.id;
                const hasYt = merged.lessons.filter((l) => l.youtubeId).length;
                const accentMap = {
                  blue: "var(--c-blue)",
                  green: "var(--c-green)",
                  amber: "var(--c-amber)",
                };
                const bar = accentMap[course.color];
                const filtered = merged.lessons.filter(
                  (l) =>
                    !lessonSearch ||
                    l.title.toLowerCase().includes(lessonSearch.toLowerCase()),
                );

                return (
                  <div
                    key={course.id}
                    className="card"
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      onClick={() => {
                        setExpandedCourse(isOpen ? null : course.id);
                        setLessonSearch("");
                        setAddingTo(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 18px",
                        cursor: "pointer",
                        background: isOpen ? "var(--c-surface)" : "transparent",
                      }}
                      className="hover:bg-[var(--c-surface)]"
                    >
                      <div
                        style={{
                          width: 3,
                          height: 40,
                          borderRadius: 99,
                          background: bar,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "var(--c-ink)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--c-ink3)",
                            marginTop: 3,
                          }}
                        >
                          {merged.lessons.length} lessons
                          <span style={{ margin: "0 8px", opacity: 0.4 }}>
                            ·
                          </span>
                          <span
                            style={{
                              color:
                                hasYt > 0 ? "var(--c-green)" : "var(--c-ink3)",
                            }}
                          >
                            {hasYt}/{merged.lessons.length} have YouTube
                          </span>
                          <span style={{ margin: "0 8px", opacity: 0.4 }}>
                            ·
                          </span>
                          {course.level}
                        </p>
                      </div>
                      <div
                        style={{
                          width: 80,
                          height: 4,
                          background: "var(--c-surface2)",
                          borderRadius: 99,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(hasYt / merged.lessons.length) * 100}%`,
                            background: bar,
                            borderRadius: 99,
                            transition: "width 0.4s",
                          }}
                        />
                      </div>
                      {isOpen ? (
                        <ChevronDown
                          size={14}
                          style={{ color: "var(--c-ink3)", flexShrink: 0 }}
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          style={{ color: "var(--c-ink3)", flexShrink: 0 }}
                        />
                      )}
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--c-border)" }}>
                        <div
                          style={{
                            padding: "8px 18px",
                            borderBottom: "1px solid var(--c-border)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Search
                            size={12}
                            style={{ color: "var(--c-ink3)" }}
                          />
                          <input
                            value={lessonSearch}
                            onChange={(e) => setLessonSearch(e.target.value)}
                            placeholder="Filter lessons…"
                            style={{
                              flex: 1,
                              background: "none",
                              border: "none",
                              outline: "none",
                              fontSize: 12.5,
                              fontFamily: "var(--font-mono)",
                              color: "var(--c-ink)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              color: "var(--c-ink3)",
                            }}
                          >
                            {filtered.length} shown
                          </span>
                        </div>

                        {filtered.map((lesson, idx) => {
                          const isEditing = editing === lesson.id;
                          const hasOverride = !!overrideMap[lesson.id];

                          return (
                            <div
                              key={lesson.id}
                              style={{
                                borderBottom: "1px solid var(--c-border)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "10px 18px",
                                  background: isEditing
                                    ? "var(--c-surface)"
                                    : "transparent",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--c-ink3)",
                                    width: 24,
                                    flexShrink: 0,
                                    textAlign: "right",
                                  }}
                                >
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                {lesson.youtubeId ? (
                                  <a
                                    href={ytLink(lesson.youtubeId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <img
                                      src={ytThumb(lesson.youtubeId)}
                                      alt=""
                                      width={64}
                                      height={36}
                                      style={{
                                        borderRadius: 4,
                                        objectFit: "cover",
                                        display: "block",
                                        border: "1px solid var(--c-border)",
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <div
                                    style={{
                                      width: 64,
                                      height: 36,
                                      borderRadius: 4,
                                      background: "var(--c-surface2)",
                                      border: "1px dashed var(--c-border)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Youtube
                                      size={14}
                                      style={{
                                        color: "var(--c-ink3)",
                                        opacity: 0.5,
                                      }}
                                    />
                                  </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 500,
                                      color: "var(--c-ink)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {lesson.title}
                                    {hasOverride && (
                                      <span
                                        style={{
                                          marginLeft: 6,
                                          fontSize: 9,
                                          fontFamily: "var(--font-mono)",
                                          color: "var(--c-blue)",
                                          background: "var(--c-blue-dim)",
                                          padding: "1px 5px",
                                          borderRadius: 3,
                                        }}
                                      >
                                        edited
                                      </span>
                                    )}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 11,
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--c-ink3)",
                                      marginTop: 2,
                                    }}
                                  >
                                    {lesson.duration}
                                    {lesson.youtubeId && (
                                      <a
                                        href={ytLink(lesson.youtubeId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          marginLeft: 8,
                                          color: "var(--c-blue)",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 3,
                                        }}
                                      >
                                        <ExternalLink size={9} />{" "}
                                        {lesson.youtubeId}
                                      </a>
                                    )}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      isEditing
                                        ? setEditing(null)
                                        : startEdit(
                                            lesson.id,
                                            lesson.youtubeId,
                                            lesson.duration,
                                            lesson.title,
                                          )
                                    }
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                      padding: "5px 10px",
                                      fontSize: 11.5,
                                      fontFamily: "var(--font-mono)",
                                      fontWeight: 600,
                                      background: isEditing
                                        ? "var(--c-surface2)"
                                        : "var(--c-blue-dim)",
                                      color: isEditing
                                        ? "var(--c-ink3)"
                                        : "var(--c-blue)",
                                      border: `1px solid ${isEditing ? "var(--c-border)" : "var(--c-blue-mid)"}`,
                                      borderRadius: "var(--radius-sm)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Edit3 size={10} />{" "}
                                    {isEditing ? "cancel" : "edit"}
                                  </button>
                                  {hasOverride && (
                                    <button
                                      onClick={() => clearLesson(lesson.id)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "5px 8px",
                                        fontSize: 11,
                                        fontFamily: "var(--font-mono)",
                                        background: "none",
                                        border: "1px solid var(--c-border)",
                                        borderRadius: "var(--radius-sm)",
                                        cursor: "pointer",
                                        color: "var(--c-ink3)",
                                      }}
                                      title="Reset to default"
                                    >
                                      <RotateCcw size={10} />
                                    </button>
                                  )}
                                  {(lesson as any).addedAt && (
                                    <button
                                      onClick={() =>
                                        removeExtraLesson(course.id, lesson.id)
                                      }
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "5px 8px",
                                        fontSize: 11,
                                        fontFamily: "var(--font-mono)",
                                        background: "none",
                                        border: "1px solid var(--c-border)",
                                        borderRadius: "var(--radius-sm)",
                                        cursor: "pointer",
                                        color: "var(--c-red)",
                                      }}
                                      title="Delete this lesson"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isEditing && (
                                <div
                                  style={{
                                    padding: "12px 18px 16px 52px",
                                    background: "var(--c-surface)",
                                    borderTop: "1px solid var(--c-border)",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "1fr 1fr",
                                      gap: 12,
                                      marginBottom: 12,
                                    }}
                                  >
                                    <div>
                                      <label
                                        style={{
                                          display: "block",
                                          fontSize: 10.5,
                                          fontFamily: "var(--font-mono)",
                                          color: "var(--c-ink3)",
                                          letterSpacing: "0.07em",
                                          textTransform: "uppercase",
                                          marginBottom: 5,
                                        }}
                                      >
                                        YouTube URL / ID
                                      </label>
                                      <input
                                        value={editYtUrl}
                                        onChange={(e) => {
                                          setEditYtUrl(e.target.value);
                                          setEditErr("");
                                        }}
                                        placeholder="https://youtube.com/watch?v=... or videoId"
                                        style={{
                                          width: "100%",
                                          padding: "7px 10px",
                                          fontSize: 12.5,
                                          fontFamily: "var(--font-mono)",
                                          background: "var(--c-bg)",
                                          border: `1px solid ${editErr ? "var(--c-red)" : "var(--c-border)"}`,
                                          borderRadius: "var(--radius-sm)",
                                          color: "var(--c-ink)",
                                          outline: "none",
                                          boxSizing: "border-box",
                                        }}
                                      />
                                    </div>

                                    <div>
                                      <label
                                        style={{
                                          display: "block",
                                          fontSize: 10.5,
                                          fontFamily: "var(--font-mono)",
                                          color: "var(--c-ink3)",
                                          letterSpacing: "0.07em",
                                          textTransform: "uppercase",
                                          marginBottom: 5,
                                        }}
                                      >
                                        Duration (optional)
                                      </label>
                                      <input
                                        value={editDur}
                                        onChange={(e) =>
                                          setEditDur(e.target.value)
                                        }
                                        placeholder="e.g. 14:32"
                                        style={{
                                          width: "100%",
                                          padding: "7px 10px",
                                          fontSize: 12.5,
                                          fontFamily: "var(--font-mono)",
                                          background: "var(--c-bg)",
                                          border: "1px solid var(--c-border)",
                                          borderRadius: "var(--radius-sm)",
                                          color: "var(--c-ink)",
                                          outline: "none",
                                          boxSizing: "border-box",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div style={{ marginBottom: 12 }}>
                                    <label
                                      style={{
                                        display: "block",
                                        fontSize: 10.5,
                                        fontFamily: "var(--font-mono)",
                                        color: "var(--c-ink3)",
                                        letterSpacing: "0.07em",
                                        textTransform: "uppercase",
                                        marginBottom: 5,
                                      }}
                                    >
                                      Title override (optional)
                                    </label>
                                    <input
                                      value={editTitle}
                                      onChange={(e) =>
                                        setEditTitle(e.target.value)
                                      }
                                      placeholder={lesson.title}
                                      style={{
                                        width: "100%",
                                        padding: "7px 10px",
                                        fontSize: 12.5,
                                        fontFamily: "var(--font-mono)",
                                        background: "var(--c-bg)",
                                        border: "1px solid var(--c-border)",
                                        borderRadius: "var(--radius-sm)",
                                        color: "var(--c-ink)",
                                        outline: "none",
                                        boxSizing: "border-box",
                                      }}
                                    />
                                  </div>

                                  {parseYouTubeId(editYtUrl) && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: 12,
                                        padding: "8px 12px",
                                        background: "var(--c-bg)",
                                        border: "1px solid var(--c-border)",
                                        borderRadius: "var(--radius-sm)",
                                      }}
                                    >
                                      <img
                                        src={ytThumb(
                                          parseYouTubeId(editYtUrl)!,
                                        )}
                                        alt=""
                                        width={80}
                                        height={45}
                                        style={{
                                          borderRadius: 3,
                                          objectFit: "cover",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <div>
                                        <p
                                          style={{
                                            fontSize: 11,
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--c-green)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                          }}
                                        >
                                          <CheckCircle size={10} /> Valid
                                          YouTube ID:{" "}
                                          {parseYouTubeId(editYtUrl)}
                                        </p>
                                        <a
                                          href={ytLink(
                                            parseYouTubeId(editYtUrl)!,
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: 11,
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--c-blue)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 3,
                                            marginTop: 3,
                                          }}
                                        >
                                          <ExternalLink size={9} /> open in
                                          YouTube
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {editErr && (
                                    <p
                                      style={{
                                        fontSize: 11,
                                        color: "var(--c-red)",
                                        fontFamily: "var(--font-mono)",
                                        marginBottom: 10,
                                      }}
                                    >
                                      {editErr}
                                    </p>
                                  )}

                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      onClick={() => saveLesson(lesson.id)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "8px 16px",
                                        fontSize: 12.5,
                                        fontFamily: "var(--font-mono)",
                                        fontWeight: 700,
                                        background: "var(--c-blue)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "var(--radius-sm)",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Save size={12} /> Save changes
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditing(null);
                                        setEditErr("");
                                      }}
                                      style={{
                                        padding: "8px 14px",
                                        fontSize: 12.5,
                                        fontFamily: "var(--font-mono)",
                                        background: "none",
                                        border: "1px solid var(--c-border)",
                                        borderRadius: "var(--radius-sm)",
                                        cursor: "pointer",
                                        color: "var(--c-ink2)",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {addingTo === course.id ? (
                          <div
                            style={{
                              padding: "16px 18px",
                              background: "var(--c-surface)",
                              borderTop: "1px solid var(--c-border)",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                color: "var(--c-ink)",
                                marginBottom: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Plus
                                size={12}
                                style={{ color: "var(--c-blue)" }}
                              />{" "}
                              Add new lesson
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 2fr 1fr",
                                gap: 10,
                                marginBottom: 10,
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--c-ink3)",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    marginBottom: 4,
                                  }}
                                >
                                  Title *
                                </label>
                                <input
                                  value={newTitle}
                                  onChange={(e) => {
                                    setNewTitle(e.target.value);
                                    setNewErr("");
                                  }}
                                  placeholder="Lesson title"
                                  style={{
                                    width: "100%",
                                    padding: "7px 10px",
                                    fontSize: 12.5,
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--c-bg)",
                                    border: `1px solid ${newErr && !newTitle ? "var(--c-red)" : "var(--c-border)"}`,
                                    borderRadius: "var(--radius-sm)",
                                    color: "var(--c-ink)",
                                    outline: "none",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--c-ink3)",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    marginBottom: 4,
                                  }}
                                >
                                  YouTube URL / ID
                                </label>
                                <input
                                  value={newYtUrl}
                                  onChange={(e) => {
                                    setNewYtUrl(e.target.value);
                                    setNewErr("");
                                  }}
                                  placeholder="https://youtube.com/watch?v=..."
                                  style={{
                                    width: "100%",
                                    padding: "7px 10px",
                                    fontSize: 12.5,
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--c-bg)",
                                    border: `1px solid ${newErr && newYtUrl ? "var(--c-red)" : "var(--c-border)"}`,
                                    borderRadius: "var(--radius-sm)",
                                    color: "var(--c-ink)",
                                    outline: "none",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--c-ink3)",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    marginBottom: 4,
                                  }}
                                >
                                  Duration
                                </label>
                                <input
                                  value={newDur}
                                  onChange={(e) => setNewDur(e.target.value)}
                                  placeholder="14:32"
                                  style={{
                                    width: "100%",
                                    padding: "7px 10px",
                                    fontSize: 12.5,
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--c-bg)",
                                    border: "1px solid var(--c-border)",
                                    borderRadius: "var(--radius-sm)",
                                    color: "var(--c-ink)",
                                    outline: "none",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            </div>

                            {newErr && (
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "var(--c-red)",
                                  fontFamily: "var(--font-mono)",
                                  marginBottom: 10,
                                }}
                              >
                                {newErr}
                              </p>
                            )}

                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => addLesson(course.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "8px 16px",
                                  fontSize: 12.5,
                                  fontFamily: "var(--font-mono)",
                                  fontWeight: 700,
                                  background: "var(--c-blue)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "var(--radius-sm)",
                                  cursor: "pointer",
                                }}
                              >
                                <Plus size={12} /> Add lesson
                              </button>
                              <button
                                onClick={() => {
                                  setAddingTo(null);
                                  setNewTitle("");
                                  setNewYtUrl("");
                                  setNewDur("");
                                  setNewErr("");
                                }}
                                style={{
                                  padding: "8px 14px",
                                  fontSize: 12.5,
                                  fontFamily: "var(--font-mono)",
                                  background: "none",
                                  border: "1px solid var(--c-border)",
                                  borderRadius: "var(--radius-sm)",
                                  cursor: "pointer",
                                  color: "var(--c-ink2)",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "10px 18px",
                              borderTop: "1px solid var(--c-border)",
                            }}
                          >
                            <button
                              onClick={() => {
                                setAddingTo(course.id);
                                setExpandedCourse(course.id);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                color: "var(--c-blue)",
                                background: "none",
                                border: "1px dashed var(--c-blue-mid)",
                                borderRadius: "var(--radius-sm)",
                                padding: "7px 14px",
                                cursor: "pointer",
                                width: "100%",
                                justifyContent: "center",
                                transition: "all 0.12s",
                              }}
                              onMouseEnter={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.background = "var(--c-blue-dim)")
                              }
                              onMouseLeave={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.background = "none")
                              }
                            >
                              <Plus size={12} /> Add new lesson
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "suggestions" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <span
                className="label"
                style={{ display: "block", marginBottom: 8 }}
              >
                video suggestions
              </span>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--c-ink2)",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Users can suggest YouTube videos from any lesson page. Approve
                to automatically link the video to that lesson.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {(["pending", "all", "approved", "rejected"] as const).map(
                (f) => {
                  const count =
                    f === "all"
                      ? suggestions.length
                      : suggestions.filter((s) => s.status === f).length;
                  return (
                    <button
                      key={f}
                      onClick={() => setSugFilter(f)}
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: sugFilter === f ? "var(--c-ink)" : "none",
                        color:
                          sugFilter === f ? "var(--c-bg)" : "var(--c-ink3)",
                        border: `1px solid ${sugFilter === f ? "var(--c-ink)" : "var(--c-border)"}`,
                        borderRadius: "var(--radius-sm)",
                        transition: "all 0.12s",
                      }}
                    >
                      {f} {count > 0 && `(${count})`}
                    </button>
                  );
                },
              )}
            </div>

            {filteredSug.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Inbox
                  size={36}
                  style={{
                    color: "var(--c-ink3)",
                    margin: "0 auto 14px",
                    opacity: 0.3,
                  }}
                />
                <p
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                  }}
                >
                  No {sugFilter !== "all" ? sugFilter : ""} suggestions.
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredSug.map((sug) => (
                  <div
                    key={sug.id}
                    className="card"
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{ display: "flex", gap: 14, padding: "14px 18px" }}
                    >
                      <a
                        href={ytLink(sug.youtubeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flexShrink: 0 }}
                      >
                        <img
                          src={ytThumb(sug.youtubeId)}
                          alt=""
                          width={100}
                          height={56}
                          style={{
                            borderRadius: 5,
                            objectFit: "cover",
                            display: "block",
                            border: "1px solid var(--c-border)",
                          }}
                        />
                      </a>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--c-ink)",
                                marginBottom: 2,
                              }}
                            >
                              For:{" "}
                              <span style={{ color: "var(--c-blue)" }}>
                                {sug.lessonTitle}
                              </span>
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                color: "var(--c-ink3)",
                              }}
                            >
                              {sug.courseId} · ID: {sug.youtubeId} ·{" "}
                              {formatDate(sug.submittedAt)}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: 3,
                              background:
                                sug.status === "pending"
                                  ? "var(--c-amber-dim)"
                                  : sug.status === "approved"
                                    ? "var(--c-green-dim)"
                                    : "var(--c-surface2)",
                              color:
                                sug.status === "pending"
                                  ? "var(--c-amber)"
                                  : sug.status === "approved"
                                    ? "var(--c-green)"
                                    : "var(--c-ink3)",
                            }}
                          >
                            {sug.status}
                          </span>
                        </div>

                        {sug.note && (
                          <p
                            style={{
                              fontSize: 12.5,
                              color: "var(--c-ink2)",
                              lineHeight: 1.6,
                              marginBottom: 8,
                              fontStyle: "italic",
                            }}
                          >
                            &ldquo;{sug.note}&rdquo;
                          </p>
                        )}

                        <a
                          href={sug.youtubeUrl || ytLink(sug.youtubeId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--c-blue)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <ExternalLink size={10} />{" "}
                          {sug.youtubeUrl || ytLink(sug.youtubeId)}
                        </a>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        {sug.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(sug)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                background: "var(--c-green)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => reject(sug.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                background: "none",
                                border: "1px solid var(--c-border)",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                color: "var(--c-ink2)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => remove(sug.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            fontSize: 12,
                            fontFamily: "var(--font-mono)",
                            background: "none",
                            border: "1px solid var(--c-border)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            color: "var(--c-red)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
