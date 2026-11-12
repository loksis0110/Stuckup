"use strict";
// Sign-in through Telegram (bot) and VK ID, Telegram notifications, and rank verification (Steam → Dota 2 via OpenDota, FACEIT Data API).
const crypto = require("crypto");
const A = require("./auth"), V = require("./validate");

const BOT = () => process.env.TG_BOT || "Stuckup_gg_bot";
const SITE = () => process.env.SITE_URL || "https://stuckup.ru";
const STEAM64 = 76561197960265728n;
const TEN_MIN = 600000;

const TEXT = {
  ru: { hi: "Это бот Stuckup — поиск тиммейтов. Здесь приходят уведомления с сайта. Чтобы подключить их, откройте профиль на stuckup.ru и нажмите «Подключить Telegram».", login_ok: "Готово! Вернитесь на сайт — вход выполнится сам.", link_ok: "Готово! Уведомления Stuckup будут приходить сюда. Отключить: /stop",
    old: "Ссылка устарела. Вернитесь на сайт и нажмите кнопку ещё раз.", taken: "Этот Telegram уже привязан к другому аккаунту Stuckup.", stop: "Уведомления отключены. Включить снова можно в профиле на сайте.", msg: (n, t) => "Новое сообщение от " + n + ":\n«" + t + "»",
    n: { stack: a => a[0] + " зовёт вас в стак", comment: a => a[0] + " оставил(а) комментарий о вас", app: a => a[0] + " хочет в команду " + a[1], app_ok: a => "Вас приняли в команду " + a[0], app_no: a => "Заявку в " + a[0] + " отклонили", kicked: a => "Вас убрали из команды " + a[0],
      book: a => a[0] + " хочет сыграть с вами прак", book_ok: a => "Прак с " + a[0] + " подтверждён", book_no: a => a[0] + " отклонили прак", sc_cancel: a => "Прак с " + a[0] + " отменён", veto: a => "Ваш ход в вето · прак с " + a[0],
      result: a => a[0] + " внесли результат прака — подтвердите его", result_ok: a => "Результат прака с " + a[0] + " засчитан", mod_post: () => "Модератор снял ваше объявление за нарушение правил", mod_warn: () => "Модератор вынес вам предупреждение" } },
  en: { hi: "This is the Stuckup bot. Site notifications arrive here. To connect them, open your profile at stuckup.ru and press “Connect Telegram”.", login_ok: "Done! Go back to the site — you will be signed in automatically.", link_ok: "Done! Stuckup notifications will arrive here. To turn them off: /stop",
    old: "This link has expired. Go back to the site and press the button again.", taken: "This Telegram is already linked to another Stuckup account.", stop: "Notifications are off. You can turn them on again in your profile.", msg: (n, t) => "New message from " + n + ":\n“" + t + "”",
    n: { stack: a => a[0] + " invites you to a stack", comment: a => a[0] + " left a comment about you", app: a => a[0] + " wants to join " + a[1], app_ok: a => "You were accepted to " + a[0], app_no: a => "Your application to " + a[0] + " was declined", kicked: a => "You were removed from " + a[0],
      book: a => a[0] + " wants a scrim with you", book_ok: a => "Scrim with " + a[0] + " confirmed", book_no: a => a[0] + " declined the scrim", sc_cancel: a => "Scrim with " + a[0] + " was cancelled", veto: a => "Your turn in the veto · scrim with " + a[0],
      result: a => a[0] + " reported the scrim result — please confirm", result_ok: a => "Scrim result with " + a[0] + " is recorded", mod_post: () => "A moderator removed your listing for breaking the rules", mod_warn: () => "A moderator issued you a warning" } }
};
const L = u => TEXT[u && u.lang === "en" ? "en" : "ru"];

module.exports = function makeSocial(ctx) {
  const { db, Http, need, limit, me, loginCookies, hooks } = ctx;
  const http = ctx.fetch || ((url, opt) => fetch(url, Object.assign({ signal: AbortSignal.timeout(6000) }, opt)));
  const config = () => ({ tg: !!process.env.TELEGRAM_BOT_TOKEN && process.env.TG_ENABLED !== "0", vk: !!process.env.VK_CLIENT_ID, faceit: !!process.env.FACEIT_API_KEY, steam: true, bot: BOT() });
  const origin = req => { const h = String(req.headers["x-forwarded-host"] || req.headers.host || ""); return /^localhost(:\d+)?$/.test(h) ? "http://" + h : "https://" + h; };

  /* ---------- Telegram bot ---------- */
  async function tgSend(chatId, text) {
    const tok = process.env.TELEGRAM_BOT_TOKEN; if (!tok || !chatId) return false;
    try { const r = await http("https://api.telegram.org/bot" + tok + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }) }); return r.ok; }
    catch (e) { console.error("telegram:", e.message); return false; }
  }
  // called for every site notification and for chat messages to people who are away
  async function push(uid, k, a) {
    const u = await db.get("u", uid); if (!u || !u.tg || u.tg.off) return;
    const f = L(u).n[k]; if (f) await tgSend(u.tg.id, f(a || []) + "\n" + SITE());
  }
  async function pushMessage(target, fromNick, text) { if (target.tg && !target.tg.off) await tgSend(target.tg.id, L(target).msg(fromNick, text.slice(0, 200)) + "\n" + SITE()); }
  async function tgStart(req, uid) {
    if (!config().tg) throw new Http(503, "tg_off");
    await limit("tgs:" + req.ip, 30, 3600000);
    const token = A.newId(12);
    await db.put("tgl", token, { t: Date.now(), uid: uid || null, state: "wait" });
    return { body: { token, url: "https://t.me/" + BOT() + "?start=" + (uid ? "link_" : "login_") + token } };
  }
  async function tgPoll(req) {
    const token = String(req.json.token || "");
    await tgPump();
    const rec = await db.get("tgl", token);
    if (!rec || Date.now() - rec.t > TEN_MIN) throw new Http(400, "code_expired");
    if (rec.state === "wait") return { body: { wait: true } };
    await db.del("tgl", token);
    if (rec.state === "taken") throw new Http(409, "tg_taken");
    if (rec.uid) { const u = await db.get("u", rec.uid); return { body: { linked: true, user: u ? me(u) : null } }; }
    return socialLogin("tg", String(rec.tg.id), rec.tg.name);
  }
  async function tgHook(req) {
    const secret = process.env.TG_HOOK_SECRET;
    if (!secret || !A.safeEq(req.headers["x-telegram-bot-api-secret-token"] || "", secret)) throw new Http(403, "forbidden");
    return tgMessage(req.json.message);
  }
  // Pulls new bot messages. Runs while somebody is waiting for a Telegram confirmation on the site.
  let pumpAt = 0;
  async function tgPump() {
    const tok = process.env.TELEGRAM_BOT_TOKEN, now = Date.now();
    if (!tok || now - pumpAt < 1200) return;
    pumpAt = now;
    try {
      const off = await db.get("sys", "tgoff");
      const r = await http("https://api.telegram.org/bot" + tok + "/getUpdates?timeout=0&limit=50&offset=" + ((off && off.v) || 0) + "&allowed_updates=" + encodeURIComponent('["message"]')), j = await r.json();
      if (!j.ok) { console.error("telegram getUpdates:", String(j.description).slice(0, 200)); return; }
      let last = 0;
      for (const up of j.result || []) { last = up.update_id; try { await tgMessage(up.message); } catch (e) { console.error("telegram update:", e.message); } }
      if (last) await db.put("sys", "tgoff", { v: last + 1 });
    } catch (e) { console.error("telegram pump:", e.message); }
  }
  async function tgMessage(m) {
    if (!m || !m.chat || m.chat.type !== "private" || typeof m.text !== "string") return { body: { ok: true } };
    const from = m.from || {}, lang = String(from.language_code || "ru").startsWith("ru") ? "ru" : "en", T = TEXT[lang], name = from.username || from.first_name || "telegram";
    const st = /^\/start (login|link)_([A-Za-z0-9_-]{8,32})$/.exec(m.text.trim());
    if (st) {
      const rec = await db.get("tgl", st[2]);
      if (!rec || rec.state !== "wait" || Date.now() - rec.t > TEN_MIN || (st[1] === "link") !== !!rec.uid) { await tgSend(m.chat.id, T.old); return { body: { ok: true } }; }
      rec.tg = { id: from.id, name };
      if (rec.uid) {
        const idx = await db.get("x", "tg:" + from.id), u = await db.get("u", rec.uid);
        if (!u || (idx && idx.uid !== rec.uid)) { rec.state = "taken"; await db.put("tgl", st[2], rec); await tgSend(m.chat.id, T.taken); return { body: { ok: true } }; }
        if (u.tg && u.tg.id !== from.id) await db.del("x", "tg:" + u.tg.id);
        u.tg = { id: from.id, name }; await db.put("u", u.id, u); await db.put("x", "tg:" + from.id, { uid: u.id });
        rec.state = "ok"; await db.put("tgl", st[2], rec); await tgSend(m.chat.id, L(u).link_ok);
      } else { rec.state = "ok"; await db.put("tgl", st[2], rec); await tgSend(m.chat.id, T.login_ok); }
      return { body: { ok: true } };
    }
    if (/^\/stop\b/.test(m.text)) { const idx = await db.get("x", "tg:" + from.id), u = idx ? await db.get("u", idx.uid) : null; if (u && u.tg) { u.tg.off = true; await db.put("u", u.id, u); } await tgSend(m.chat.id, T.stop); return { body: { ok: true } }; }
    await tgSend(m.chat.id, T.hi);
    return { body: { ok: true } };
  }
  async function tgSet(req) {
    const u = await need(req);
    if (req.json.unlink && u.tg) { if (!u.email && !u.vk) throw new Http(400, "last_login"); await db.del("x", "tg:" + u.tg.id); delete u.tg; }
    else if (u.tg) u.tg.off = !req.json.on;
    await db.put("u", u.id, u);
    return { body: { user: me(u) } };
  }

  /* ---------- accounts created through Telegram or VK ---------- */
  async function socialLogin(kind, sid, name) {
    const idx = await db.get("x", kind + ":" + sid), u = idx ? await db.get("u", idx.uid) : null;
    if (u) { if (u.banned) throw new Http(403, "banned"); return { body: { user: me(u), posts: await hooks.myPosts(u) }, cookies: loginCookies(u) }; }
    const token = A.newId(12);
    await db.put("so", token, { kind, sid, name: String(name || "").slice(0, 40), t: Date.now() });
    return { body: { signup: token, suggest: String(name || "").replace(/[^A-Za-zА-Яа-яЁё0-9_.-]/g, "").slice(0, 20) } };
  }
  async function socialFinish(req) {
    const b = req.json, rec = await db.get("so", String(b.token || ""));
    if (!rec || Date.now() - rec.t > 3 * TEN_MIN) throw new Http(400, "code_expired");
    if (b.consent !== true) throw new Http(400, "need_consent");
    const nick = V.nick(b.nick), lang = b.lang === "en" ? "en" : "ru";
    await limit("reg:" + req.ip, 10, 3600000);
    if (await db.get("x", rec.kind + ":" + rec.sid)) throw new Http(409, "email_taken");
    if (await db.get("n", V.nickKey(nick))) throw new Http(409, "nick_taken", { field: "nick" });
    const u = { id: A.newId(9), email: "", nick, pass: "", sv: 0, created: Date.now(), lang, profile: V.blankProfile(lang), favs: [], blocked: [], posts: {} };
    u[rec.kind] = { id: rec.kind === "tg" ? Number(rec.sid) : rec.sid, name: rec.name };
    await db.put("u", u.id, u); await db.put("n", V.nickKey(nick), { uid: u.id }); await db.put("x", rec.kind + ":" + rec.sid, { uid: u.id });
    await db.del("so", String(b.token));
    return { body: { user: me(u), posts: [] }, cookies: loginCookies(u) };
  }

  /* ---------- VK ID (OAuth 2.1 + PKCE) ---------- */
  async function vkStart(req) {
    if (!config().vk) return { redirect: "/#/err/vk_off" };
    const state = A.newId(18), verifier = A.newId(48), challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
    await db.put("vs", state, { v: verifier, t: Date.now() });
    const q = new URLSearchParams({ response_type: "code", client_id: process.env.VK_CLIENT_ID, redirect_uri: origin(req) + "/api/auth/vk/cb", state, code_challenge: challenge, code_challenge_method: "S256", scope: "vkid.personal_info" });
    return { redirect: "https://id.vk.com/authorize?" + q };
  }
  async function vkCallback(req) {
    try {
      const q = req.query, st = await db.get("vs", String(q.state || ""));
      if (!st || Date.now() - st.t > TEN_MIN || !q.code) return { redirect: "/#/err/vk_fail" };
      await db.del("vs", String(q.state));
      const form = new URLSearchParams({ grant_type: "authorization_code", code: q.code, code_verifier: st.v, client_id: process.env.VK_CLIENT_ID, device_id: q.device_id || "", redirect_uri: origin(req) + "/api/auth/vk/cb", state: q.state });
      if (process.env.VK_CLIENT_SECRET) form.set("client_secret", process.env.VK_CLIENT_SECRET);
      const tr = await http("https://id.vk.com/oauth2/auth", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() }), tok = await tr.json();
      if (!tok.access_token) { console.error("vk token:", JSON.stringify(tok).slice(0, 300)); return { redirect: "/#/err/vk_fail" }; }
      const ur = await http("https://id.vk.com/oauth2/user_info", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ access_token: tok.access_token, client_id: process.env.VK_CLIENT_ID }).toString() }), info = await ur.json();
      const user = info.user || {}, sid = String(user.user_id || tok.user_id || "");
      if (!sid) { console.error("vk user:", JSON.stringify(info).slice(0, 300)); return { redirect: "/#/err/vk_fail" }; }
      const r = await socialLogin("vk", sid, user.first_name || "");
      if (r.body.signup) return { redirect: "/#/signup/" + r.body.signup };
      return { redirect: "/", cookies: r.cookies };
    } catch (e) { if (e instanceof Http) return { redirect: "/#/err/" + e.code }; console.error("vk:", e.message); return { redirect: "/#/err/vk_fail" }; }
  }

  /* ---------- rank verification ---------- */
  function setVerified(u, game, rank, src) {
    u.ver = u.ver || {}; u.ver[rank.sys] = Object.assign({ t: Date.now() }, src);
    u.profile.ranks[game] = Object.assign({}, u.profile.ranks[game], { [rank.sys]: rank });
    if (!u.profile.games.includes(game)) u.profile.games.push(game);
  }
  async function dotaRank(steamId) {
    const r = await http("https://api.opendota.com/api/players/" + (BigInt(steamId) - STEAM64).toString()), j = await r.json();
    const rt = Number(j.rank_tier); if (!rt) return null;
    return V.rank("medal", { t: Math.floor(rt / 10) - 1, s: rt % 10 || 1 });
  }
  // FACEIT account that belongs to a Steam account (FACEIT stores the Steam ID of every CS2 player)
  async function faceitPlayer(steamId) {
    const r = await http("https://open.faceit.com/data/v4/players?game=cs2&game_player_id=" + encodeURIComponent(steamId), { headers: { Authorization: "Bearer " + process.env.FACEIT_API_KEY } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Http(502, "link_fail");
    const j = await r.json(), g = (j.games || {}).cs2;
    return { pid: j.player_id, nick: j.nickname, elo: g ? Number(g.faceit_elo) : 0 };
  }
  async function faceitFromSteam(u) {
    if (!u.steam || !config().faceit) return false;
    const p = await faceitPlayer(u.steam.id); if (!p || !p.elo) return false;
    const idx = await db.get("x", "faceit:" + p.pid); if (idx && idx.uid !== u.id) return false;
    if (u.faceit && u.faceit.pid !== p.pid) await db.del("x", "faceit:" + u.faceit.pid);
    u.faceit = { pid: p.pid, nick: p.nick }; await db.put("x", "faceit:" + p.pid, { uid: u.id });
    setVerified(u, "cs2", V.rank("faceit", { elo: p.elo }), { src: "faceit", nick: p.nick });
    return true;
  }
  async function steamStart(req) {
    await need(req);
    const o = origin(req), q = new URLSearchParams({ "openid.ns": "http://specs.openid.net/auth/2.0", "openid.mode": "checkid_setup", "openid.return_to": o + "/api/link/steam/cb", "openid.realm": o,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select", "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select" });
    return { redirect: "https://steamcommunity.com/openid/login?" + q };
  }
  async function steamCallback(req) {
    try {
      const u = await need(req), q = req.query, m = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(String(q["openid.claimed_id"] || ""));
      if (!m || !String(q["openid.return_to"] || "").startsWith(origin(req) + "/api/link/steam/cb")) return { redirect: "/#/err/link_fail" };
      const form = new URLSearchParams(); for (const k of Object.keys(q)) if (k.startsWith("openid.")) form.set(k, q[k]);
      form.set("openid.mode", "check_authentication");
      const vr = await http("https://steamcommunity.com/openid/login", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() });
      if (!/is_valid\s*:\s*true/.test(await vr.text())) return { redirect: "/#/err/link_fail" };
      const idx = await db.get("x", "steam:" + m[1]);
      if (idx && idx.uid !== u.id) return { redirect: "/#/err/link_taken" };
      u.steam = { id: m[1] }; await db.put("x", "steam:" + m[1], { uid: u.id });
      let rank = null; try { rank = await dotaRank(m[1]); } catch (e) { console.error("opendota:", e.message); }
      if (rank) setVerified(u, "dota", rank, { src: "steam" });
      let fc = false; try { fc = await faceitFromSteam(u); } catch (e) { console.error("faceit:", e.message); }
      await db.put("u", u.id, u);
      return { redirect: rank || fc ? "/#/linked/steam" : "/#/linked/steam_norank" };
    } catch (e) { if (e instanceof Http) return { redirect: "/#/err/" + e.code }; console.error("steam:", e.message); return { redirect: "/#/err/link_fail" }; }
  }
  async function refresh(req) {
    const u = await need(req);
    await limit("vref:" + u.id, 6, 3600000);
    let changed = false;
    if (u.steam) { try { const r = await dotaRank(u.steam.id); if (r) { setVerified(u, "dota", r, { src: "steam" }); changed = true; } } catch (e) {} }
    try { if (await faceitFromSteam(u)) changed = true; } catch (e) {}
    if (changed) await db.put("u", u.id, u);
    return { body: { user: me(u) } };
  }
  // used on sign-in, posting and renewing: refresh verified ranks that are older than maxAge
  async function autoRefresh(u, maxAge) {
    if (!u.steam) return false;
    const now = Date.now(), v = u.ver || {}, last = Math.max((v.faceit && v.faceit.t) || 0, (v.medal && v.medal.t) || 0, u.steam.checked || 0);
    if (now - last < maxAge) return false;
    u.steam.checked = now;
    try { const r = await dotaRank(u.steam.id); if (r) setVerified(u, "dota", r, { src: "steam" }); } catch (e) {}
    try { await faceitFromSteam(u); } catch (e) {}
    return true;
  }
  async function unlink(req, what) {
    const u = await need(req);
    if (what === "steam" && u.steam) { await db.del("x", "steam:" + u.steam.id); delete u.steam; if (u.ver) delete u.ver.medal; what = "faceit"; }
    if (what === "faceit" && u.faceit) { await db.del("x", "faceit:" + u.faceit.pid); delete u.faceit; if (u.ver) delete u.ver.faceit; }
    await db.put("u", u.id, u);
    return { body: { user: me(u) } };
  }
  async function userGone(u) {
    if (u.tg) await db.del("x", "tg:" + u.tg.id);
    if (u.vk) await db.del("x", "vk:" + u.vk.id);
    if (u.steam) await db.del("x", "steam:" + u.steam.id);
    if (u.faceit) await db.del("x", "faceit:" + u.faceit.pid);
  }

  const routes = [
    ["POST", /^\/api\/auth\/tg\/start$/, req => tgStart(req, null)],
    ["POST", /^\/api\/auth\/tg\/poll$/, tgPoll],
    ["POST", /^\/api\/auth\/social\/finish$/, socialFinish],
    ["POST", /^\/api\/tg\/hook$/, tgHook],
    ["POST", /^\/api\/me\/tg\/link$/, async req => tgStart(req, (await need(req)).id)],
    ["POST", /^\/api\/me\/tg$/, tgSet],
    ["GET", /^\/api\/auth\/vk\/start$/, vkStart],
    ["GET", /^\/api\/auth\/vk\/cb$/, vkCallback],
    ["GET", /^\/api\/link\/steam\/start$/, steamStart],
    ["GET", /^\/api\/link\/steam\/cb$/, steamCallback],
    ["POST", /^\/api\/link\/refresh$/, refresh],
    ["DELETE", /^\/api\/link\/(steam|faceit)$/, unlink]
  ];
  // deploy-time diagnostics: can the function reach Telegram?
  async function tgCheck() {
    const tok = process.env.TELEGRAM_BOT_TOKEN; if (!tok) return { ok: false, err: "no token" };
    const t0 = Date.now();
    try { const r = await http("https://api.telegram.org/bot" + tok + "/getMe"), j = await r.json(); return { ok: !!j.ok, ms: Date.now() - t0, bot: j.result && j.result.username }; }
    catch (e) { return { ok: false, ms: Date.now() - t0, err: String(e.message).slice(0, 120) }; }
  }
  async function netCheck() {
    const out = {};
    for (const [k, url] of [["steam", "https://steamcommunity.com/openid/login"], ["opendota", "https://api.opendota.com/api/constants/patch"], ["faceit", "https://open.faceit.com/data/v4/games?limit=1"], ["vk", "https://id.vk.com/"], ["telegram", "https://api.telegram.org/"]]) {
      const t0 = Date.now();
      try { const r = await http(url, k === "faceit" ? { headers: { Authorization: "Bearer " + (process.env.FACEIT_API_KEY || "") } } : {}); out[k] = r.status + " in " + (Date.now() - t0) + "ms"; }
      catch (e) { out[k] = "FAIL " + String(e.message).slice(0, 60); }
    }
    return out;
  }
  const noteText = (u, k, a) => { const f = L(u).n[k]; return f ? f(a || []) : ""; };
  return { routes, config, push, pushMessage, userGone, tgCheck, netCheck, autoRefresh, noteText };
};
