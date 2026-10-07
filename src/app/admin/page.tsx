import { cookies } from "next/headers";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import LoginForm from "@/components/admin/LoginForm";
import Dashboard from "@/components/admin/Dashboard";
import { adminConfigured, COOKIE_NAME, verifySession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/**
 * The session is checked on the server. Visitors who aren't signed in get the
 * login form and never receive the dashboard code.
 */
export default async function AdminPage() {
  const jar = await cookies();
  const authed = verifySession(jar.get(COOKIE_NAME)?.value);

  return (
    <>
      <header style={{ borderBottom: "1px solid var(--c-border)" }}>
        <div className="container" style={{ height: 60, display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label="Back to site"><Logo /></Link>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Admin</span>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        {authed ? <Dashboard /> : <LoginForm configured={adminConfigured()} />}
      </main>
    </>
  );
}
