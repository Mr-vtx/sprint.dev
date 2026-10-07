/** Extract an 11-character YouTube video id from a URL or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const clean = input.trim();
  if (/^[\w-]{11}$/.test(clean)) return clean;
  const m = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}
