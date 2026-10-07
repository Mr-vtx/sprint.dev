/**
 * Progress storage keys and plain readers.
 * Everything lives in localStorage on the user's device. No account.
 *
 *   vs-done-<courseId>     string[]  completed lesson ids
 *   vs-last-<courseId>     string    last lesson opened (resume)
 *   vs-roadmap-<roadmapId> string[]  completed topic ids
 *   vs-note-<lessonId>    string    lesson notes
 *   vs-streak              StreakData
 */
export const courseDoneKey = (courseId: string) => `vs-done-${courseId}`;
export const roadmapDoneKey = (roadmapId: string) => `vs-roadmap-${roadmapId}`;

export function readDone(key: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
