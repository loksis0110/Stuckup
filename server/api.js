"use strict";
const A = require("./auth"), V = require("./validate"), mail = require("./mail");
const META = V.META;

const ONLINE_MS = 5 * 60000, MSG_MAX = 500;
const CODE_TTL = 15 * 60000, CODE_TRIES = 5, RESEND_MS = 60000, FEED_TTL = 4000, MAX_LIST = 200;
const REASONS = ["toxic", "spam", "fake", "scam"];
const SMOKE_DOMAIN = "@smoke.stuckup.invalid";
const SITE_HOSTS = ["stuckup.ru", "www.stuckup.ru", "stuckup.online", "www.stuckup.online"];

class Http extends Error { constructor(status, code, extra) { super(code); this.status = status; this.code = code; this.extra = extra || null; } }

module.exports = function makeApi(db, opts) {
  opts = opts || {};
  let feed = null;

  /* ---------- helpers ---------- */
  async function limit(key, max, windowMs) {
    const now = Date.now(), r = await db.get("r", key);
    if (!r || r.reset < now) { await db.put("r", key, { n: 1, reset: now + windowMs }); return; }
    if (r.n >= max) throw new Http(429, "too_many", { retry: Math.ceil((r.reset - now) / 1000) });
    r.n++; await db.put("r", key, r);
  }
  function isSmoke(req, email) { const k = process.env.SMOKE_KEY; return !!k && A.safeEq(req.headers["x-smoke-key"] || "", k) && String(email).endsWith(SMOKE_DOMAIN); }
  async function currentUser(req) {
    const s = A.readSession(req.cookies[A.COOKIE]); if (!s) return null;
    const u = await db.get("u", s.uid);
    if (!u || (u.sv || 0) !== s.sv || u.banned) return null;
    return u;
  }
  async function need(req) { const u = await currentUser(req); if (!u) throw new Http(401, "auth"); return u; }
  function me(u) { return { id: u.id, email: u.email, nick: u.nick, profile: u.profile, favs: u.favs || [], blocked: u.blocked || [], archive: u.archive || [], created: u.created }; }
  function view(p, viewer) {
    const o = Object.assign({}, p), has = !!(p.c && (p.c.dc || p.c.tg));
    o.hasC = has;
    if (!viewer) o.c = null;
    return o;
  }
  async function loadFeed() {
    const now = Date.now();
    if (feed && now - feed.t < FEED_TTL) return feed.posts;
    const rows = await db.list("p"), live = [], dead = [], on = {};
    for (const row of rows) (row.d.exp > now ? live : dead).push(row.d);
    for (const p of dead.slice(0, 20)) {
      await db.del("p", p.id);
      const u = await db.get("u", p.uid);
      if (u) { toArchive(u, p, "expired"); if (u.posts && u.posts[p.game] === p.id) delete u.posts[p.game]; await db.put("u", u.id, u); }
    }
    for (const row of await db.list("on")) { if (now - row.d.t < ONLINE_MS) on[row.sk] = true; else if (now - row.d.t > 86400000) await db.del("on", row.sk); }
    for (const p of live) p.on = !!on[p.uid];
    feed = { t: now, posts: live, on };
    return live;
  }
  function toArchive(u, p, reason) {
    u.archive = [{ game: p.game, mode: p.mode, r: p.r, roles: p.roles, have: p.have, region: p.region, mic: p.mic, note: p.note, dur: p.dur, style: p.style, stags: p.stags, ended: Date.now(), reason }].concat(u.archive || []).slice(0, 20);
  }
  async function myPosts(u) {
    const out = [], now = Date.now();
    for (const g of Object.keys(u.posts || {})) { const p = await db.get("p", u.posts[g]); if (p && p.exp > now && p.uid === u.id) out.push(p); }
    return out;
  }
  async function deliver(req, email, code, lang, kind) {
    if (isSmoke(req, email)) return { devCode: code };
    if (mail.mode() !== "smtp") return { devCode: code };
    try { await (opts.sendCode || mail.sendCode)(email, code, lang, kind); }
    catch (e) { console.error("mail error:", e.message); throw new Http(502, "mail_failed"); }
    return {};
  }
  function login(u) { return [A.sessionCookie(A.makeSession(u.id, u.sv || 0))]; }

  /* ---------- auth ---------- */
  async function register(req) {
    const b = req.json;
    if (b.consent !== true) throw new Http(400, "need_consent", { field: "consent" });
    const email = V.email(b.email), pass = V.password(b.password), nick = V.nick(b.nick), lang = b.lang === "en" ? "en" : "ru";
    await limit("reg:" + req.ip, 10, 3600000);
    if (await db.get("e", email)) throw new Http(409, "email_taken", { field: "email" });
    if (await db.get("n", V.nickKey(nick))) throw new Http(409, "nick_taken", { field: "nick" });
    const now = Date.now(), prev = await db.get("c", email), hash = await A.hashPassword(pass);
    const real = mail.mode() === "smtp" && !isSmoke(req, email);
    if (real && prev && prev.kind === "reg" && prev.exp > now && now - prev.sent < RESEND_MS) {
      // A code was sent moments ago: keep it, just update the nickname and password
      prev.nick = nick; prev.pass = hash; prev.lang = lang;
      await db.put("c", email, prev);
      return { body: { ok: true, kept: true } };
    }
    const code = A.newCode();
    await db.put("c", email, { kind: "reg", nick, pass: hash, lang, h: A.codeHash(email, code), exp: now + CODE_TTL, tries: 0, sent: now });
    return { body: Object.assign({ ok: true }, await deliver(req, email, code, lang, "reg")) };
  }
  async function checkCode(email, code, kind) {
    const now = Date.now(), pend = await db.get("c", email);
    if (!pend || pend.kind !== kind || pend.exp < now) throw new Http(400, "code_expired");
    if (pend.tries >= CODE_TRIES) throw new Http(400, "code_tries");
    if (!A.safeEq(pend.h, A.codeHash(email, String(code || "").replace(/\D/g, "")))) {
      pend.tries++; await db.put("c", email, pend);
      throw new Http(400, pend.tries >= CODE_TRIES ? "code_tries" : "bad_code", { left: CODE_TRIES - pend.tries });
    }
    return pend;
  }
  async function verify(req) {
    const b = req.json, email = V.email(b.email);
    await limit("ver:" + req.ip, 40, 3600000);
    const pend = await checkCode(email, b.code, "reg");
    if (await db.get("e", email)) throw new Http(409, "email_taken", { field: "email" });
    if (await db.get("n", V.nickKey(pend.nick))) throw new Http(409, "nick_taken", { field: "nick" });
    const u = { id: A.newId(9), email, nick: pend.nick, pass: pend.pass, sv: 0, created: Date.now(), lang: pend.lang, ev: mail.mode() === "smtp" && !isSmoke(req, email),
      profile: V.blankProfile(pend.lang), favs: [], blocked: [], posts: {} };
    await db.put("u", u.id, u);
    await db.put("e", email, { uid: u.id });
    await db.put("n", V.nickKey(u.nick), { uid: u.id });
    await db.del("c", email);
    return { body: { user: me(u), posts: [] }, cookies: login(u) };
  }
  async function resend(req) {
    const b = req.json, email = V.email(b.email), now = Date.now();
    await limit("resend:" + req.ip, 20, 3600000);
    const pend = await db.get("c", email);
    if (!pend) throw new Http(400, "code_expired");
    if (now - pend.sent < RESEND_MS) throw new Http(429, "too_many", { retry: Math.ceil((RESEND_MS - (now - pend.sent)) / 1000) });
    const code = A.newCode();
    Object.assign(pend, { h: A.codeHash(email, code), exp: now + CODE_TTL, tries: 0, sent: now });
    await db.put("c", email, pend);
    return { body: Object.assign({ ok: true }, await deliver(req, email, code, pend.lang, pend.kind)) };
  }
  async function signin(req) {
    const b = req.json, email = String(b.email || "").trim().toLowerCase().slice(0, 254), pw = String(b.password == null ? "" : b.password).slice(0, 200);
    await limit("login:" + req.ip, 40, 600000);
    await limit("login:" + email, 10, 600000);
    const idx = email ? await db.get("e", email) : null, u = idx ? await db.get("u", idx.uid) : null;
    if (!u || !(await A.checkPassword(pw, u.pass))) throw new Http(401, "bad_login");
    if (u.banned) throw new Http(403, "banned");
    return { body: { user: me(u), posts: await myPosts(u) }, cookies: login(u) };
  }
  async function reset(req) {
    const b = req.json, email = V.email(b.email), now = Date.now();
    if (mail.mode() !== "smtp" && !isSmoke(req, email)) throw new Http(503, "mail_off");
    await limit("reset:" + req.ip, 10, 3600000);
    const idx = await db.get("e", email), prev = await db.get("c", email);
    // Same answer whether or not the address is registered
    if (!idx || (prev && now - prev.sent < RESEND_MS)) return { body: { ok: true } };
    const u = await db.get("u", idx.uid), code = A.newCode();
    await db.put("c", email, { kind: "reset", lang: (u && u.lang) || "ru", h: A.codeHash(email, code), exp: now + CODE_TTL, tries: 0, sent: now });
    return { body: Object.assign({ ok: true }, await deliver(req, email, code, (u && u.lang) || "ru", "reset")) };
  }
  async function resetConfirm(req) {
    const b = req.json, email = V.email(b.email), pass = V.password(b.password);
    await limit("ver:" + req.ip, 40, 3600000);
    await checkCode(email, b.code, "reset");
    const idx = await db.get("e", email), u = idx ? await db.get("u", idx.uid) : null;
    if (!u) throw new Http(400, "code_expired");
    if (u.banned) throw new Http(403, "banned");
    u.pass = await A.hashPassword(pass); u.sv = (u.sv || 0) + 1; u.ev = true;
    await db.put("u", u.id, u); await db.del("c", email);
    return { body: { user: me(u), posts: await myPosts(u) }, cookies: login(u) };
  }

  /* ---------- account ---------- */
  async function getMe(req) {
    const u = await currentUser(req);
    if (!u) return { body: { user: null } };
    return { body: { user: me(u), posts: await myPosts(u) } };
  }
  async function putMe(req) {
    const u = await need(req), b = req.json, mine = await myPosts(u);
    let touchPosts = false;
    if (b.nick != null && String(b.nick).trim() !== u.nick) {
      const nick = V.nick(b.nick), key = V.nickKey(nick), oldKey = V.nickKey(u.nick);
      if (key !== oldKey) {
        await limit("nick:" + u.id, 3, 86400000);
        if (await db.get("n", key)) throw new Http(409, "nick_taken", { field: "nick" });
        await db.put("n", key, { uid: u.id }); await db.del("n", oldKey);
      }
      u.nick = nick; touchPosts = true;
    }
    if (b.profile != null) {
      const p = V.profile(b.profile, u.profile);
      if (mine.length && !p.dc && !p.tg) throw new Http(400, "need_contact", { user: me(u) });
      if (p.dc !== u.profile.dc || p.tg !== u.profile.tg || p.adult !== u.profile.adult || String(p.langs) !== String(u.profile.langs) || String(p.time) !== String(u.profile.time)) touchPosts = true;
      u.profile = p;
    }
    if (b.lang === "ru" || b.lang === "en") u.lang = b.lang;
    await db.put("u", u.id, u);
    if (touchPosts && mine.length) {
      for (const p of mine) {
        p.nick = u.nick; p.c = { dc: u.profile.dc, tg: u.profile.tg }; p.langs = u.profile.langs; p.when = u.profile.time;
        if (!u.profile.adult) p.stags = (p.stags || []).filter(s => s !== "adult");
        await db.put("p", p.id, p);
      }
      feed = null;
    }
    return { body: { user: me(u), posts: mine } };
  }
  async function delMe(req) {
    const u = await need(req);
    if (!(await A.checkPassword(String(req.json.password == null ? "" : req.json.password), u.pass))) throw new Http(401, "bad_password");
    for (const g of Object.keys(u.posts || {})) await db.del("p", u.posts[g]);
    await db.del("e", u.email); await db.del("n", V.nickKey(u.nick)); await db.del("u", u.id);
    feed = null;
    return { body: { ok: true }, cookies: [A.clearCookie()] };
  }
  async function setList(req, field) {
    const u = await need(req), b = req.json, id = String(b.uid || "");
    let list = (u[field] || []).filter(x => x.id !== id);
    if (b.on) {
      if (id === u.id) throw new Http(400, "bad_target");
      const target = await db.get("u", id); if (!target) throw new Http(404, "bad_target");
      if (list.length >= MAX_LIST) throw new Http(400, "list_full");
      list.push({ id, nick: target.nick });
      if (field === "blocked") u.favs = (u.favs || []).filter(x => x.id !== id);
    }
    u[field] = list;
    await db.put("u", u.id, u);
    return { body: { favs: u.favs || [], blocked: u.blocked || [] } };
  }

  /* ---------- listings ---------- */
  async function listPosts(req) {
    const u = await currentUser(req), posts = await loadFeed();
    return { body: { posts: posts.map(p => view(p, u)), now: Date.now() } };
  }
  async function createPost(req) {
    const u = await need(req), prof = u.profile;
    if (!prof.dc && !prof.tg) throw new Http(400, "need_contact");
    const f = V.post(req.json, prof);
    await limit("post:" + u.id, 30, 3600000);
    const now = Date.now(), G = META.games[f.game];
    prof.ranks[f.game] = Object.assign({}, prof.ranks[f.game], { [f.r.sys]: f.r });
    prof.roles[f.game] = f.roles; prof.region = f.region;
    if (!prof.games.includes(f.game)) prof.games.push(f.game);
    const extra = G.systems.filter(s => s !== f.r.sys).map(s => prof.ranks[f.game][s]).filter(Boolean);
    const post = Object.assign({ id: A.timeId(), uid: u.id, nick: u.nick }, f, { extra, langs: prof.langs, t0: now, exp: now + f.dur * 60000, c: { dc: prof.dc, tg: prof.tg }, when: prof.time });
    u.posts = u.posts || {};
    let replaced = false;
    if (u.posts[f.game]) { const old = await db.get("p", u.posts[f.game]); if (old) { replaced = old.exp > now; toArchive(u, old, replaced ? "replaced" : "expired"); await db.del("p", old.id); } }
    u.posts[f.game] = post.id;
    await db.put("p", post.id, post);
    await db.put("u", u.id, u);
    feed = null;
    return { body: { post: view(post, u), user: me(u), replaced } };
  }
  async function ownPost(req, id) {
    const u = await need(req), p = await db.get("p", String(id));
    if (p && p.uid !== u.id) throw new Http(403, "forbidden");
    return { u, p };
  }
  async function deletePost(req, id) {
    const { u, p } = await ownPost(req, id);
    if (p) {
      await db.del("p", p.id);
      toArchive(u, p, "closed");
      if (u.posts && u.posts[p.game] === p.id) delete u.posts[p.game];
      await db.put("u", u.id, u);
      feed = null;
    }
    return { body: { ok: true, archive: u.archive || [] } };
  }
  async function renewPost(req, id) {
    const { u, p } = await ownPost(req, id), now = Date.now();
    if (!p || p.exp <= now) throw new Http(404, "post_gone");
    await limit("renew:" + u.id, 60, 3600000);
    p.t0 = now; p.exp = now + p.dur * 60000;
    await db.put("p", p.id, p);
    feed = null;
    return { body: { post: view(p, u) } };
  }
  async function report(req) {
    const u = await need(req), b = req.json, reason = REASONS.includes(b.reason) ? b.reason : "toxic";
    const p = await db.get("p", String(b.postId || ""));
    if (!p) throw new Http(404, "post_gone");
    if (p.uid === u.id) throw new Http(400, "bad_target");
    await limit("report:" + u.id, 20, 86400000);
    const id = A.timeId();
    await db.put("rep", id, { id, t: Date.now(), from: u.id, fromNick: u.nick, target: p.uid, targetNick: p.nick, reason, post: { id: p.id, game: p.game, mode: p.mode, r: p.r, note: p.note, c: p.c } });
    return { body: { ok: true } };
  }

  /* ---------- chat ---------- */
  function cidOf(a, b) { return a < b ? a + "~" + b : b + "~" + a; }
  async function listChats(req) {
    const u = await need(req), now = Date.now();
    if (req.query.beat === "1") await db.put("on", u.id, { t: now });
    const rows = await db.list("cv:" + u.id), on = (feed && feed.on) || {};
    return { body: { chats: rows.map(r => Object.assign({}, r.d, { on: !!on[r.d.id] })), now } };
  }
  async function getChat(req, uid) {
    const u = await need(req), rows = await db.list("m:" + cidOf(u.id, uid)), after = String(req.query.after || "");
    const cv = await db.get("cv:" + u.id, uid);
    if (cv && cv.unread) { cv.unread = 0; await db.put("cv:" + u.id, uid, cv); }
    const msgs = rows.filter(r => r.sk > after).slice(-200).map(r => ({ id: r.d.id, me: r.d.from === u.id, text: r.d.text, t: r.d.t }));
    return { body: { msgs, now: Date.now() } };
  }
  async function sendMessage(req, uid) {
    const u = await need(req);
    if (uid === u.id) throw new Http(400, "bad_target");
    const text = String(req.json.text == null ? "" : req.json.text).replace(/[\u0000-\u0008\u000b-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, " ").trim().slice(0, MSG_MAX);
    if (!text) throw new Http(400, "empty");
    const target = await db.get("u", uid);
    if (!target || target.banned) throw new Http(404, "bad_target");
    if ((target.blocked || []).some(x => x.id === u.id)) throw new Http(403, "blocked_by");
    if ((u.blocked || []).some(x => x.id === uid)) throw new Http(400, "you_blocked");
    await limit("msg:" + u.id, 40, 60000);
    const now = Date.now(), id = A.timeId(), short = text.slice(0, 80);
    await db.put("m:" + cidOf(u.id, uid), id, { id, from: u.id, text, t: now });
    await db.put("cv:" + u.id, uid, { id: uid, nick: target.nick, last: short, t: now, from: u.id, unread: 0 });
    const theirs = await db.get("cv:" + uid, u.id);
    await db.put("cv:" + uid, u.id, { id: u.id, nick: u.nick, last: short, t: now, from: u.id, unread: ((theirs && theirs.unread) || 0) + 1 });
    return { body: { msg: { id, me: true, text, t: now } } };
  }

  function originOk(origin, h) {
    const o = String(origin).replace(/^https?:\/\//, "").toLowerCase();
    if (o === String(h.host || "").toLowerCase() || o === String(h["x-forwarded-host"] || "").toLowerCase()) return true;
    if (SITE_HOSTS.includes(o) || o.endsWith(".apigw.yandexcloud.net")) return true;
    return /^localhost(:\d+)?$/.test(o) && !process.env.DOCAPI_ENDPOINT;
  }

  /* ---------- router ---------- */
  const ROUTES = [
    ["GET", /^\/api\/health$/, async () => { let dbOk = true, err; try { await db.ping(); } catch (e) { dbOk = false; err = String(e.message).slice(0, 200); } return { status: dbOk ? 200 : 503, body: { ok: dbOk, db: dbOk, err, mail: mail.mode(), build: process.env.BUILD || "dev", now: Date.now() } }; }],
    ["GET", /^\/api\/config$/, async () => ({ body: { mail: mail.mode(), build: process.env.BUILD || "dev" } })],
    ["POST", /^\/api\/health\/mail$/, async req => {
      // deploy-time check: sends a test letter to the site's own mailbox
      const k = process.env.SMOKE_KEY; if (!k || !A.safeEq(req.headers["x-smoke-key"] || "", k)) throw new Http(403, "forbidden");
      if (mail.mode() !== "smtp") return { body: { ok: false, err: "not configured" } };
      try { await mail.sendCode(mail.cfg().from, "000000", "ru", "reg"); return { body: { ok: true } }; } catch (e) { return { body: { ok: false, err: String(e.message).slice(0, 200) } }; }
    }],
    ["POST", /^\/api\/auth\/register$/, register],
    ["POST", /^\/api\/auth\/verify$/, verify],
    ["POST", /^\/api\/auth\/resend$/, resend],
    ["POST", /^\/api\/auth\/login$/, signin],
    ["POST", /^\/api\/auth\/logout$/, async () => ({ body: { ok: true }, cookies: [A.clearCookie()] })],
    ["POST", /^\/api\/auth\/reset$/, reset],
    ["POST", /^\/api\/auth\/reset\/confirm$/, resetConfirm],
    ["GET", /^\/api\/me$/, getMe],
    ["PUT", /^\/api\/me$/, putMe],
    ["DELETE", /^\/api\/me$/, delMe],
    ["POST", /^\/api\/favs$/, req => setList(req, "favs")],
    ["POST", /^\/api\/blocks$/, req => setList(req, "blocked")],
    ["GET", /^\/api\/posts$/, listPosts],
    ["POST", /^\/api\/posts$/, createPost],
    ["DELETE", /^\/api\/posts\/([A-Za-z0-9_-]{1,40})$/, deletePost],
    ["POST", /^\/api\/posts\/([A-Za-z0-9_-]{1,40})\/renew$/, renewPost],
    ["POST", /^\/api\/reports$/, report],
    ["GET", /^\/api\/chats$/, listChats],
    ["GET", /^\/api\/chats\/([A-Za-z0-9_-]{6,40})$/, getChat],
    ["POST", /^\/api\/chats\/([A-Za-z0-9_-]{6,40})$/, sendMessage]
  ];

  return async function handle(req) {
    try {
      let known = false;
      for (const [method, re, fn] of ROUTES) {
        const m = re.exec(req.path); if (!m) continue;
        known = true;
        if (method !== req.method) continue;
        if (method !== "GET") {
          // CSRF guard: JSON bodies only, and the Origin (when the browser sends one) must be this site
          if (!/^application\/json/i.test(req.headers["content-type"] || "")) throw new Http(415, "json_only");
          const origin = req.headers.origin;
          if (origin && !originOk(origin, req.headers)) throw new Http(403, "bad_origin");
          if (!req.json || typeof req.json !== "object" || Array.isArray(req.json)) throw new Http(400, "bad_json");
        }
        const r = await fn(req, m[1]);
        return { status: r.status || 200, body: r.body, cookies: r.cookies || [] };
      }
      throw known ? new Http(405, "method") : new Http(404, "not_found");
    } catch (e) {
      if (e instanceof Http) return { status: e.status, body: Object.assign({ error: e.code }, e.extra || {}), cookies: [] };
      if (e instanceof V.Bad) return { status: 400, body: { error: e.code, field: e.field }, cookies: [] };
      console.error("api error:", req.method, req.path, e && e.stack || e);
      return { status: 500, body: { error: "server" }, cookies: [] };
    }
  };
};
