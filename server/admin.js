"use strict";
// Admin zone: separate password login (ADMIN_PASSWORD). Dashboard, moderation queue, players, listings, teams,
// comments, system status and an audit log of every admin action.
const A = require("./auth"), V = require("./validate"), { rankText } = require("./jobs");
const META = V.META;
const COOKIE = "adm", HOURS = 12, DAY = 86400000;
const MSK = 3 * 3600000;
const dayKey = t => new Date(t + MSK).toISOString().slice(0, 10);

module.exports = function makeAdmin(ctx) {
  const { db, Http, limit, notify, hooks } = ctx;
  const enabled = () => String(process.env.ADMIN_PASSWORD || "").length >= 8;
  function token() { const exp = Math.floor(Date.now() / 1000) + HOURS * 3600; return exp + "." + A.hmac("admin|" + exp + "|" + process.env.ADMIN_PASSWORD); }
  function isAdmin(req) {
    if (!enabled()) return false;
    const p = String(req.cookies[COOKIE] || "").split(".");
    return p.length === 2 && +p[0] > Date.now() / 1000 && A.safeEq(p[1], A.hmac("admin|" + p[0] + "|" + process.env.ADMIN_PASSWORD));
  }
  function guard(req) { if (!isAdmin(req)) throw new Http(401, "admin_auth"); }
  const cookie = (v, age) => COOKIE + "=" + v + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + age;
  async function audit(req, action, target, note) {
    const id = A.timeId();
    await db.put("al", id, { id, t: Date.now(), action, target: target || "", note: String(note || "").slice(0, 300), ip: req.ip });
  }
  const via = u => u.email ? "email" : u.vk ? "vk" : u.tg ? "telegram" : "?";
  async function seenMap() { const m = {}; for (const r of await db.list("on")) m[r.sk] = r.d.t; return m; }
  function reportView(r) { const o = Object.assign({}, r); if (r.msg && r.msg.media && !r.msg.media.gone) o.mediaUrl = hooks.viewUrl(r.msg.media.key); if (r.post) o.post = Object.assign({}, r.post, { rt: rankText(r.post.r) }); return o; }

  async function login(req) {
    if (!enabled()) throw new Http(503, "admin_off");
    await limit("adm:" + req.ip, 5, 900000);
    if (!A.safeEq(A.hmac("p|" + String(req.json.password || "")), A.hmac("p|" + process.env.ADMIN_PASSWORD))) throw new Http(401, "bad_password");
    await audit(req, "login");
    return { body: { ok: true }, cookies: [cookie(token(), HOURS * 3600)] };
  }

  /* ---------- dashboard ---------- */
  async function overview(req) {
    guard(req);
    const now = Date.now(), users = (await db.list("u")).map(r => r.d), posts = await hooks.loadFeed();
    const teams = (await db.list("t")).map(r => r.d), scrims = (await db.list("s")).map(r => r.d), reports = (await db.list("rep")).map(r => r.d);
    const stats = {}; for (const r of await db.list("st")) stats[r.sk] = r.d;
    const seen = await seenMap();
    const days = []; for (let i = 13; i >= 0; i--) days.push(dayKey(now - i * DAY));
    const signups = {}; for (const u of users) { const k = dayKey(u.created); signups[k] = (signups[k] || 0) + 1; }
    const series = days.map(d => ({ day: d, signups: signups[d] || 0, posts: (stats[d] || {}).posts || 0, msgs: (stats[d] || {}).msgs || 0, active: (stats[d] || {}).active || 0 }));
    const byGame = {}; for (const p of posts) byGame[p.game] = (byGame[p.game] || 0) + 1;
    const today = dayKey(now), st = stats[today] || {};
    return { body: {
      kpi: {
        users: users.length, banned: users.filter(u => u.banned).length,
        new1: users.filter(u => now - u.created < DAY).length, new7: users.filter(u => now - u.created < 7 * DAY).length,
        online: Object.values(seen).filter(t => now - t < 5 * 60000).length, active24: Object.values(seen).filter(t => now - t < DAY).length,
        posts: posts.length, postsToday: st.posts || 0, msgsToday: st.msgs || 0,
        teams: teams.length, scrimsOpen: scrims.filter(s => s.status === "open" || s.status === "requested" || s.status === "confirmed").length, scrimsPlayed: scrims.filter(s => s.status === "played").length,
        reports: reports.filter(r => !r.done).length, disputes: scrims.filter(s => s.status === "disputed").length,
        withEmail: users.filter(u => u.email).length, withSteam: users.filter(u => u.steam).length, withVk: users.filter(u => u.vk).length
      },
      series, byGame,
      system: { mail: hooks.mailMode(), media: hooks.media(), backup: await hooks.backupInfo(), queue: (await db.list("mq")).length, build: process.env.BUILD || "dev" }
    } };
  }

  /* ---------- moderation ---------- */
  async function reports(req) {
    guard(req);
    const all = (await db.list("rep")).map(r => r.d).sort((a, b) => b.t - a.t), done = req.query.done === "1";
    const list = all.filter(r => !!r.done === done).slice(0, 150);
    const counts = {}; for (const r of all) counts[r.target] = (counts[r.target] || 0) + 1;
    return { body: { reports: list.map(r => Object.assign(reportView(r), { against: counts[r.target] || 0 })) } };
  }
  async function disputes(req) {
    guard(req);
    const teams = {}; for (const r of await db.list("t")) teams[r.sk] = r.d;
    const list = (await db.list("s")).map(r => r.d).filter(s => s.status === "disputed");
    return { body: { disputes: list.map(s => ({ id: s.id, game: s.game, at: s.at, format: s.format, host: (teams[s.host] || {}).name || "?", guest: (teams[s.guest] || {}).name || "?", rep: s.rep })) } };
  }

  /* ---------- players ---------- */
  async function users(req) {
    guard(req);
    const q = String(req.query.q || "").trim().toLowerCase(), f = String(req.query.f || "all"), now = Date.now();
    const seen = await seenMap(), reps = {}; for (const r of await db.list("rep")) if (!r.d.done) reps[r.d.target] = (reps[r.d.target] || 0) + 1;
    let list = (await db.list("u")).map(r => r.d);
    if (q) list = list.filter(u => u.nick.toLowerCase().includes(q) || (u.email || "").includes(q) || u.id === q || (u.profile.dc || "").includes(q) || (u.profile.tg || "").toLowerCase().includes(q));
    if (f === "banned") list = list.filter(u => u.banned);
    if (f === "new") list = list.filter(u => now - u.created < 7 * DAY);
    if (f === "reported") list = list.filter(u => reps[u.id]);
    if (f === "online") list = list.filter(u => seen[u.id] && now - seen[u.id] < 5 * 60000);
    list.sort((a, b) => f === "reported" ? (reps[b.id] || 0) - (reps[a.id] || 0) : b.created - a.created);
    return { body: { total: list.length, users: list.slice(0, 200).map(u => ({ id: u.id, nick: u.nick, email: u.email || "", via: via(u), created: u.created, seen: seen[u.id] || 0, banned: !!u.banned,
      posts: Object.keys(u.posts || {}).length, games: u.profile.games || [], reports: reps[u.id] || 0, steam: !!u.steam, faceit: u.faceit ? u.faceit.nick : null })) } };
  }
  async function user(req, id) {
    guard(req);
    const u = await db.get("u", id); if (!u) throw new Http(404, "gone");
    const seen = await db.get("on", id), now = Date.now();
    const reps = (await db.list("rep")).map(r => r.d), teams = [];
    for (const g of Object.keys(u.teams || {})) { const tm = await db.get("t", u.teams[g]); if (tm) teams.push({ id: tm.id, name: tm.name, tag: tm.tag, game: tm.game, role: (tm.members.find(m => m.uid === id) || {}).trole }); }
    const comments = (await db.list("cm:" + id)).map(r => r.d).sort((a, b) => b.t - a.t);
    const chats = (await db.list("cv:" + id)).length, log = (await db.list("al")).map(r => r.d).filter(x => x.target === id).slice(-20).reverse();
    return { body: { user: {
      id: u.id, nick: u.nick, email: u.email || "", via: via(u), created: u.created, seen: seen ? seen.t : 0, lang: u.lang, banned: u.banned || null,
      profile: u.profile, ver: u.ver || {}, steam: u.steam ? u.steam.id : null, faceit: u.faceit ? u.faceit.nick : null, tg: u.tg ? u.tg.name : null, vk: u.vk ? String(u.vk.id) : null,
      posts: (await hooks.myPosts(u)).map(p => Object.assign({}, p, { rt: rankText(p.r) })), archive: (u.archive || []).slice(0, 10), teams, comments, chats, favs: (u.favs || []).length, blocked: (u.blocked || []).length,
      against: reps.filter(r => r.target === id).sort((a, b) => b.t - a.t).slice(0, 30).map(reportView), by: reps.filter(r => r.from === id).length, warns: u.warns || 0, log, online: !!(seen && now - seen.t < 5 * 60000)
    } } };
  }

  /* ---------- content ---------- */
  async function posts(req) {
    guard(req);
    const list = (await hooks.loadFeed()).slice().sort((a, b) => b.t0 - a.t0);
    return { body: { posts: list.map(p => ({ id: p.id, uid: p.uid, nick: p.nick, game: p.game, mode: p.mode, r: p.r, rt: rankText(p.r), ver: !!p.ver, note: p.note, have: p.have, t0: p.t0, exp: p.exp, c: p.c, on: !!p.on })) } };
  }
  async function teamsList(req) {
    guard(req);
    const scr = (await db.list("s")).map(r => r.d);
    const list = (await db.list("t")).map(r => r.d).map(tm => ({ id: tm.id, name: tm.name, tag: tm.tag, game: tm.game, created: tm.created, members: tm.members.map(m => ({ uid: m.uid, nick: m.nick, trole: m.trole })),
      apps: (tm.apps || []).length, st: Object.assign({ rating: 1000, w: 0, l: 0, d: 0, ns: 0 }, tm.st || {}), scrims: scr.filter(s => s.host === tm.id || s.guest === tm.id).length }));
    list.sort((a, b) => b.st.rating - a.st.rating);
    return { body: { teams: list } };
  }
  async function comments(req) {
    guard(req);
    const names = {}; const rows = (await db.scan()).filter(r => r.pk.startsWith("cm:"));
    const out = rows.map(r => { const d = JSON.parse(r.d); return { about: r.pk.slice(3), from: d.from, nick: d.nick, text: d.text, t: d.t }; }).sort((a, b) => b.t - a.t).slice(0, 200);
    for (const c of out) { if (!(c.about in names)) { const u = await db.get("u", c.about); names[c.about] = u ? u.nick : "?"; } c.aboutNick = names[c.about]; }
    return { body: { comments: out } };
  }
  async function system(req) {
    guard(req);
    const b = await hooks.backupInfo(), q = (await db.list("mq")).map(r => r.d);
    return { body: { mail: hooks.mailMode(), media: hooks.media(), build: process.env.BUILD || "dev", backup: b, backupUrl: b && b.day && hooks.media() ? hooks.viewUrl("backup/" + b.day + ".jsonl.gz") : null,
      queue: q.length, queueFailed: q.filter(m => m.tries).length, env: { telegram: !!process.env.TELEGRAM_BOT_TOKEN, vk: !!process.env.VK_CLIENT_ID, faceit: !!process.env.FACEIT_API_KEY, smtp: hooks.mailMode() === "smtp" } } };
  }
  async function auditLog(req) {
    guard(req);
    return { body: { log: (await db.list("al")).map(r => r.d).slice(-300).reverse() } };
  }

  /* ---------- actions ---------- */
  async function banUser(u, reason, days) {
    u.banned = { t: Date.now(), reason: String(reason || "").slice(0, 200), until: days ? Date.now() + days * DAY : 0 }; u.sv = (u.sv || 0) + 1;
    for (const g of Object.keys(u.posts || {})) await db.del("p", u.posts[g]);
    for (const row of await db.list("pr")) if (row.d.uid === u.id) await db.del("pr", row.sk);
    u.posts = {};
    await db.put("u", u.id, u);
    hooks.feedDirty();
  }
  async function removePost(id, notifyUser) {
    const p = await db.get("p", String(id)); if (!p) return false;
    await db.del("p", p.id);
    const u = await db.get("u", p.uid);
    if (u && u.posts && u.posts[p.game] === p.id) { delete u.posts[p.game]; await db.put("u", u.id, u); }
    hooks.feedDirty();
    if (u && notifyUser) await notify(u.id, "mod_post", [], { type: "feed" });
    return true;
  }
  async function removeMsg(cid, id) {
    const m = await db.get("m:" + cid, id); if (!m) return;
    if (m.media) { try { await hooks.delMedia(m.media.key); } catch (e) {} m.media.gone = true; }
    m.text = m.text ? "[удалено модератором]" : ""; await db.put("m:" + cid, id, m);
  }
  async function findUser(x) {
    let u = await db.get("u", String(x));
    if (!u) { const idx = await db.get("n", V.nickKey(String(x).trim())); u = idx ? await db.get("u", idx.uid) : null; }
    if (!u) throw new Http(404, "gone");
    return u;
  }
  async function act(req) {
    guard(req);
    const b = req.json, a = String(b.action || "");
    if (b.report) {
      const r = await db.get("rep", String(b.report)); if (!r) throw new Http(404, "gone");
      const target = await db.get("u", r.target);
      if (a === "remove" || a === "ban") {
        if (r.msg) await removeMsg(r.msg.cid, r.msg.id);
        if (r.post) await removePost(r.post.id, a === "remove");
      }
      if ((a === "warn" || (a === "remove" && r.msg)) && target) { target.warns = (target.warns || 0) + 1; await db.put("u", target.id, target); await notify(target.id, "mod_warn", [], { type: "feed" }); }
      if (a === "ban" && target) await banUser(target, r.reason, Number(b.days) || 0);
      r.done = { a, t: Date.now() }; await db.put("rep", r.id, r);
      // the same decision closes other open reports on the same listing / message
      for (const row of await db.list("rep")) { const o = row.d; if (o.done || o.id === r.id) continue; if ((r.post && o.post && o.post.id === r.post.id) || (r.msg && o.msg && o.msg.id === r.msg.id)) { o.done = { a, t: Date.now(), dup: r.id }; await db.put("rep", o.id, o); } }
      await audit(req, "report:" + a, r.target, (r.targetNick || "") + " · " + r.reason);
      return { body: { ok: true } };
    }
    if (b.user) {
      const u = await findUser(b.user);
      if (a === "ban") { await banUser(u, b.reason, Number(b.days) || 0); }
      else if (a === "unban") { delete u.banned; await db.put("u", u.id, u); }
      else if (a === "warn") { u.warns = (u.warns || 0) + 1; await db.put("u", u.id, u); await notify(u.id, "mod_warn", [], { type: "feed" }); }
      else if (a === "logout") { u.sv = (u.sv || 0) + 1; await db.put("u", u.id, u); }
      else if (a === "rename") {
        const nick = V.nick(b.nick), key = V.nickKey(nick), old = V.nickKey(u.nick);
        if (key !== old) { if (await db.get("n", key)) throw new Http(409, "nick_taken"); await db.put("n", key, { uid: u.id }); await db.del("n", old); }
        u.nick = nick; await db.put("u", u.id, u); await hooks.renamed(u);
        for (const p of await hooks.myPosts(u)) { p.nick = nick; await db.put("p", p.id, p); }
        hooks.feedDirty();
      }
      else if (a === "unverify") { u.ver = {}; await db.put("u", u.id, u); }
      else if (a === "delete") { if (String(b.confirm || "") !== u.nick) throw new Http(400, "confirm"); await hooks.removeAccount(u); }
      else throw new Http(400, "bad_action");
      await audit(req, "user:" + a, u.id, u.nick + (b.reason ? " · " + b.reason : "") + (b.days ? " · " + b.days + " дн." : "") + (b.nick ? " → " + b.nick : ""));
      return { body: { ok: true, nick: u.nick } };
    }
    if (b.post) { const ok = await removePost(b.post, true); await audit(req, "post:remove", String(b.post), b.note); return { body: { ok } }; }
    if (b.comment) { await db.del("cm:" + String(b.comment.uid), String(b.comment.from)); await audit(req, "comment:remove", String(b.comment.uid), b.comment.text); return { body: { ok: true } }; }
    if (b.team) {
      const tm = await db.get("t", String(b.team)); if (!tm) throw new Http(404, "gone");
      if (a === "disband") await hooks.disband(tm);
      else if (a === "reset") { tm.st = null; await db.put("t", tm.id, tm); hooks.teamsDirty(); }
      else throw new Http(400, "bad_action");
      await audit(req, "team:" + a, tm.id, tm.name);
      return { body: { ok: true } };
    }
    if (b.scrim) {
      const s = await db.get("s", String(b.scrim)); if (!s || s.status !== "disputed") throw new Http(404, "gone");
      if (a === "void") await db.del("s", s.id);
      else if (a === "restore") { s.status = "confirmed"; delete s.rep; await db.put("s", s.id, s); }
      else throw new Http(400, "bad_action");
      hooks.teamsDirty();
      await audit(req, "scrim:" + a, s.id);
      return { body: { ok: true } };
    }
    if (a === "backup") { const r = await hooks.backup(); await audit(req, "backup", "", JSON.stringify(r).slice(0, 200)); return { body: r || {} }; }
    if (a === "announce") {
      // a notification to everybody (shown under the bell); for important news only
      const text = String(b.text || "").trim().slice(0, 200); if (text.length < 5) throw new Http(400, "empty");
      let n = 0; for (const r of await db.list("u")) { if (r.d.banned) continue; const id = A.timeId(); await db.put("nt:" + r.sk, id, { id, k: "admin", a: [text], go: null, t: Date.now(), read: false }); const nc = await db.get("nc", r.sk); await db.put("nc", r.sk, { n: ((nc && nc.n) || 0) + 1 }); n++; }
      await audit(req, "announce", "", text);
      return { body: { ok: true, sent: n } };
    }
    throw new Http(400, "bad_action");
  }

  const ID = "([A-Za-z0-9_-]{4,40})";
  const routes = [
    ["POST", /^\/api\/admin\/login$/, login],
    ["POST", /^\/api\/admin\/logout$/, async () => ({ body: { ok: true }, cookies: [cookie("", 0)] })],
    ["GET", /^\/api\/admin\/overview$/, overview],
    ["GET", /^\/api\/admin\/reports$/, reports],
    ["GET", /^\/api\/admin\/disputes$/, disputes],
    ["GET", /^\/api\/admin\/users$/, users],
    ["GET", new RegExp("^/api/admin/users/" + ID + "$"), user],
    ["GET", /^\/api\/admin\/posts$/, posts],
    ["GET", /^\/api\/admin\/teams$/, teamsList],
    ["GET", /^\/api\/admin\/comments$/, comments],
    ["GET", /^\/api\/admin\/system$/, system],
    ["GET", /^\/api\/admin\/log$/, auditLog],
    ["POST", /^\/api\/admin\/act$/, act]
  ];
  return { routes };
};
