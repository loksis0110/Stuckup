"use strict";
// Admin zone: separate password login (ADMIN_PASSWORD), moderation queue, bans.
const A = require("./auth");
const COOKIE = "adm", HOURS = 12;

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

  async function login(req) {
    if (!enabled()) throw new Http(503, "admin_off");
    await limit("adm:" + req.ip, 5, 900000);
    if (!A.safeEq(A.hmac("p|" + String(req.json.password || "")), A.hmac("p|" + process.env.ADMIN_PASSWORD))) throw new Http(401, "bad_password");
    return { body: { ok: true }, cookies: [cookie(token(), HOURS * 3600)] };
  }
  async function overview(req) {
    guard(req);
    const now = Date.now(), users = (await db.list("u")).map(r => r.d), posts = (await db.list("p")).map(r => r.d).filter(p => p.exp > now);
    const teams = (await db.list("t")).map(r => r.d), scrims = (await db.list("s")).map(r => r.d), reports = (await db.list("rep")).map(r => r.d);
    const nick = id => { const t = teams.find(x => x.id === id); return t ? t.name : "?"; };
    return { body: {
      stats: { users: users.length, new24: users.filter(u => now - u.created < 86400000).length, posts: posts.length, teams: teams.length, played: scrims.filter(s => s.status === "played").length, banned: users.filter(u => u.banned).length },
      reports: reports.filter(r => !r.done).sort((a, b) => b.t - a.t).slice(0, 100).map(r => r.msg && r.msg.media && hooks.viewUrl ? Object.assign({}, r, { mediaUrl: hooks.viewUrl(r.msg.media.key) }) : r),
      disputes: scrims.filter(s => s.status === "disputed").map(s => ({ id: s.id, game: s.game, at: s.at, host: nick(s.host), guest: nick(s.guest), rep: s.rep })),
      banned: users.filter(u => u.banned).map(u => ({ id: u.id, nick: u.nick, reason: u.banned.reason || "", t: u.banned.t })),
      recent: users.sort((a, b) => b.created - a.created).slice(0, 30).map(u => ({ id: u.id, nick: u.nick, created: u.created, via: u.email ? "email" : u.tg ? "telegram" : u.vk ? "vk" : "?" }))
    } };
  }
  async function banUser(u, reason) {
    u.banned = { t: Date.now(), reason: String(reason || "").slice(0, 200) }; u.sv = (u.sv || 0) + 1;
    for (const g of Object.keys(u.posts || {})) await db.del("p", u.posts[g]);
    u.posts = {};
    await db.put("u", u.id, u);
    hooks.feedDirty();
  }
  async function act(req) {
    guard(req);
    const b = req.json, a = b.action;
    if (b.report) {
      const r = await db.get("rep", String(b.report)); if (!r) throw new Http(404, "gone");
      const target = await db.get("u", r.target);
      if (r.msg && (a === "remove" || a === "ban")) {
        const m = await db.get("m:" + r.msg.cid, r.msg.id);
        if (m) { if (m.media) { try { await hooks.delMedia(m.media.key); } catch (e) {} m.media.gone = true; } m.text = m.text ? "[удалено модератором]" : ""; await db.put("m:" + r.msg.cid, r.msg.id, m); }
        if (target && a === "remove") await notify(target.id, "mod_warn", [], { type: "feed" });
      }
      if (r.post && (a === "remove" || a === "ban")) {
        const p = await db.get("p", r.post.id);
        if (p) { await db.del("p", p.id); if (target && target.posts && target.posts[p.game] === p.id) { delete target.posts[p.game]; await db.put("u", target.id, target); } hooks.feedDirty(); }
        if (target && a === "remove") await notify(target.id, "mod_post", [], { type: "feed" });
      }
      if (a === "ban" && target) await banUser(target, r.reason);
      if (a === "warn" && target) await notify(target.id, "mod_warn", [], { type: "feed" });
      r.done = { a, t: Date.now() }; await db.put("rep", r.id, r);
      return { body: { ok: true } };
    }
    if (b.user) {
      let u = await db.get("u", String(b.user));
      if (!u) { const idx = await db.get("n", String(b.user).toLowerCase().replace(/ё/g, "е")); u = idx ? await db.get("u", idx.uid) : null; }
      if (!u) throw new Http(404, "gone");
      if (a === "ban") await banUser(u, b.reason);
      else if (a === "unban") { delete u.banned; await db.put("u", u.id, u); }
      else throw new Http(400, "bad_action");
      return { body: { ok: true, nick: u.nick } };
    }
    if (b.scrim) {
      const s = await db.get("s", String(b.scrim)); if (!s || s.status !== "disputed") throw new Http(404, "gone");
      if (a === "void") { await db.del("s", s.id); }
      else if (a === "restore") { s.status = "confirmed"; delete s.rep; await db.put("s", s.id, s); }
      else throw new Http(400, "bad_action");
      hooks.teamsDirty();
      return { body: { ok: true } };
    }
    if (b.comment) { await db.del("cm:" + String(b.comment.uid), String(b.comment.from)); return { body: { ok: true } }; }
    throw new Http(400, "bad_action");
  }
  const routes = [
    ["POST", /^\/api\/admin\/login$/, login],
    ["POST", /^\/api\/admin\/logout$/, async () => ({ body: { ok: true }, cookies: [cookie("", 0)] })],
    ["GET", /^\/api\/admin\/overview$/, overview],
    ["POST", /^\/api\/admin\/act$/, act]
  ];
  return { routes };
};
