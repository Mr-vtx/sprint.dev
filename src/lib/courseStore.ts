
import { courses as STATIC, type Course, type Lesson } from "./data";

const K = {
  lessons: "vs:lessons",
  courses: "vs:courses",
  suggest: "vs:suggest",
} as const;

export interface LessonData {
  youtubeId?: string;
  videoUrl?:  string;
  duration?:  string;
  title?:     string;
}

export interface ExtraLesson extends Lesson {
  addedAt: number;
}

export interface CourseExtra {
  extraLessons: ExtraLesson[];
}

export type VideoSuggestion = {
  id:        string;
  courseId:  string;
  lessonId:  string;      
  lessonTitle: string;
  youtubeUrl: string;
  youtubeId:  string;
  note:       string;     
  submittedAt: number;
  status:     "pending" | "approved" | "rejected";
};

function readLessons(): Record<string, LessonData> {
  try { return JSON.parse(localStorage.getItem(K.lessons) ?? "{}"); } catch { return {}; }
}
function readCourses(): Record<string, CourseExtra> {
  try { return JSON.parse(localStorage.getItem(K.courses) ?? "{}"); } catch { return {}; }
}
function readSuggestions(): VideoSuggestion[] {
  try { return JSON.parse(localStorage.getItem(K.suggest) ?? "[]"); } catch { return []; }
}

function writeLessons(d: Record<string, LessonData>) {
  try { localStorage.setItem(K.lessons, JSON.stringify(d)); } catch {}
}
function writeCourses(d: Record<string, CourseExtra>) {
  try { localStorage.setItem(K.courses, JSON.stringify(d)); } catch {}
}
function writeSuggestions(d: VideoSuggestion[]) {
  try { localStorage.setItem(K.suggest, JSON.stringify(d)); } catch {}
}


export function getMergedCourses(): Course[] {
  if (typeof window === "undefined") return STATIC;

  const lessonMap  = readLessons();
  const courseMap  = readCourses();

  return STATIC.map((course) => {
    const mergedLessons: Lesson[] = course.lessons.map((l) => {
      const over = lessonMap[l.id];
      if (!over) return l;
      return {
        ...l,
        youtubeId: over.youtubeId ?? l.youtubeId,
        videoUrl:  over.videoUrl  ?? l.videoUrl,
        duration:  over.duration  ?? l.duration,
        title:     over.title     ?? l.title,
      };
    });

    const extra = courseMap[course.id]?.extraLessons ?? [];
    const all   = [...mergedLessons, ...extra];

    return { ...course, lessons: all, totalLessons: all.length };
  });
}

export function setLessonData(lessonId: string, patch: Partial<LessonData>): void {
  const d = readLessons();
  d[lessonId] = { ...(d[lessonId] ?? {}), ...patch };
  writeLessons(d);
}

export function clearLessonData(lessonId: string): void {
  const d = readLessons();
  delete d[lessonId];
  writeLessons(d);
}

export function getLessonData(lessonId: string): LessonData | null {
  return readLessons()[lessonId] ?? null;
}

export function getAllLessonData(): Record<string, LessonData> {
  return readLessons();
}

export function addExtraLesson(courseId: string, lesson: Omit<ExtraLesson, "addedAt">): void {
  const d = readCourses();
  const existing = d[courseId]?.extraLessons ?? [];
  d[courseId] = { extraLessons: [...existing, { ...lesson, addedAt: Date.now() }] };
  writeCourses(d);
}

export function removeExtraLesson(courseId: string, lessonId: string): void {
  const d = readCourses();
  if (!d[courseId]) return;
  d[courseId].extraLessons = d[courseId].extraLessons.filter((l) => l.id !== lessonId);
  writeCourses(d);
}

export function getExtraLessons(courseId: string): ExtraLesson[] {
  return readCourses()[courseId]?.extraLessons ?? [];
}

export function submitSuggestion(s: Omit<VideoSuggestion, "id" | "submittedAt" | "status">): void {
  const all = readSuggestions();
  all.unshift({ ...s, id: `sug-${Date.now()}`, submittedAt: Date.now(), status: "pending" });
  writeSuggestions(all);
}

export function getSuggestions(): VideoSuggestion[] {
  return readSuggestions();
}

export function updateSuggestionStatus(id: string, status: VideoSuggestion["status"]): void {
  const all = readSuggestions().map((s) => s.id === id ? { ...s, status } : s);
  writeSuggestions(all);
}

export function deleteSuggestion(id: string): void {
  writeSuggestions(readSuggestions().filter((s) => s.id !== id));
}

export function approveSuggestion(sug: VideoSuggestion): void {
  updateSuggestionStatus(sug.id, "approved");
  if (sug.lessonId !== "new") {
    setLessonData(sug.lessonId, { youtubeId: sug.youtubeId });
  }
}

export function parseYouTubeId(input: string): string | null {
  const clean = input.trim();
  if (/^[\w-]{11}$/.test(clean)) return clean;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?#\s]{11})/,
  ];
  for (const p of patterns) {
    const m = clean.match(p);
    if (m) return m[1];
  }
  return null;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
