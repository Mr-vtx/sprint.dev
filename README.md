# Sprint.dev

Roadmaps for self-taught developers: what to learn, why it matters, and what to build to prove it.

**Live:** https://sprintdev.vercel.app

Progress, notes and streaks are stored on the learner's device. There are no accounts.

## What's in it

- **Roadmaps.** Phases of topics, each with a short "why", subtopics, reading, and a milestone project. Tick topics off and the route fills in. Progress persists in `localStorage`.
- **Courses.** Lesson route with a player, resume-where-you-left-off, mark-complete-and-continue, autosaved notes and keyboard shortcuts. Lessons without a video yet are marked as such, and visitors can suggest one via a prefilled GitHub issue.
- **Offline.** A hand-written service worker (`public/sw.js`) caches the app shell and every course and roadmap page. Lessons hosted on your own storage can be downloaded to IndexedDB for offline playback. YouTube lessons need a connection.
- **⌘K search** across courses, lessons and roadmaps.
- **Light and dark themes**, installable PWA.
- **Admin** (`/admin`): password-protected upload and delete of lesson videos and course PDFs in S3-compatible storage. Off unless configured.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 plus a small token layer in `src/app/globals.css` |
| Offline | Custom service worker, IndexedDB for downloaded videos |
| Storage | S3-compatible (Cloudflare R2, MinIO, AWS) via `@aws-sdk/client-s3`, admin and hosted video only |
| Other | `next-themes`, `lucide-react`, Vercel Analytics |

## Architecture notes

- **Content is code.** Courses and roadmaps live in `src/lib/data.ts` as typed objects. Pages are statically generated from them.
- **Server renders content, client holds learning state.** Route pages are server components; `RoadmapView` and `CourseClient` own progress via `useLocalStorage`.
- **Storage keys** are documented in `src/lib/progress.ts`:
  `vs-done-<courseId>`, `vs-last-<courseId>`, `vs-roadmap-<roadmapId>`, `vs-note-<lessonId>`, `vs-streak`.
- **Design system.** Blue marks where you are, amber marks milestones, green marks done. The vertical "route" (`.route`, `.node` in `globals.css`) is the shared visual device.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The service worker only registers in production builds:

```bash
npm run build
npm start
```

Other scripts:

```bash
npm run typecheck       # tsc --noEmit
npm test                # session, guard and rate-limit tests
npm run check:videos    # confirm every YouTube id in data.ts resolves
```

## Adding content

**A roadmap:** add an object to `roadmaps` in `src/lib/data.ts`. Each phase has topics; each topic has `why`, `subtopics`, `resources`, `estimatedHours` and an optional `milestone`.

**A course:** add an object to `courses` in the same file. Leave `youtubeId` off a lesson until its video exists; the UI shows it as not published yet. Run `npm run check:videos` before committing.

## Admin and storage (optional)

The public site needs no environment variables. For `/admin` and self-hosted video, copy `.env.example` to `.env.local` and set:

- `ADMIN_PASSWORD` (12+ characters) and `SESSION_SECRET` (32+ characters). Admin stays off if either is missing or too short.
- `STORAGE_*` for your bucket. The bucket needs a CORS rule allowing `PUT` from your site's origin, because uploads go straight from the browser to the bucket.

Workflow: upload a video for a lesson in `/admin`, copy the snippet it shows (`videoUrl: "/api/videos/<lessonId>"`) into that lesson in `src/lib/data.ts`, commit.

### Security model

- Sign-in is checked on the server. The password and signing key never reach the browser, and signed-out visitors are never sent the dashboard code.
- Sessions are an HMAC-signed token in an `httpOnly`, `SameSite=Strict` cookie (`__Host-` prefixed in production), valid for 8 hours. Rotating `SESSION_SECRET` signs everyone out.
- Every `/api/admin/*` route verifies the session. State-changing routes also require a same-origin `Origin` header.
- Login is limited to 5 attempts per 15 minutes per IP, in memory. On serverless that is best effort; put Vercel WAF or Upstash in front for a hard limit.
- Upload URLs are presigned, expire in 10 to 15 minutes, sign the exact file size and type, and only accept lesson and course ids that exist in `data.ts`.
- Hosted videos and PDFs are public by design: `/api/videos/<id>` redirects to a one-hour signed URL.
- Responses carry `nosniff`, frame denial, a referrer policy, HSTS, and a CSP limited to `frame-ancestors`, `base-uri`, `form-action` and `object-src`. A full script CSP would need nonces.
- Admin and API responses are never cached, including by the service worker.

Report a vulnerability by opening a private security advisory on GitHub.

## Deploy

Push to GitHub and import the repo in Vercel, or run `npx vercel`.

## Roadmap for the project

- Optional account sync on top of the local-first default
- More roadmaps (backend engineering, networking, Linux)
- Exercises and checkable milestones

## License

MIT
