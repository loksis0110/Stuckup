"use strict";
// End-to-end check of a deployed site: node dev/smoke.js https://host   (needs SMOKE_KEY for the sign-up part)
const base = process.argv[2].replace(/\/$/, ""), key = process.env.SMOKE_KEY || "";
let jar = "";
async function call(method, path, body) {
  const h = { Cookie: jar, "x-smoke-key": key }; if (body !== undefined) h["Content-Type"] = "application/json";
  const res = await fetch(base + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined });
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  if (sc.length) jar = sc.map(c => c.split(";")[0]).filter(c => !c.endsWith("=")).join("; ");
  const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, json, text, headers: res.headers };
}
function ok(cond, what, detail) { if (!cond) { console.log("SMOKE FAIL:", what, detail === undefined ? "" : JSON.stringify(detail).slice(0, 400)); process.exit(1); } console.log("  ok:", what); }
(async () => {
  const page = await call("GET", "/");
  ok(page.status === 200 && /<title>[^<]*Stuckup/.test(page.text), "home page", { status: page.status, type: page.headers.get("content-type"), enc: page.headers.get("content-encoding"), head: page.text.slice(0, 120) });
  for (const p of ["/robots.txt", "/favicon.svg", "/fonts/Onest.woff", "/rules", "/privacy"]) { const r = await call("GET", p); ok(r.status === 200, "static " + p, r.status); }
  ok((await call("GET", "/no-such-page")).status === 404, "404 page");
  const email = "t" + Date.now().toString(36) + "@smoke.stuckup.invalid", nick = "smoke_" + Date.now().toString(36).slice(-6);
  const reg = await call("POST", "/api/auth/register", { email, password: "smoke-password-1", nick, consent: true });
  ok(reg.status === 200 && reg.json && /^\d{6}$/.test(reg.json.devCode || ""), "register", reg.json || reg.text.slice(0, 200));
  const ver = await call("POST", "/api/auth/verify", { email, code: reg.json.devCode });
  ok(ver.status === 200 && ver.json.user && jar, "verify + session cookie", ver.json);
  const prof = await call("PUT", "/api/me", { profile: { dc: "smoke.test", games: ["cs2"], onboarded: true } });
  ok(prof.status === 200 && prof.json.user.profile.dc === "smoke.test", "save profile", prof.json);
  const post = await call("POST", "/api/posts", { game: "cs2", mode: "premier", r: { sys: "premier", v: 12345 }, roles: ["entry"], have: 2, region: "ru", mic: true, note: "smoke test", dur: 60, style: "fun", stags: [] });
  ok(post.status === 200 && post.json.post, "create listing", post.json);
  const saved = jar; jar = "";
  const feed = await call("GET", "/api/posts");
  const mine = feed.json && feed.json.posts.find(p => p.id === post.json.post.id);
  ok(feed.status === 200 && mine && mine.c === null && mine.hasC === true, "feed for guests hides contacts", mine || feed.json);
  jar = saved;
  const me = await call("GET", "/api/me");
  ok(me.status === 200 && me.json.user && me.json.posts.length === 1, "session restored", me.json);
  const del = await call("DELETE", "/api/me", { password: "smoke-password-1" });
  ok(del.status === 200, "delete account", del.json);
  jar = "";
  const feed2 = await call("GET", "/api/posts");
  ok(feed2.status === 200 && !feed2.json.posts.some(p => p.id === post.json.post.id), "listing removed with the account");
  console.log("SMOKE OK");
})().catch(e => { console.log("SMOKE FAIL: exception", e && e.message); process.exit(1); });
