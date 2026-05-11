# Sprintdev ⚡

A modern PWA learning platform — structured dev courses & roadmaps.  
Built with **Next.js 15**, **Tailwind CSS v4**, and **next-pwa**.

---

## Features

- 📱 **PWA** — install prompt on open, works offline (pages + assets cached)
- 🎬 **YouTube embeds** — views go to YouTube, player is integrated
- 🗺️ **Interactive roadmaps** — track topic completion with progress bar
- 📚 **Course pages** — lesson list, YouTube player, per-lesson progress
- 🔍 **Search** — filter courses by title or tag
- 🌗 **Dark/light mode** — system default + manual toggle
- 📊 **Progress dashboard** — see in-progress, completed, not started

---

## Stack

| Tool            | Purpose                    |
| --------------- | -------------------------- |
| Next.js 15      | App router, SSR/SSG        |
| Tailwind CSS v4 | Styling (CSS-first config) |
| next-pwa        | Service worker, caching    |
| next-themes     | Dark/light mode            |
| lucide-react    | Icons                      |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:3000
```

For PWA to work (install prompt, service worker), you need to **build and serve**:

```bash
npm run build
npm start
```

---

## Adding Courses

Edit `src/lib/data.ts` — add entries to the `courses` array:

```ts
{
  id: "my-course",
  title: "My New Course",
  description: "Course description",
  instructor: "mr-vtx",
  level: "Beginner",
  duration: "4 weeks",
  lessons: 20,
  rating: 4.8,
  students: 0,
  tags: ["Tag1", "Tag2"],
  color: "purple", // purple | green | orange
  lessons_data: [
    {
      id: "l1",
      title: "Lesson 1 title",
      duration: "15:30",
      youtubeId: "YOUR_YOUTUBE_VIDEO_ID", // from youtube.com/watch?v=THIS_PART
    },
  ],
}
```

## Adding Roadmaps

Add entries to the `roadmaps` array in the same file. Each roadmap has phases,
each phase has topics, each topic can have a `milestone`.

---

## PWA Icons

Replace the placeholder icons in `public/icons/` with real PNG icons:

- icon-72.png, icon-96.png, icon-128.png, icon-192.png, icon-512.png

Use [maskable.app](https://maskable.app/editor) to generate maskable icons.

---

## Deploy

```bash
# Vercel (recommended)
npx vercel

# or push to GitHub and connect to Vercel dashboard
```

Make sure to set `NODE_ENV=production` so the service worker is active.

---

Built by [mr-vtx](https://github.com/mr-vtx) · Sprintdev ⚡
