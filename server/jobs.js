"use strict";
// Background work run by the per-minute timer: e-mail queue and daily database backups.
// Also builds notification letters (chat messages, invites, new listings in followed games).
const zlib = require("zlib");
const A = require("./auth"), V = require("./validate"), mail = require("./mail");
const META = V.META;

const DAY = 86400000, DAILY_CAP = 20, MSG_GAP = 30 * 60000, SUB_GAP = 3 * 3600000, BACKUP_EVERY = 23 * 3600000, KEEP_DAYS = 30;
const SITE = () => process.env.SITE_URL || "https://stuckup.ru";
const INVITES = ["stack", "comment", "app", "app_ok", "app_no", "kicked", "invite", "book", "book_ok", "book_no", "sc_cancel", "veto", "result", "result_ok", "mod_post", "mod_warn"];

const TX = {
  ru: { open: "Открыть Stuckup", reply: "Ответить", view: "Открыть объявление", msgT: n => n + " написал(а) вам на Stuckup", subT: (g, n) => g + ": " + n + " ищет тиммейтов", subTitle: g => "Новое объявление в " + g,
    need: n => "Ищут ещё " + n, backupT: "Stuckup: резервная копия не сделана", backupL: e => ["Ежедневная выгрузка базы не удалась.", "Ошибка: " + e] },
  en: { open: "Open Stuckup", reply: "Reply", view: "Open the listing", msgT: n => n + " sent you a message on Stuckup", subT: (g, n) => g + ": " + n + " is looking for teammates", subTitle: g => "New listing in " + g,
    need: n => "Looking for " + n + " more", backupT: "Stuckup: backup failed", backupL: e => ["The daily database export failed.", "Error: " + e] }
};
const L = u => TX[u && u.lang === "en" ? "en" : "ru"];

function rankText(r) {
  if (!r) return "";
  const s = META.sys[r.sys] || {};
  if (s.kind === "rating") return s.label + " " + String(r.v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (s.kind === "faceit") return "FACEIT " + r.elo + " ELO";
  return (s.names ? s.names[r.t] : "") + (r.s ? " " + r.s : "");
}
// close enough to the follower's own rank in the same rating system
function nearRank(a, b) {
  if (!a || !b || a.sys !== b.sys) return false;
  if (a.v != null) return Math.abs(a.v - b.v) <= 4000;
  if (a.elo != null) return Math.abs(a.elo - b.elo) <= 400;
  return Math.abs(a.t - b.t) <= 1;
}

module.exports = function makeJobs(ctx) {
  const { db, Http, need, me, storage, noteText } = ctx;
  const prefs = u => Object.assign({ msg: true, inv: true }, u.mailp || {});
  const unsubUrl = (uid, kind) => SITE() + "/api/unsub?u=" + encodeURIComponent(uid) + "&k=" + encodeURIComponent(kind) + "&s=" + A.hmac("unsub|" + uid + "|" + kind).slice(0, 22);

  async function queue(u, kind, letter) {
    if (!u || !u.email || u.banned || mail.mode() !== "smtp") return false;
    const day = Math.floor(Date.now() / DAY), c = (await db.get("mc", u.id)) || {};
    if (c.day === day && c.n >= DAILY_CAP) return false;
    await db.put("mc", u.id, { day, n: c.day === day ? c.n + 1 : 1 });
    const id = A.timeId();
    await db.put("mq", id, Object.assign({ id, to: u.email, lang: u.lang || "ru", unsub: unsubUrl(u.id, kind), tries: 0 }, letter));
    return true;
  }
  // a site notification (invite, application, scrim...) → letter
  async function onNotify(uid, k, a) {
    if (!INVITES.includes(k)) return;
    const u = await db.get("u", uid); if (!u || !prefs(u).inv) return;
    const title = noteText(u, k, a); if (!title) return;
    await queue(u, "inv", { subject: title, title, lines: [], button: { text: L(u).open, url: SITE() + "/" } });
  }
  // a chat message to someone who is not on the site
  async function onMessage(target, from, text, cvKey) {
    if (!target.email || !prefs(target).msg) return;
    const cv = await db.get(cvKey[0], cvKey[1]), now = Date.now();
    if (!cv || (cv.mailAt && now - cv.mailAt < MSG_GAP)) return;
    const T = L(target);
    if (await queue(target, "msg", { subject: T.msgT(from.nick), title: T.msgT(from.nick), lines: ["«" + text.slice(0, 300) + "»"], button: { text: T.reply, url: SITE() + "/#/c/" + from.id } })) {
      cv.mailAt = now; await db.put(cvKey[0], cvKey[1], cv);
    }
  }
  // new listing → people who follow this game
  async function onPost(post, author) {
    const now = Date.now(), G = META.games[post.game];
    for (const row of (await db.list("sub:" + post.game)).slice(0, 500)) {
      const s = row.d, uid = row.sk;
      if (uid === author.id || (s.sent && now - s.sent < SUB_GAP)) continue;
      const u = await db.get("u", uid);
      if (!u || !u.email || (u.blocked || []).some(x => x.id === author.id) || (author.blocked || []).some(x => x.id === uid)) continue;
      if (s.match && !nearRank(((u.profile.ranks || {})[post.game] || {})[post.r.sys], post.r)) continue;
      const T = L(u), size = G.msize[post.mode] || G.size, lines = [post.nick + " · " + (G.modeNames[post.mode] || post.mode) + " · " + rankText(post.r), T.need(size - post.have)];
      if (post.note) lines.push("«" + post.note + "»");
      if (await queue(u, "sub:" + post.game, { subject: T.subT(G.short, post.nick), title: T.subTitle(G.name), lines, button: { text: T.view, url: SITE() + "/#/p/" + post.id } })) {
        s.sent = now; await db.put("sub:" + post.game, uid, s);
      }
    }
  }

  /* ---------- settings ---------- */
  async function setMail(req) {
    const u = await need(req), b = req.json;
    u.mailp = Object.assign(prefs(u), { msg: b.msg != null ? !!b.msg : prefs(u).msg, inv: b.inv != null ? !!b.inv : prefs(u).inv });
    await db.put("u", u.id, u);
    return { body: { user: me(u) } };
  }
  async function setSub(req) {
    const u = await need(req), b = req.json, g = String(b.game || "");
    if (!META.games[g]) throw new Http(400, "bad_game");
    if (!u.email) throw new Http(400, "need_email");
    u.subs = u.subs || {};
    if (b.on) { if (!u.subs[g] && Object.keys(u.subs).length >= 11) throw new Http(400, "list_full"); u.subs[g] = { match: !!b.match }; await db.put("sub:" + g, u.id, { match: !!b.match }); }
    else { delete u.subs[g]; await db.del("sub:" + g, u.id); }
    await db.put("u", u.id, u);
    return { body: { user: me(u) } };
  }
  async function unsub(req) {
    const q = req.query || {}, uid = String(q.u || ""), kind = String(q.k || "");
    if (!A.safeEq(String(q.s || ""), A.hmac("unsub|" + uid + "|" + kind).slice(0, 22))) return { redirect: "/#/err/link_fail" };
    const u = await db.get("u", uid); if (!u) return { redirect: "/" };
    if (kind.startsWith("sub:")) { const g = kind.slice(4); if (u.subs) delete u.subs[g]; await db.del("sub:" + g, u.id); }
    else if (kind === "msg" || kind === "inv") u.mailp = Object.assign(prefs(u), { [kind]: false });
    await db.put("u", u.id, u);
    return { redirect: "/#/unsub/" + (kind.startsWith("sub:") ? "sub" : kind) };
  }
  async function userGone(u) { for (const g of Object.keys(u.subs || {})) await db.del("sub:" + g, u.id); await db.del("mc", u.id); }

  /* ---------- timer ---------- */
  async function sendQueue(budgetMs) {
    const t0 = Date.now(); let sent = 0, failed = 0;
    for (const row of await db.list("mq")) {
      if (Date.now() - t0 > budgetMs) break;
      const m = row.d;
      try { await (ctx.sendNotice || mail.sendNotice)(m); await db.del("mq", row.sk); sent++; }
      catch (e) { failed++; console.error("mail queue:", e.message); m.tries = (m.tries || 0) + 1; if (m.tries >= 3) await db.del("mq", row.sk); else await db.put("mq", row.sk, m); }
    }
    return { sent, failed };
  }
  async function backup(force) {
    const now = Date.now(), last = (await db.get("sys", "backup")) || {};
    if (!force && last.t && now - last.t < BACKUP_EVERY) return null;
    if (!force && last.fail && now - last.fail < 3600000) return null;
    try {
      const rows = (await db.scan()).filter(r => r.pk !== "r" && r.pk !== "mq" && !r.pk.startsWith("sys"));
      const gz = zlib.gzipSync(rows.map(r => JSON.stringify(r)).join("\n"), { level: 9 });
      const day = new Date(now).toISOString().slice(0, 10), old = new Date(now - KEEP_DAYS * DAY).toISOString().slice(0, 10);
      await storage.put("backup/" + day + ".jsonl.gz", gz, "application/gzip");
      try { await storage.del("backup/" + old + ".jsonl.gz"); } catch (e) {}
      const info = { t: now, day, items: rows.length, bytes: gz.length };
      await db.put("sys", "backup", info);
      return info;
    } catch (e) {
      console.error("backup:", e.message);
      await db.put("sys", "backup", Object.assign({}, last, { fail: now, err: String(e.message).slice(0, 200) }));
      const owner = process.env.MAIL_FROM || process.env.SMTP_USER;
      if (owner && mail.mode() === "smtp" && !(last.fail && now - last.fail < DAY)) {
        try { await (ctx.sendNotice || mail.sendNotice)({ to: owner, lang: "ru", subject: TX.ru.backupT, title: TX.ru.backupT, lines: TX.ru.backupL(String(e.message).slice(0, 200)), button: { text: "Открыть админку", url: SITE() + "/admin" }, unsub: SITE() + "/admin" }); } catch (x) {}
      }
      return { error: e.message };
    }
  }
  async function cron() {
    const out = {};
    out.mail = await sendQueue(9000);
    out.backup = await backup(false);
    return out;
  }
  async function backupInfo() { return (await db.get("sys", "backup")) || null; }

  const routes = [
    ["POST", /^\/api\/me\/mail$/, setMail],
    ["POST", /^\/api\/subs$/, setSub],
    ["GET", /^\/api\/unsub$/, unsub]
  ];
  return { routes, onNotify, onMessage, onPost, cron, backup, backupInfo, userGone, rankText, prefs };
};
module.exports.rankText = rankText;
