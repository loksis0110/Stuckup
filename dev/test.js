"use strict";
// API tests against the function handler with the in-memory database: node --test dev/test.js
const test = require("node:test"), assert = require("node:assert");
process.env.SMOKE_KEY = "k-test";
const { handler } = require("../server/index.js");

let ipN = 0;
function client() {
  let jar = ""; const ip = "10.0.0." + (++ipN);
  return async function call(method, path, body, headers) {
    const qi = path.indexOf("?"), query = qi < 0 ? {} : Object.fromEntries(new URLSearchParams(path.slice(qi + 1))); if (qi >= 0) path = path.slice(0, qi);
    const ev = { httpMethod: method, path, queryStringParameters: query, headers: Object.assign({ Host: "localhost", Cookie: jar }, body !== undefined ? { "Content-Type": "application/json" } : {}, headers || {}), requestContext: { identity: { sourceIp: ip } } };
    if (headers && headers.__query) { ev.queryStringParameters = headers.__query; delete ev.headers.__query; }
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

test("chat, presence, archive", async () => {
  const a = client(), b = client();
  const ua = await signup(a, "c1@example.com", "ChatA"), ub = await signup(b, "c2@example.com", "ChatB");
  assert.equal((await a("POST", "/api/chats/" + ua.id, { text: "hi" })).json.error, "bad_target");
  assert.equal((await a("POST", "/api/chats/" + ub.id, { text: "   " })).json.error, "empty");
  const m1 = await a("POST", "/api/chats/" + ub.id, { text: "Привет! Идём в премьер?" }); assert.equal(m1.status, 200, JSON.stringify(m1.json));
  await a("POST", "/api/chats/" + ub.id, { text: "Я на авп" });
  const lb = await b("GET", "/api/chats?beat=1"); assert.equal(lb.json.chats.length, 1); assert.equal(lb.json.chats[0].unread, 2); assert.equal(lb.json.chats[0].nick, "ChatA");
  const cb = await b("GET", "/api/chats/" + ua.id); assert.equal(cb.json.msgs.length, 2); assert.equal(cb.json.msgs[0].me, false);
  assert.equal((await b("GET", "/api/chats")).json.chats[0].unread, 0);
  const r = await b("POST", "/api/chats/" + ua.id, { text: "Го" });
  const ca = await a("GET", "/api/chats/" + ub.id + "?after=" + m1.json.msg.id); assert.equal(ca.json.msgs.length, 2); assert.equal(ca.json.msgs[1].text, "Го");
  await b("POST", "/api/blocks", { uid: ua.id, on: true });
  assert.equal((await a("POST", "/api/chats/" + ub.id, { text: "эй" })).json.error, "blocked_by");
  assert.equal((await b("POST", "/api/chats/" + ua.id, { text: "эй" })).json.error, "you_blocked");
  // presence + archive
  await b("PUT", "/api/me", { profile: { dc: "chat.b" } });
  const p = await b("POST", "/api/posts", POST);
  await new Promise(r2 => setTimeout(r2, 10));
  const feed = (await a("GET", "/api/posts")).json.posts.find(x2 => x2.id === p.json.post.id); assert.equal(feed.on, true);
  const d = await b("DELETE", "/api/posts/" + p.json.post.id, {}); assert.equal(d.json.archive.length, 1); assert.equal(d.json.archive[0].reason, "closed");
  assert.equal((await b("GET", "/api/me")).json.user.archive[0].game, "cs2");
});

test("notifications, stack, comments", async () => {
  const a = client(), b = client();
  const ua = await signup(a, "n1@example.com", "Nata"), ub = await signup(b, "n2@example.com", "Boris");
  const st = await a("POST", "/api/stack", { uid: ub.id, game: "cs2", on: true });
  assert.deepEqual(st.json.stacks, { cs2: [{ id: ub.id, nick: "Boris" }] });
  assert.equal((await a("GET", "/api/me")).json.user.stacks.cs2.length, 1);
  assert.equal((await b("GET", "/api/chats")).json.notifs, 1);
  const nl = await b("GET", "/api/notifs"); assert.equal(nl.json.notifs[0].k, "stack"); assert.deepEqual(nl.json.notifs[0].a, ["Nata", "cs2"]);
  await b("POST", "/api/notifs/read", {}); assert.equal((await b("GET", "/api/chats")).json.notifs, 0);
  assert.deepEqual((await a("POST", "/api/stack", { game: "cs2", clear: true })).json.stacks, {});
  // comments need a two-way conversation
  assert.equal((await a("PUT", "/api/comments/" + ub.id, { text: "Отличный тиммейт" })).json.error, "need_chat");
  await a("POST", "/api/chats/" + ub.id, { text: "привет" });
  assert.equal((await a("PUT", "/api/comments/" + ub.id, { text: "Отличный тиммейт" })).json.error, "need_chat");
  await b("POST", "/api/chats/" + ua.id, { text: "го" });
  const c1 = await a("PUT", "/api/comments/" + ub.id, { text: "Отличный тиммейт" }); assert.equal(c1.status, 200, JSON.stringify(c1.json)); assert.equal(c1.json.comments.length, 1);
  const c2 = await a("PUT", "/api/comments/" + ub.id, { text: "Отличный тиммейт, зову ещё" }); assert.equal(c2.json.comments.length, 1); assert.match(c2.json.comments[0].text, /зову/);
  assert.equal((await client()("GET", "/api/comments/" + ub.id)).json.can, false);
  assert.equal((await a("DELETE", "/api/comments/" + ua.id, { from: ub.id })).status, 200); // nothing there, but allowed on my page
  const other = client(); await signup(other, "n3@example.com", "Third");
  assert.equal((await other("DELETE", "/api/comments/" + ub.id, { from: ua.id })).json.error, "forbidden");
  assert.equal((await b("DELETE", "/api/comments/" + ub.id, { from: ua.id })).json.comments.length, 0); // owner removes it
  await a("PUT", "/api/comments/" + ub.id, { text: "Снова я" });
  assert.equal((await a("DELETE", "/api/comments/" + ub.id, {})).json.comments.length, 0); // author removes own
});

test("teams and scrims", async () => {
  const a = client(), b = client(), c = client();
  const ua = await signup(a, "t1@example.com", "CapA"), ub = await signup(b, "t2@example.com", "CapB"), uc = await signup(c, "t3@example.com", "Rookie");
  assert.equal((await a("POST", "/api/teams", { name: "Night Raid", tag: "n!", game: "cs2" })).json.error, "team_err_tag");
  const ta = (await a("POST", "/api/teams", { name: "Night Raid", tag: "nrd", game: "cs2", open: ["awp"], style: "serious", desc: "Играем по вечерам" })).json.team;
  assert.equal(ta.tag, "NRD"); assert.equal(ta.members[0].trole, "captain");
  assert.equal((await a("POST", "/api/teams", { name: "Second", tag: "SEC", game: "cs2" })).json.error, "team_have");
  assert.equal((await b("POST", "/api/teams", { name: "Volga Five", tag: "NRD", game: "cs2" })).json.error, "tag_taken");
  const tb = (await b("POST", "/api/teams", { name: "Volga Five", tag: "VLG", game: "cs2" })).json.team;
  // application
  assert.equal((await c("POST", "/api/teams/" + ta.id + "/apply", { role: "awp", msg: "Возьмите" })).status, 200);
  let lst = (await a("GET", "/api/teams")).json; assert.equal(lst.teams.find(t => t.id === ta.id).apps.length, 1);
  assert.equal((await b("GET", "/api/teams")).json.teams.find(t => t.id === ta.id).apps.length, 0); // other teams do not see applications
  assert.deepEqual((await c("GET", "/api/teams")).json.apps, [ta.id]);
  assert.equal((await b("POST", "/api/teams/" + ta.id + "/apps", { uid: uc.id, accept: true })).json.error, "no_rights");
  assert.equal((await a("POST", "/api/teams/" + ta.id + "/apps", { uid: uc.id, accept: true })).status, 200);
  lst = (await c("GET", "/api/teams")).json; const tA = lst.teams.find(t => t.id === ta.id);
  assert.equal(tA.members.length, 2); assert.deepEqual(tA.open, []); assert.equal((await c("GET", "/api/notifs")).json.notifs[0].k, "app_ok");
  assert.equal((await a("POST", "/api/teams/" + ta.id + "/role", { uid: uc.id, trole: "coach" })).status, 200);
  assert.equal((await c("POST", "/api/teams/" + ta.id + "/role", { uid: ua.id, trole: "sub" })).json.error, "no_rights");
  // scrim slot → booking → veto → result → rating
  const at = Date.now() + 300000;
  assert.equal((await c("POST", "/api/scrims", { team: ta.id, at, format: "bo1" })).json.error, "no_rights");
  const sl = (await a("POST", "/api/scrims", { team: ta.id, at, format: "bo1", note: "Тренируем Mirage" })).json.scrim;
  assert.equal((await client()("GET", "/api/teams")).json.scrims.length, 1);
  assert.equal((await a("POST", "/api/scrims/" + sl.id + "/book", { team: ta.id })).json.error, "bad_target");
  assert.equal((await b("POST", "/api/scrims/" + sl.id + "/book", { team: tb.id })).json.scrim.status, "requested");
  assert.equal((await a("GET", "/api/notifs")).json.notifs[0].k, "book");
  assert.equal((await a("POST", "/api/scrims/" + sl.id + "/answer", { accept: true })).json.scrim.status, "confirmed");
  assert.equal((await b("POST", "/api/scrims/" + sl.id + "/veto", { map: "Mirage" })).json.error, "veto_turn");
  const order = ["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust II"]; let last;
  for (let i = 0; i < 6; i++) { last = await (i % 2 ? b : a)("POST", "/api/scrims/" + sl.id + "/veto", { map: order[i] }); assert.equal(last.status, 200, JSON.stringify(last.json)); }
  assert.deepEqual(last.json.scrim.maps, ["Overpass"]);
  assert.equal((await c("POST", "/api/scrims/" + sl.id + "/veto", { map: "Overpass" })).json.error, "veto_closed");
  const rp = await c("POST", "/api/scrims/" + sl.id + "/report", { beh: "ok", games: [{ map: "Overpass", a: 13, b: 9 }] }); // the coach may report
  assert.equal(rp.json.scrim.status, "reported");
  assert.equal((await a("POST", "/api/scrims/" + sl.id + "/confirm", { ok: true })).json.error, "report_own");
  const cf = await b("POST", "/api/scrims/" + sl.id + "/confirm", { ok: true, beh: "late" });
  assert.equal(cf.json.scrim.status, "played"); assert.equal(cf.json.scrim.res.delta, 16);
  lst = (await a("GET", "/api/teams")).json;
  const A2 = lst.teams.find(t => t.id === ta.id).st, B2 = lst.teams.find(t => t.id === tb.id).st;
  assert.equal(A2.rating, 1016); assert.equal(B2.rating, 984); assert.equal(A2.w, 1); assert.equal(B2.l, 1); assert.equal(A2.late, 1); assert.equal(B2.ok, 1);
  // leaving, kicking, disbanding
  assert.equal((await a("POST", "/api/teams/" + ta.id + "/leave", {})).json.error, "captain_leave");
  assert.equal((await c("POST", "/api/teams/" + ta.id + "/leave", {})).status, 200);
  assert.equal((await c("POST", "/api/teams", { name: "Own Team", tag: "OWN", game: "cs2" })).status, 200);
  const sl2 = (await a("POST", "/api/scrims", { team: ta.id, at, format: "bo3" })).json.scrim;
  await b("POST", "/api/scrims/" + sl2.id + "/book", { team: tb.id });
  assert.equal((await b("DELETE", "/api/teams/" + tb.id, {})).status, 200);
  lst = (await a("GET", "/api/teams")).json;
  assert.equal(lst.teams.some(t => t.id === tb.id), false); assert.equal(lst.scrims.find(s => s.id === sl2.id).status, "open");
  assert.equal((await b("POST", "/api/teams", { name: "Volga Reborn", tag: "VLG", game: "cs2" })).status, 200); // tag is free again
});

test("admin zone", async () => {
  const adm = client(), a = client(), b = client();
  assert.equal((await adm("POST", "/api/admin/login", { password: "whatever-pass" })).json.error, "admin_off");
  process.env.ADMIN_PASSWORD = "correct-horse-battery";
  assert.equal((await adm("GET", "/api/admin/overview")).json.error, "admin_auth");
  assert.equal((await adm("POST", "/api/admin/login", { password: "wrong-password" })).json.error, "bad_password");
  assert.equal((await adm("POST", "/api/admin/login", { password: "correct-horse-battery" })).status, 200);
  const ua = await signup(a, "ad1@example.com", "Spammer"); await signup(b, "ad2@example.com", "Citizen");
  await a("PUT", "/api/me", { profile: { dc: "spam.king" } });
  const post = (await a("POST", "/api/posts", POST)).json.post;
  await b("POST", "/api/reports", { postId: post.id, reason: "spam" });
  let ov = (await adm("GET", "/api/admin/overview")).json;
  const rp = ov.reports.find(r => r.targetNick === "Spammer"); assert.ok(rp); assert.ok(ov.stats.users >= 2);
  assert.equal((await a("POST", "/api/admin/act", { report: rp.id, action: "ban" })).json.error, "admin_auth"); // a normal session is not enough
  assert.equal((await adm("POST", "/api/admin/act", { report: rp.id, action: "ban" })).status, 200);
  assert.equal((await a("GET", "/api/me")).json.user, null);
  assert.equal((await a("POST", "/api/auth/login", { email: "ad1@example.com", password: "password1" })).json.error, "banned");
  assert.equal((await b("GET", "/api/posts")).json.posts.some(p => p.uid === ua.id), false);
  ov = (await adm("GET", "/api/admin/overview")).json; assert.equal(ov.reports.some(r => r.targetNick === "Spammer"), false); assert.equal(ov.banned[0].nick, "Spammer");
  assert.equal((await adm("POST", "/api/admin/act", { user: "spammer", action: "unban" })).json.nick, "Spammer");
  assert.equal((await a("POST", "/api/auth/login", { email: "ad1@example.com", password: "password1" })).status, 200);
  delete process.env.ADMIN_PASSWORD;
});

test("telegram sign-in, notifications, rank verification (mocked services)", async () => {
  process.env.TELEGRAM_BOT_TOKEN = "123:abc"; process.env.TG_HOOK_SECRET = "hook-secret"; process.env.FACEIT_API_KEY = "fc-key";
  const sent = [], real = globalThis.fetch;
  globalThis.fetch = async (url, opt) => {
    url = String(url);
    const res = (body, status) => ({ ok: (status || 200) < 400, status: status || 200, json: async () => body, text: async () => (typeof body === "string" ? body : JSON.stringify(body)) });
    if (url.includes("api.telegram.org")) { sent.push(JSON.parse(opt.body)); return res({ ok: true }); }
    if (url.includes("steamcommunity.com/openid")) return res("ns:http://specs.openid.net/auth/2.0\nis_valid:true\n");
    if (url.includes("api.opendota.com")) return res({ rank_tier: 54 });
    if (url.includes("open.faceit.com")) return url.includes("nickname=Ghost") ? res({}, 404) : res({ player_id: "pid-1", nickname: "KaitoFC", games: { cs2: { faceit_elo: 2140, skill_level: 10 } } });
    throw new Error("unexpected fetch " + url);
  };
  try {
    const hook = (text, from) => client()("POST", "/api/tg/hook", { message: { chat: { id: from.id, type: "private" }, from, text } }, { "x-telegram-bot-api-secret-token": "hook-secret" });
    const a = client();
    assert.equal((await client()("POST", "/api/tg/hook", { message: {} }, {})).json.error, "forbidden");
    // sign in through the bot → new account
    const st = (await a("POST", "/api/auth/tg/start", {})).json; assert.match(st.url, /t\.me\/Stuckup_gg_bot\?start=login_/);
    assert.equal((await a("POST", "/api/auth/tg/poll", { token: st.token })).json.wait, true);
    await hook("/start login_" + st.token, { id: 777, username: "kaito_tg", language_code: "ru" });
    assert.match(sent[sent.length - 1].text, /Готово/);
    const pl = (await a("POST", "/api/auth/tg/poll", { token: st.token })).json; assert.ok(pl.signup); assert.equal(pl.suggest, "kaito_tg");
    assert.equal((await a("POST", "/api/auth/social/finish", { token: pl.signup, nick: "TgKaito", consent: false })).json.error, "need_consent");
    const fin = await a("POST", "/api/auth/social/finish", { token: pl.signup, nick: "TgKaito", consent: true }); assert.equal(fin.status, 200, JSON.stringify(fin.json));
    assert.equal(fin.json.user.tg.name, "kaito_tg"); assert.equal(fin.json.user.hasPass, false);
    // second sign-in finds the same account
    const a2 = client(), st2 = (await a2("POST", "/api/auth/tg/start", {})).json; await hook("/start login_" + st2.token, { id: 777, username: "kaito_tg" });
    assert.equal((await a2("POST", "/api/auth/tg/poll", { token: st2.token })).json.user.nick, "TgKaito");
    // an e-mail account links Telegram and gets notifications there
    const b = client(), ub = await signup(b, "tgb@example.com", "MailUser");
    const lk = (await b("POST", "/api/me/tg/link", {})).json; assert.match(lk.url, /start=link_/);
    await hook("/start link_" + lk.token, { id: 888, first_name: "Boris" });
    assert.equal((await b("POST", "/api/auth/tg/poll", { token: lk.token })).json.user.tg.name, "Boris");
    const n0 = sent.length; await a("POST", "/api/stack", { uid: ub.id, game: "cs2", on: true });
    assert.equal(sent.length, n0 + 1); assert.equal(sent[n0].chat_id, 888); assert.match(sent[n0].text, /TgKaito зовёт вас в стак/);
    await a("POST", "/api/chats/" + ub.id, { text: "го в 20:00?" }); assert.match(sent[sent.length - 1].text, /Новое сообщение от TgKaito/);
    const n1 = sent.length; await a("POST", "/api/chats/" + ub.id, { text: "ау" }); assert.equal(sent.length, n1); // not more than one ping per conversation in 10 minutes
    await hook("/stop", { id: 888 }); await a("POST", "/api/stack", { uid: ub.id, game: "dota", on: true }); assert.equal(sent.filter(m => m.chat_id === 888).length, 4); // link reply, stack, message, /stop reply — nothing after /stop
    // steam → dota medal
    const sc = await b("GET", "/api/link/steam/start"); assert.equal(sc.raw.statusCode, 302); assert.match(sc.raw.headers.Location, /steamcommunity\.com\/openid\/login/);
    const cbq = { "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001", "openid.return_to": "http://localhost/api/link/steam/cb", "openid.sig": "x" };
    const ev = await b("GET", "/api/link/steam/cb", undefined, { __query: cbq });
    assert.equal(ev.raw.statusCode, 302); assert.equal(ev.raw.headers.Location, "/#/linked/steam");
    let meB = (await b("GET", "/api/me")).json.user; assert.deepEqual(meB.profile.ranks.dota.medal, { sys: "medal", t: 4, s: 4 }); assert.equal(meB.ver.medal.src, "steam");
    await b("PUT", "/api/me", { profile: { dc: "mail.user", ranks: { dota: { medal: { t: 7 } } } } }); // cannot overwrite a verified rank by hand
    meB = (await b("GET", "/api/me")).json.user; assert.equal(meB.profile.ranks.dota.medal.t, 4);
    const pd = (await b("POST", "/api/posts", { game: "dota", mode: "ranked", r: { sys: "medal", t: 7 }, roles: ["pos1"], dur: 60 })).json.post; assert.equal(pd.ver, true); assert.equal(pd.r.t, 4);
    // faceit
    assert.equal((await b("POST", "/api/link/faceit", { nick: "Ghost" })).json.error, "faceit_none");
    const fc = (await b("POST", "/api/link/faceit", { nick: "kaitofc" })).json.user; assert.equal(fc.faceit, "KaitoFC"); assert.equal(fc.profile.ranks.cs2.faceit.elo, 2140);
    assert.equal((await a("POST", "/api/link/faceit", { nick: "kaitofc" })).json.error, "link_taken");
    assert.equal((await b("DELETE", "/api/link/faceit", {})).json.user.faceit, null);
    // deleting a password-less account asks for the nickname
    assert.equal((await a("DELETE", "/api/me", { confirm: "wrong" })).json.error, "bad_password");
    assert.equal((await a("DELETE", "/api/me", { confirm: "TgKaito" })).status, 200);
  } finally { globalThis.fetch = real; delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.FACEIT_API_KEY; }
});
