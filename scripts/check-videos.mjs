// Verifies every YouTube id in src/lib/data.ts points at a real, embeddable video.
// Usage: npm run check:videos
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/data.ts", import.meta.url), "utf8");
const ids = [...src.matchAll(/id:\s*"([^"]+)"[^}]*?youtubeId:\s*"([^"]+)"/g)].map((m) => ({ lesson: m[1], yt: m[2] }));

let bad = 0;
for (const { lesson, yt } of ids) {
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${yt}`);
  if (res.ok) {
    const { title } = await res.json();
    console.log(`ok   ${lesson.padEnd(4)} ${yt}  ${title}`);
  } else {
    bad++;
    console.log(`FAIL ${lesson.padEnd(4)} ${yt}  HTTP ${res.status}`);
  }
}
console.log(`\n${ids.length - bad}/${ids.length} videos resolve.`);
process.exit(bad ? 1 : 0);
