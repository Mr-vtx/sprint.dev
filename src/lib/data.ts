export type Level = "Beginner" | "Intermediate" | "Advanced";
export type AccentColor = "blue" | "green" | "amber";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  youtubeId?: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: Level;
  duration: string;
  totalLessons: number;
  rating: number;
  students: number;
  tags: string[];
  color: AccentColor;
  lessons: Lesson[];
  progress?: number;
  resources?: { label: string; url: string }[];
}

export interface Topic {
  id: string;
  title: string;
  why: string;
  subtopics: string[];
  resources: string[];
  milestone?: string;
  estimatedHours: number;
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  weeks: string;
  weekRange: string;
  color: AccentColor;
  summary: string;
  totalHours: number;
  topics: Topic[];
}

export interface Roadmap {
  id: string;
  title: string;
  tagline: string;
  description: string;
  targetAudience: string;
  duration: string;
  hoursPerWeek: string;
  totalHours: number;
  level: Level;
  color: AccentColor;
  prerequisites: string[];
  finalProject: string;
  phases: Phase[];
}

export const courses: Course[] = [
  {
    id: "rust-beginner-to-intermediate",
    title: "Rust: Beginner to Intermediate",
    description:
      "The complete structured path from your first Rust line to building async web APIs. Built for developers who know JavaScript or another high-level language.",
    instructor: "mr-vtx",
    level: "Intermediate",
    duration: "8 weeks",
    totalLessons: 12,
    rating: 4.9,
    students: 1240,
    tags: ["Rust", "Systems", "CLI", "Async"],
    color: "amber",
    progress: 35,
    resources: [
      { label: "The Rust Book (free)", url: "https://doc.rust-lang.org/book/" },
      {
        label: "Rustlings exercises",
        url: "https://github.com/rust-lang/rustlings",
      },
      { label: "crates.io", url: "https://crates.io" },
    ],
    lessons: [
      {
        id: "r1",
        title: "Why Rust — the problem it solves",
        duration: "14:20",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r2",
        title: "Installing Rust and the toolchain",
        duration: "08:45",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r3",
        title: "Variables, mutability, and shadowing",
        duration: "18:10",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r4",
        title: "Ownership — the core mental model",
        duration: "28:15",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r5",
        title: "Borrowing and references",
        duration: "24:30",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r6",
        title: "Structs and enums",
        duration: "23:45",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r7",
        title: "Option<T> and Result<T, E>",
        duration: "22:10",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r8",
        title: "Traits and generics",
        duration: "27:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r9",
        title: "Collections and iterators",
        duration: "28:40",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r10",
        title: "Error handling with thiserror + anyhow",
        duration: "20:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r11",
        title: "Async / await and tokio",
        duration: "32:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "r12",
        title: "Building a REST API with Axum",
        duration: "38:20",
        youtubeId: "dQw4w9WgXcQ",
      },
    ],
  },
  {
    id: "nextjs-fullstack",
    title: "Next.js Fullstack Mastery",
    description:
      "Build production-grade web apps with Next.js 15, Tailwind v4, Prisma, and Vercel deployment. From routing to database to ship.",
    instructor: "mr-vtx",
    level: "Intermediate",
    duration: "10 weeks",
    totalLessons: 10,
    rating: 4.8,
    students: 2890,
    tags: ["Next.js", "React", "Fullstack", "Tailwind", "Prisma"],
    color: "blue",
    progress: 72,
    resources: [
      { label: "Next.js docs", url: "https://nextjs.org/docs" },
      { label: "Prisma docs", url: "https://www.prisma.io/docs" },
    ],
    lessons: [
      {
        id: "n1",
        title: "App router — pages, layouts, loading",
        duration: "22:10",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n2",
        title: "Server vs client components",
        duration: "18:30",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n3",
        title: "Data fetching patterns",
        duration: "24:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n4",
        title: "Tailwind v4 — CSS-first config",
        duration: "16:45",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n5",
        title: "Prisma + PostgreSQL setup",
        duration: "28:20",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n6",
        title: "Authentication with NextAuth",
        duration: "30:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n7",
        title: "API routes and server actions",
        duration: "25:10",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n8",
        title: "Optimistic updates + SWR",
        duration: "22:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n9",
        title: "Edge runtime and middleware",
        duration: "19:30",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "n10",
        title: "Deploying to Vercel",
        duration: "14:50",
        youtubeId: "dQw4w9WgXcQ",
      },
    ],
  },
  {
    id: "node-backend",
    title: "Node.js Backend Engineering",
    description:
      "Scalable APIs, WebSockets, job queues, and testing — using Fastify, Prisma, Redis, and PostgreSQL.",
    instructor: "mr-vtx",
    level: "Beginner",
    duration: "7 weeks",
    totalLessons: 8,
    rating: 4.7,
    students: 3450,
    tags: ["Node.js", "API", "Fastify", "Redis", "PostgreSQL"],
    color: "green",
    progress: 15,
    resources: [
      { label: "Fastify docs", url: "https://fastify.dev" },
      { label: "Redis docs", url: "https://redis.io/docs" },
    ],
    lessons: [
      {
        id: "b1",
        title: "REST API design principles",
        duration: "20:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b2",
        title: "Fastify setup and routing",
        duration: "16:40",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b3",
        title: "Middleware and error handling",
        duration: "18:20",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b4",
        title: "Prisma ORM + PostgreSQL",
        duration: "26:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b5",
        title: "Redis — caching and sessions",
        duration: "22:30",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b6",
        title: "WebSockets with ws",
        duration: "24:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b7",
        title: "Job queues with BullMQ",
        duration: "20:45",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "b8",
        title: "Testing with Vitest",
        duration: "18:00",
        youtubeId: "dQw4w9WgXcQ",
      },
    ],
  },
  {
    id: "typescript-pro",
    title: "TypeScript Pro Patterns",
    description:
      "Generics, conditional types, mapped types, utility types, and real-world architecture patterns. For devs who already know basic TypeScript.",
    instructor: "mr-vtx",
    level: "Advanced",
    duration: "6 weeks",
    totalLessons: 6,
    rating: 4.9,
    students: 987,
    tags: ["TypeScript", "Generics", "Architecture"],
    color: "blue",
    progress: 0,
    lessons: [
      {
        id: "t1",
        title: "Generic constraints and inference",
        duration: "22:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "t2",
        title: "Conditional types in depth",
        duration: "19:35",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "t3",
        title: "Mapped and template literal types",
        duration: "17:20",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "t4",
        title: "Discriminated unions",
        duration: "16:00",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "t5",
        title: "Module augmentation",
        duration: "14:30",
        youtubeId: "dQw4w9WgXcQ",
      },
      {
        id: "t6",
        title: "Real-world architecture patterns",
        duration: "30:00",
        youtubeId: "dQw4w9WgXcQ",
      },
    ],
  },
];

export const roadmaps: Roadmap[] = [
  {
    id: "rust-beginner-to-intermediate",
    title: "Rust: Beginner → Intermediate",
    tagline: "The no-fluff 8-week path to writing real Rust",
    description:
      "A week-by-week structured path taking you from 'never written a line of Rust' to building async REST APIs with Axum and sqlx.",
    targetAudience:
      "Developers with JS/Python/any language experience who want to learn Rust seriously",
    duration: "8 weeks",
    hoursPerWeek: "8–12 hrs",
    totalHours: 80,
    level: "Intermediate",
    color: "amber",
    prerequisites: [
      "Comfortable with any programming language (JS, Python, Go, etc.)",
      "Understand what functions, loops, and variables are",
      "Have a terminal and code editor installed",
    ],
    finalProject:
      "A working async REST API: POST /tasks, GET /tasks, DELETE /tasks/:id — backed by PostgreSQL via sqlx, serialised with serde, served by Axum on tokio.",
    phases: [
      {
        id: "phase-1",
        number: 1,
        title: "Language Fundamentals",
        weeks: "1–2",
        weekRange: "Week 1–2",
        color: "amber",
        summary:
          "Rust syntax, basic types, and the ownership model. Don't rush ownership — the rest of the language clicks once it does.",
        totalHours: 18,
        topics: [
          {
            id: "p1-t1",
            title: "Toolchain setup",
            why: "You can't learn Rust without the right tools. Cargo is your build system, package manager, and test runner all in one.",
            subtopics: [
              "Install Rust via rustup",
              "rustc, cargo, rustfmt, clippy",
              "rust-analyzer in VS Code",
              "cargo new, build, run, check",
            ],
            resources: ["rustup.rs", "The Rust Book — Chapter 1"],
            estimatedHours: 2,
            milestone:
              "Create a Cargo project that prints 'Hello, Sprintdev!' and runs with cargo run",
          },
          {
            id: "p1-t2",
            title: "Variables, types, and control flow",
            why: "Rust's type system is stricter than JavaScript. Understanding how types work early prevents confusion later.",
            subtopics: [
              "let, let mut — immutability by default",
              "Shadowing",
              "Scalar types: i32, u64, f64, bool, char",
              "Tuples and arrays",
              "if/else, loop, while, for",
            ],
            resources: ["The Rust Book — Chapters 2–3", "Rustlings exercises"],
            estimatedHours: 4,
            milestone:
              "Build a CLI temperature converter (Celsius ↔ Fahrenheit ↔ Kelvin)",
          },
          {
            id: "p1-t3",
            title: "Ownership — Rust's core concept",
            why: "No garbage collector. Memory is managed by ownership rules enforced at compile time.",
            subtopics: [
              "The stack vs the heap",
              "Ownership rules",
              "Move semantics",
              "Borrowing with &",
              "Mutable references &mut",
              "The borrow checker",
            ],
            resources: [
              "The Rust Book — Chapter 4 (read it twice)",
              "Rustlings — move_semantics exercises",
            ],
            estimatedHours: 6,
            milestone:
              "Write a function that takes a String, modifies it, and returns it",
          },
          {
            id: "p1-t4",
            title: "Structs and enums",
            why: "Enums in Rust are far more powerful than in other languages — they can hold data.",
            subtopics: [
              "Defining structs and impl blocks",
              "&self vs &mut self",
              "#[derive(Debug, Clone)]",
              "Enums with data",
              "Option<T>",
              "match and if let",
            ],
            resources: ["The Rust Book — Chapters 5–6"],
            estimatedHours: 6,
            milestone:
              "Model a BankAccount with deposit, withdraw, and balance methods",
          },
        ],
      },
      {
        id: "phase-2",
        number: 2,
        title: "The Type System in Depth",
        weeks: "3–4",
        weekRange: "Week 3–4",
        color: "green",
        summary:
          "Lifetimes, traits, and generics. This is where Rust starts to feel powerful.",
        totalHours: 20,
        topics: [
          {
            id: "p2-t1",
            title: "Traits",
            why: "Traits are Rust's mechanism for polymorphism — similar to TypeScript interfaces but more powerful.",
            subtopics: [
              "Defining a trait",
              "Implementing traits",
              "Trait bounds",
              "Box<dyn Trait>",
              "Display, Debug, Clone, Iterator",
            ],
            resources: ["The Rust Book — Chapter 10.2"],
            estimatedHours: 6,
            milestone:
              "Build a Shape trait with area() and perimeter(), implement for Circle, Rectangle, Triangle",
          },
          {
            id: "p2-t2",
            title: "Generics and lifetimes",
            why: "Generics let you write flexible code. Lifetimes ensure references are always valid.",
            subtopics: [
              "Generic functions and structs",
              "Monomorphisation",
              "Lifetime annotations",
              "Elision rules",
            ],
            resources: ["The Rust Book — Chapter 10"],
            estimatedHours: 8,
            milestone:
              "Implement a generic Stack<T>. Write a fn longest<'a> with explicit lifetime.",
          },
          {
            id: "p2-t3",
            title: "Collections and iterators",
            why: "Rust's iterator system is elegant and zero-cost.",
            subtopics: [
              "Vec<T>, HashMap<K,V>",
              "String vs &str",
              "map, filter, flat_map",
              "collect, sum, fold",
              "Closures",
            ],
            resources: ["The Rust Book — Chapters 8, 13"],
            estimatedHours: 6,
            milestone:
              "Read a CSV of scores, compute averages, filter, sort — only iterators",
          },
        ],
      },
      {
        id: "phase-3",
        number: 3,
        title: "Error Handling and Ecosystem",
        weeks: "5–6",
        weekRange: "Week 5–6",
        color: "blue",
        summary:
          "Production Rust code is full of Result<T, E>. Handle errors idiomatically, use Cargo's ecosystem, write tests.",
        totalHours: 20,
        topics: [
          {
            id: "p3-t1",
            title: "Idiomatic error handling",
            why: "Rust has no exceptions. All errors are values you return.",
            subtopics: [
              "Result<T, E> deep dive",
              "The ? operator",
              "Custom error enums",
              "thiserror crate",
              "anyhow crate",
            ],
            resources: [
              "The Rust Book — Chapter 9",
              "docs.rs/thiserror",
              "docs.rs/anyhow",
            ],
            estimatedHours: 5,
            milestone:
              "Rewrite a project with proper error handling using thiserror and ?",
          },
          {
            id: "p3-t2",
            title: "Testing",
            why: "Rust's built-in testing is exceptional.",
            subtopics: [
              "#[test] and cargo test",
              "assert!, assert_eq!",
              "Integration tests in tests/",
              "Doc tests",
            ],
            resources: ["The Rust Book — Chapter 11"],
            estimatedHours: 4,
            milestone:
              "Add unit tests, 2 integration tests, cover all error paths",
          },
          {
            id: "p3-t3",
            title: "Key ecosystem crates",
            why: "The Rust ecosystem on crates.io has excellent, well-maintained crates.",
            subtopics: [
              "serde — JSON, TOML, CSV",
              "reqwest — HTTP client",
              "clap — CLI parsing",
              "tokio — async runtime",
            ],
            resources: ["crates.io", "docs.rs"],
            estimatedHours: 8,
            milestone:
              "CLI tool that fetches GitHub user info, deserialises with serde, displays formatted",
          },
        ],
      },
      {
        id: "phase-4",
        number: 4,
        title: "Async and Web APIs",
        weeks: "7–8",
        weekRange: "Week 7–8",
        color: "amber",
        summary: "Async Rust, tokio, Axum, and sqlx. Build the final project.",
        totalHours: 22,
        topics: [
          {
            id: "p4-t1",
            title: "Async / await fundamentals",
            why: "Async Rust lets you write concurrent code that looks sequential.",
            subtopics: [
              "Futures — lazy values",
              "async fn and .await",
              "tokio::main",
              "tokio::spawn",
              "tokio::join! and select!",
            ],
            resources: ["tokio.rs tutorial", "Async Book (async.rs)"],
            estimatedHours: 7,
            milestone: "Fetch 5 URLs concurrently using tokio::join!",
          },
          {
            id: "p4-t2",
            title: "Axum — building web APIs",
            why: "Axum is the most ergonomic web framework in Rust.",
            subtopics: [
              "Router + routes",
              "Extractors: Path, Query, Json, State",
              "Returning responses",
              "Error handling with IntoResponse",
            ],
            resources: ["docs.rs/axum"],
            estimatedHours: 8,
            milestone:
              "Build an in-memory task manager API: POST/GET/DELETE /tasks",
          },
          {
            id: "p4-t3",
            title: "sqlx — async database access",
            why: "sqlx checks your SQL queries at compile time against a real database.",
            subtopics: [
              "PgPool — connection pooling",
              "sqlx::query! macros",
              "Compile-time query checking",
              "Migrations with sqlx-cli",
            ],
            resources: ["docs.rs/sqlx"],
            estimatedHours: 7,
            milestone:
              "Replace in-memory Vec with PostgreSQL via sqlx. This is the final project.",
          },
        ],
      },
    ],
  },
  {
    id: "fullstack-web-dev",
    title: "Fullstack Web Dev",
    tagline: "HTML to production — no gaps",
    description:
      "The complete path from zero to shipping fullstack web applications. HTML, CSS, JavaScript, Node.js, databases, auth, deployment.",
    targetAudience:
      "Complete beginners or self-taught devs with gaps in their knowledge",
    duration: "16 weeks",
    hoursPerWeek: "10–15 hrs",
    totalHours: 160,
    level: "Beginner",
    color: "green",
    prerequisites: [
      "A computer with internet access",
      "Ability to install software",
      "No coding experience required",
    ],
    finalProject:
      "A full social bookmarking app: auth, CRUD, real-time notifications, deployed on a VPS.",
    phases: [
      {
        id: "fs-1",
        number: 1,
        title: "Web Foundations",
        weeks: "1–3",
        weekRange: "Week 1–3",
        color: "green",
        summary: "HTML, CSS, how browsers work, basic JavaScript.",
        totalHours: 35,
        topics: [
          {
            id: "fs-1-t1",
            title: "HTML and the DOM",
            why: "Everything on the web is HTML. Understanding the DOM lets you manipulate it with code.",
            subtopics: [
              "Document structure",
              "Semantic elements",
              "Forms and inputs",
              "The DOM tree",
            ],
            resources: ["MDN HTML docs", "html.spec.whatwg.org"],
            estimatedHours: 8,
            milestone: "Build a static CV/resume page",
          },
          {
            id: "fs-1-t2",
            title: "CSS layout and design",
            why: "CSS controls everything users see.",
            subtopics: [
              "Box model",
              "Flexbox",
              "CSS Grid",
              "Responsive design and media queries",
              "CSS variables",
            ],
            resources: [
              "MDN CSS docs",
              "css-tricks.com/snippets/css/a-guide-to-flexbox",
            ],
            estimatedHours: 14,
            milestone:
              "Build a responsive landing page that looks good on mobile and desktop",
          },
          {
            id: "fs-1-t3",
            title: "JavaScript fundamentals",
            why: "JavaScript is how you make pages interactive.",
            subtopics: [
              "Variables, types, operators",
              "Functions and scope",
              "Arrays and objects",
              "DOM manipulation",
              "Events and listeners",
            ],
            resources: ["javascript.info", "MDN JavaScript docs"],
            estimatedHours: 13,
            milestone: "Build a to-do list that persists to localStorage",
          },
        ],
      },
    ],
  },
];
