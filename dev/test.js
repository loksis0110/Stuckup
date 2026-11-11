"use strict";
// API tests against the function handler with the in-memory database: node --test dev/test.js
const test = require("node:test"), assert = require("node:assert");
process.env.SMOKE_KEY = "k-test";
const { handler } = require("../server/index.js");

function client() {
  let jar = "";
  return async function call(method, path, body, headers) {
    const ev = { httpMethod: method, path, headers: Object.assign({ Host: "localhost", Cookie: jar }, body !== undefined ? { "Content-Type": "application/json" } : {}, headers || {}), requestContext: { identity: { sourceIp: "1.2.3.4" } } };
    if (body !== undefined) ev.body = JSON.stringify(body);
    const r = await handler(ev, {});
    const sc = r.multiValueHeaders && r.multiValueHeaders["Set-Cookie"];
    if (sc) jar = sc.map(c => c.split(";")[0]).filter(c => !c.endsWith("=")).join("; ");
    let json = null; try { json = JSON.parse(r.isBase64Encoded ? Buffer.from(r.body, "base64").toString() : r.body); } catch (e) {}
    return { status: r.statusCode, json, raw: r };
  };
}
async function signup(c, email, nick) {
  const r = await c("POST", "/api/auth/register", { email, password: "password1", nick, consent: true });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.match(r.json.devCode, /^\d{6}$/);
  const v = await c("POST", "/api/auth/verify", { email, code: r.json.devCode });
  assert.equal(v.status, 200, JSON.stringify(v.json));
  return v.json.user;
}
const POST = { game: "cs2", mode: "premier", r: { sys: "premier", v: 15200 }, roles: ["awp"], have: 3, region: "ru", mic: true, note: "Ищем пятого на вечер", dur: 180, style: "serious", stags: ["adult", "nomat"] };

test("health and static", async () => {
  const c = client();
  const h = await c("GET", "/api/health"); assert.equal(h.status, 200); assert.equal(h.json.ok, true);
  assert.equal((await c("GET", "/api/nope")).status, 404);
  assert.equal((await c("PATCH", "/api/me", {})).status, 405);
});

test("registration validation", async () => {
  const c = client();
  const bad = async (b, code) => { const r = await c("POST", "/api/auth/register", Object.assign({ email: "a@b.ru", password: "password1", nick: "Tester", consent: true }, b)); assert.equal(r.json.error, code); };
  await bad({ consent: false }, "need_consent");
  await bad({ email: "nope" }, "bad_email");
  await bad({ password: "short" }, "short_password");
  await bad({ nick: "a" }, "bad_nick");
  await bad({ nick: "has space" }, "bad_nick");
  await bad({ nick: "Admin" }, "nick_taken");
  const r = await c("POST", "/api/auth/register", { email: "x@b.ru", password: "password1", nick: "Xx_1", consent: true }, { "Content-Type": "text/plain" });
  assert.equal(r.status, 415);
  const o = await c("POST", "/api/auth/register", { email: "x@b.ru", password: "password1", nick: "Xx_1", consent: true }, { Origin: "https://evil.example" });
  assert.equal(o.json.error, "bad_origin");
});

test("full flow: sign up, profile, listing, feed, moderation tools", async () => {
  const a = client(), b = client(), anon = client();
  const ua = await signup(a, "alice@example.com", "Alice");
  assert.equal(ua.nick, "Alice"); assert.equal(ua.profile.onboarded, false);

  // wrong code handling
  const r0 = await b("POST", "/api/auth/register", { email: "bob@example.com", password: "password1", nick: "alice", consent: true });
  assert.equal(r0.json.error, "nick_taken");
  const r1 = await b("POST", "/api/auth/register", { email: "bob@example.com", password: "password1", nick: "Bob", consent: true });
  const wrong = await b("POST", "/api/auth/verify", { email: "bob@example.com", code: r1.json.devCode === "000000" ? "000001" : "000000" });
  assert.equal(wrong.json.error, "bad_code"); assert.equal(wrong.json.left, 4);
  const ub = (await b("POST", "/api/auth/verify", { email: "bob@example.com", code: r1.json.devCode })).json.user;
  assert.equal((await b("POST", "/api/auth/register", { email: "alice@example.com", password: "password1", nick: "Zed", consent: true })).json.error, "email_taken");

  // listing needs a contact
  assert.equal((await a("POST", "/api/posts", POST)).json.error, "need_contact");
  assert.equal((await a("PUT", "/api/me", { profile: { dc: "Bad Name!" } })).json.error, "bad_dc");
  const pm = await a("PUT", "/api/me", { profile: { dc: "@Alice.GG", tg: "https://t.me/alice_gg", games: ["cs2", "nope"], time: ["evening"], adult: true, onboarded: true, ranks: { cs2: { premier: { v: 15000 }, faceit: { elo: 99999 } }, dota: { medal: { t: 3, s: 9 } } }, roles: { cs2: ["awp", "zzz"] }, evil: "<script>" } });
  assert.equal(pm.status, 200);
  const pr = pm.json.user.profile;
  assert.equal(pr.dc, "alice.gg"); assert.equal(pr.tg, "alice_gg"); assert.deepEqual(pr.games, ["cs2"]); assert.equal(pr.evil, undefined);
  assert.deepEqual(pr.ranks.cs2, { premier: { sys: "premier", v: 15000 } }); assert.deepEqual(pr.ranks.dota.medal, { sys: "medal", t: 3, s: 1 }); assert.deepEqual(pr.roles.cs2, ["awp"]);

  assert.equal((await a("POST", "/api/posts", Object.assign({}, POST, { note: "заходи https://discord.gg/abc" }))).json.error, "no_links");
  assert.equal((await a("POST", "/api/posts", Object.assign({}, POST, { r: { sys: "faceit", elo: 2000 } }))).json.error, "need_rank");
  const cp = await a("POST", "/api/posts", POST);
  assert.equal(cp.status, 200, JSON.stringify(cp.json));
  const post = cp.json.post;
  assert.equal(post.nick, "Alice"); assert.deepEqual(post.c, { dc: "alice.gg", tg: "alice_gg" }); assert.deepEqual(post.stags, ["adult", "nomat"]);
  assert.equal(cp.json.user.profile.ranks.cs2.premier.v, 15200);

  // feed: contacts hidden for guests, visible for members
  const fa = await anon("GET", "/api/posts"); assert.equal(fa.json.posts.length, 1); assert.equal(fa.json.posts[0].c, null); assert.equal(fa.json.posts[0].hasC, true);
  const fb = await b("GET", "/api/posts"); assert.deepEqual(fb.json.posts[0].c, { dc: "alice.gg", tg: "alice_gg" });

  // one listing per game: a new one replaces the old
  const cp2 = await a("POST", "/api/posts", Object.assign({}, POST, { mode: "faceit", r: { sys: "faceit", elo: 1500 } }));
  assert.equal(cp2.json.replaced, true); assert.equal(cp2.json.post.extra[0].sys, "premier");
  assert.equal((await anon("GET", "/api/posts")).json.posts.length, 1);
  const p2 = cp2.json.post;

  // profile changes flow into live listings
  const ch = await a("PUT", "/api/me", { nick: "Alice2", profile: { tg: "", adult: false } });
  assert.equal(ch.status, 200, JSON.stringify(ch.json));
  const fb2 = (await b("GET", "/api/posts")).json.posts[0];
  assert.equal(fb2.nick, "Alice2"); assert.deepEqual(fb2.c, { dc: "alice.gg", tg: "" }); assert.deepEqual(fb2.stags, ["nomat"]);
  assert.equal((await a("PUT", "/api/me", { profile: { dc: "" } })).json.error, "need_contact");
  assert.equal((await b("PUT", "/api/me", { nick: "alice2" })).json.error, "nick_taken");
  assert.equal((await b("PUT", "/api/me", { nick: "Alice" })).status, 200); // the old name is free again

  // other people cannot touch my listing
  assert.equal((await b("DELETE", "/api/posts/" + p2.id, {})).json.error, "forbidden");
  assert.equal((await b("POST", "/api/posts/" + p2.id + "/renew", {})).json.error, "forbidden");
  assert.equal((await anon("POST", "/api/posts", POST)).json.error, "auth");
  const rn = await a("POST", "/api/posts/" + p2.id + "/renew", {}); assert.ok(rn.json.post.exp >= p2.exp);

  // favourites, block list, reports
  const fv = await b("POST", "/api/favs", { uid: ua.id, on: true }); assert.deepEqual(fv.json.favs, [{ id: ua.id, nick: "Alice2" }]);
  assert.equal((await b("POST", "/api/favs", { uid: ub.id, on: true })).json.error, "bad_target");
  const bl = await b("POST", "/api/blocks", { uid: ua.id, on: true }); assert.equal(bl.json.favs.length, 0); assert.equal(bl.json.blocked.length, 1);
  assert.equal((await b("POST", "/api/blocks", { uid: ua.id, on: false })).json.blocked.length, 0);
  assert.equal((await b("POST", "/api/reports", { postId: p2.id, reason: "spam" })).status, 200);
  assert.equal((await a("POST", "/api/reports", { postId: p2.id, reason: "spam" })).json.error, "bad_target");

  // sessions
  const me1 = await a("GET", "/api/me"); assert.equal(me1.json.user.nick, "Alice2"); assert.equal(me1.json.posts.length, 1);
  await a("POST", "/api/auth/logout", {});
  assert.equal((await a("GET", "/api/me")).json.user, null);
  assert.equal((await a("POST", "/api/auth/login", { email: "alice@example.com", password: "wrong-pass" })).json.error, "bad_login");
  const li = await a("POST", "/api/auth/login", { email: " Alice@Example.com ", password: "password1" }); assert.equal(li.status, 200); assert.equal(li.json.posts.length, 1);

  // delete listing, delete account
  assert.equal((await a("DELETE", "/api/posts/" + p2.id, {})).status, 200);
  assert.equal((await anon("GET", "/api/posts")).json.posts.length, 0);
  await a("POST", "/api/posts", POST);
  assert.equal((await a("DELETE", "/api/me", { password: "nope-nope" })).json.error, "bad_password");
  assert.equal((await a("DELETE", "/api/me", { password: "password1" })).status, 200);
  assert.equal((await anon("GET", "/api/posts")).json.posts.length, 0);
  assert.equal((await a("GET", "/api/me")).json.user, null);
  assert.equal((await a("POST", "/api/auth/login", { email: "alice@example.com", password: "password1" })).json.error, "bad_login");
});

test("password reset (smoke mailbox) and code attempts", async () => {
  const c = client(), email = "r1@smoke.stuckup.invalid", H = { "x-smoke-key": "k-test" };
  await signup(c, email, "Resetter");
  assert.equal((await client()("POST", "/api/auth/reset", { email: "someone@example.com" })).json.error, "mail_off");
  const d = client();
  const rs = await d("POST", "/api/auth/reset", { email }, H); assert.match(rs.json.devCode, /^\d{6}$/);
  for (let i = 0; i < 4; i++) assert.equal((await d("POST", "/api/auth/reset/confirm", { email, code: "abc", password: "newpassword" })).json.error, "bad_code");
  assert.equal((await d("POST", "/api/auth/reset/confirm", { email, code: "abc", password: "newpassword" })).json.error, "code_tries");
  assert.equal((await d("POST", "/api/auth/reset/confirm", { email, code: rs.json.devCode, password: "newpassword" })).json.error, "code_tries");
  // old session is still valid until the password actually changes
  assert.equal((await c("GET", "/api/me")).json.user.nick, "Resetter");
});
