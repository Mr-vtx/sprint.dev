import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--c-border)", padding: "36px 0 44px" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--c-ink2)", fontSize: 14 }}>
          <Logo size={18} />
          <span>Sprint.dev. Progress stays on your device.</span>
        </div>
        <nav style={{ display: "flex", gap: 20, fontSize: 14, color: "var(--c-ink2)" }} aria-label="Footer">
          <Link href="/roadmaps" className="hover:text-[var(--c-ink)]">Roadmaps</Link>
          <Link href="/courses" className="hover:text-[var(--c-ink)]">Courses</Link>
          <a href="https://github.com/Mr-vtx/sprint.dev" className="hover:text-[var(--c-ink)]" rel="noopener">Source on GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
