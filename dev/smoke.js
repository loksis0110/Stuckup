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
  // chat media through Object Storage: a second account, a signed upload, then download by the receiver
  const health = (await call("GET", "/api/health")).json;
  if (health.media) {
    const mainJar = jar; jar = "";
    const e2 = "t2" + Date.now().toString(36) + "@smoke.stuckup.invalid", r2 = await call("POST", "/api/auth/register", { email: e2, password: "smoke-password-1", nick: "smk2_" + Date.now().toString(36).slice(-6), consent: true });
    const v2 = await call("POST", "/api/auth/verify", { email: e2, code: r2.json.devCode }), jar2 = jar, uid2 = v2.json.user.id; jar = mainJar;
    const bytes = Buffer.from("stuckup-media-check-" + Date.now());
    const slot = await call("POST", "/api/chats/" + uid2 + "/upload", { kind: "voice", type: "audio/webm", size: bytes.length, dur: 1 });
    ok(slot.status === 200 && slot.json.url, "media upload slot", slot.json);
    const put = await fetch(slot.json.url.startsWith("http") ? slot.json.url : base + slot.json.url, { method: "PUT", headers: { "Content-Type": "audio/webm", Origin: base }, body: bytes });
    ok(put.ok, "upload to storage with the signed link", { status: put.status, body: (await put.text()).slice(0, 300) });
    const msg = await call("POST", "/api/chats/" + uid2, { media: slot.json.key });
    ok(msg.status === 200 && msg.json.msg.media, "media message", msg.json);
    jar = jar2; const got = await call("GET", "/api/chats/" + me.json.user.id); jar = mainJar;
    const m = got.json.msgs.pop(), dl = await fetch(m.media.url.startsWith("http") ? m.media.url : base + m.media.url, { headers: { Origin: base } });
    const back = Buffer.from(await dl.arrayBuffer());
    ok(dl.ok && back.equals(bytes), "receiver downloads the file", { status: dl.status, cors: dl.headers.get("access-control-allow-origin") });
    jar = jar2; await call("DELETE", "/api/me", { password: "smoke-password-1" }); jar = mainJar;
  }
  const del = await call("DELETE", "/api/me", { password: "smoke-password-1" });
  ok(del.status === 200, "delete account", del.json);
  jar = "";
  const feed2 = await call("GET", "/api/posts");
  ok(feed2.status === 200 && !feed2.json.posts.some(p => p.id === post.json.post.id), "listing removed with the account");
  console.log("SMOKE OK");
})().catch(e => { console.log("SMOKE FAIL: exception", e && e.message); process.exit(1); });
