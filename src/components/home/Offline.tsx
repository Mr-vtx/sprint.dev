import { Check, Wifi } from "lucide-react";

const WORKS = [
  "Pages you have already opened, once the app is installed",
  "Your progress, notes, and streak, which never leave your device",
  "Lessons hosted on Sprint.dev, after you tap Download",
];
const NEEDS = ["YouTube lessons", "Pages you have not opened yet"];

export default function Offline() {
  return (
    <section className="container" style={{ marginBottom: 112 }}>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div>
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 800, marginBottom: 14 }}>Built for patchy connections</h2>
          <p style={{ color: "var(--c-ink2)", fontSize: 16.5, lineHeight: 1.65, maxWidth: 440 }}>
            Install Sprint.dev from your browser and keep learning on the bus. Here is exactly what works without a connection.
          </p>
        </div>
        <div className="grid sm:grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Works offline</h3>
            <ul style={{ listStyle: "none", display: "grid", gap: 12 }}>
              {WORKS.map((w) => (
                <li key={w} style={{ display: "flex", gap: 10, fontSize: 15, color: "var(--c-ink2)" }}>
                  <Check size={16} style={{ color: "var(--c-green)", flexShrink: 0, marginTop: 3 }} /> {w}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Needs a connection</h3>
            <ul style={{ listStyle: "none", display: "grid", gap: 12 }}>
              {NEEDS.map((w) => (
                <li key={w} style={{ display: "flex", gap: 10, fontSize: 15, color: "var(--c-ink2)" }}>
                  <Wifi size={16} style={{ color: "var(--c-ink3)", flexShrink: 0, marginTop: 3 }} /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
