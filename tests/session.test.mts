// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.ADMIN_PASSWORD = "correct horse battery";
process.env.SESSION_SECRET = "x".repeat(40);

const { createSession, verifySession, checkPassword, adminConfigured, safeEqual } = await import("../src/lib/server/session.ts");
const { rateLimit } = await import("../src/lib/server/rateLimit.ts");
const { sameOrigin, guardAdmin } = await import("../src/lib/server/adminGuard.ts");
const { COOKIE_NAME } = await import("../src/lib/server/session.ts");

test("configured only with strong secrets", () => {
  assert.equal(adminConfigured(), true);
});

test("password check", () => {
  assert.equal(checkPassword("correct horse battery"), true);
  assert.equal(checkPassword("wrong"), false);
  assert.equal(checkPassword(""), false);
  assert.equal(safeEqual("a", "a"), true);
  assert.equal(safeEqual("a", "ab"), false);
});

test("valid session verifies, tampered and expired ones do not", () => {
  const t = createSession()!;
  assert.equal(verifySession(t), true);
  assert.equal(verifySession(t + "x"), false);
  assert.equal(verifySession(t.replace(/^./, (c) => (c === "A" ? "B" : "A"))), false);
  assert.equal(verifySession(t, Date.now() + 9 * 3600_000), false);
  assert.equal(verifySession(""), false);
  assert.equal(verifySession(undefined), false);
  assert.equal(verifySession("a.b.c"), false);
});

test("token signed with another secret is rejected", () => {
  const t = createSession()!;
  process.env.SESSION_SECRET = "y".repeat(40);
  assert.equal(verifySession(t), false);
  process.env.SESSION_SECRET = "x".repeat(40);
});

test("fails closed when secrets are weak or missing", () => {
  const pw = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = "short";
  assert.equal(adminConfigured(), false);
  assert.equal(checkPassword("short"), false);
  process.env.ADMIN_PASSWORD = pw;
  delete process.env.SESSION_SECRET;
  assert.equal(createSession(), null);
  process.env.SESSION_SECRET = "x".repeat(40);
});

test("rate limit blocks after the max", () => {
  for (let i = 0; i < 5; i++) assert.equal(rateLimit("t", 5, 60_000).ok, true);
  assert.equal(rateLimit("t", 5, 60_000).ok, false);
});

test("guard: no cookie 401, cookie ok, mutating needs same origin", async () => {
  const req = (headers: Record<string, string>) => new Request("https://site.test/api/admin/files", { headers });
  assert.equal(guardAdmin(req({}))?.status, 401);
  const cookie = `${COOKIE_NAME}=${createSession()}`;
  assert.equal(guardAdmin(req({ cookie })), null);
  assert.equal(guardAdmin(req({ cookie }), { mutating: true })?.status, 403);
  assert.equal(guardAdmin(req({ cookie, origin: "https://evil.test", host: "site.test" }), { mutating: true })?.status, 403);
  assert.equal(guardAdmin(req({ cookie, origin: "https://site.test", host: "site.test" }), { mutating: true }), null);
  assert.equal(sameOrigin(req({ origin: "not a url", host: "site.test" })), false);
});
