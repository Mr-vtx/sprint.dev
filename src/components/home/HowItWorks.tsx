const STEPS = [
  { title: "Learn the topic", body: "Each topic says why it matters, lists what to cover, and links the best free reading. Watch the matching course lessons if you want video." },
  { title: "Build the milestone", body: "Every topic ends with a small project, like a temperature converter or a BankAccount struct. Building it is the point." },
  { title: "Check it off", body: "Mark the topic done and the route fills in. Your next topic is highlighted, so you always know where to pick up." },
];

export default function HowItWorks() {
  return (
    <section className="container" style={{ marginBottom: 112 }}>
      <h2 style={{ fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 800, marginBottom: 36, maxWidth: 560 }}>
        Not a playlist. A route with something to build at every stop.
      </h2>
      <ol className="grid md:grid-cols-3 gap-10" style={{ listStyle: "none" }}>
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ borderTop: "2px solid var(--c-ink)", paddingTop: 18 }}>
            <p className="label" style={{ marginBottom: 10 }}>Step {i + 1}</p>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
            <p style={{ color: "var(--c-ink2)", fontSize: 15.5, lineHeight: 1.65 }}>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
