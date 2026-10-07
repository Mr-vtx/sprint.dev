"use client";

import { useState } from "react";

export default function LoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) return window.location.reload();
      const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(error);
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  };

  if (!configured)
    return (
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Admin is switched off</h1>
        <p style={{ color: "var(--c-ink2)", fontSize: 15.5, lineHeight: 1.65 }}>
          Set <code className="code-inline">ADMIN_PASSWORD</code> (12+ characters) and <code className="code-inline">SESSION_SECRET</code> (32+ characters) on the server, then redeploy. See <code className="code-inline">.env.example</code>.
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} style={{ maxWidth: 380, display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800 }}>Sign in</h1>
      <div>
        <label htmlFor="pw" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
        <input
          id="pw" type="password" autoComplete="current-password" autoFocus required
          className="search-input" style={{ paddingLeft: 14 }}
          value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error}
        />
      </div>
      <p role="alert" style={{ fontSize: 14, color: "var(--c-red)", minHeight: 20 }}>{error}</p>
      <button className="btn btn-primary" disabled={busy || !password}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
