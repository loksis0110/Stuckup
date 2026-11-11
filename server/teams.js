"use strict";
// Teams and scrims: rosters, applications, scrim slots, bookings, map veto, results and team rating.
const A = require("./auth"), V = require("./validate");
const META = V.META;

const SCRIM_GAMES = ["cs2", "valorant", "dota", "lol", "deadlock", "rivals", "standoff"];
const MAPS = { cs2: ["Mirage", "Inferno", "Nuke", "Ancient", "Anubis", "Dust II", "Overpass"], valorant: ["Abyss", "Ascent", "Haven", "Lotus", "Split", "Summit", "Sunset"], standoff: ["Sandstone", "Province", "Rust", "Zone 9", "Sakura", "Breeze", "Dune"] };
const FORMATS = { bo1: 1, bo2: 2, bo3: 3 };
const VETO_SEQ = { bo1: ["ban", "ban", "ban", "ban", "ban", "ban", "dec"], bo2: ["ban", "ban", "pick", "pick"], bo3: ["ban", "ban", "pick", "pick", "ban", "ban", "dec"] };
const PERMS = { scrims: ["captain", "manager"], apps: ["captain", "manager"], veto: ["captain", "manager", "coach"], roster: ["captain"] };
const TROLES = ["manager", "coach", "player", "sub"];
const TTL = 4000;

module.exports = function makeTeams(ctx) {
  const { db, Http, need, currentUser, limit, notify } = ctx;
  let cache = null, gen = 0;

  async function load() {
    const now = Date.now();
    if (cache && now - cache.t < TTL) return cache;
    const g0 = gen;
    const teams = (await db.list("t")).map(r => r.d), scrims = [];
    for (const r of await db.list("s")) {
      const s = r.d;
      // open or unanswered slots vanish an hour after their start time; played ones are kept
      if ((s.status === "open" || s.status === "requested") && s.at < now - 3600000) { await db.del("s", s.id); continue; }
      scrims.push(s);
    }
    const fresh = { t: now, teams, scrims };
    if (g0 === gen) cache = fresh;   // a write happened while reading: do not keep a stale snapshot
    return fresh;
  }
  const dirty = () => { cache = null; gen++; };
  const stats = tm => Object.assign({ rating: 1000, w: 0, l: 0, d: 0, ok: 0, late: 0, ns: 0 }, tm.st || {});
  const roleOf = (tm, uid) => { const m = tm.members.find(x => x.uid === uid); return m ? m.trole : null; };
  const can = (tm, uid, what) => PERMS[what].includes(roleOf(tm, uid));
  const mainCount = tm => tm.members.filter(m => m.trole !== "coach" && m.trole !== "sub").length;
  async function team(id) { const tm = await db.get("t", String(id)); if (!tm) throw new Http(404, "team_gone"); return tm; }
  async function scrim(id) { const s = await db.get("s", String(id)); if (!s) throw new Http(404, "scrim_gone"); return s; }
  async function saveTeam(tm) { await db.put("t", tm.id, tm); dirty(); }
  async function saveScrim(s) { await db.put("s", s.id, s); dirty(); }
  async function tellManagers(tm, k, a, except) { for (const m of tm.members) if (PERMS.scrims.includes(m.trole) && m.uid !== except) await notify(m.uid, k, a, { type: "myteam", id: tm.id }); }
  function memberOf(u, game, trole) {
    const ranks = (u.profile.ranks || {})[game] || {}, sys = META.games[game].systems.find(s => ranks[s]);
    const role = ((u.profile.roles || {})[game] || [])[0] || null;
    return { uid: u.id, nick: u.nick, role, r: sys ? ranks[sys] : null, trole };
  }
  function viewTeam(tm, uid) {
    const o = Object.assign({}, tm, { st: stats(tm) });
    if (!uid || !can(tm, uid, "apps")) o.apps = [];
    return o;
  }
  const text = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

  /* ---------- teams ---------- */
  async function list(req) {
    const u = await currentUser(req), c = await load(), now = Date.now();
    const mine = u ? c.teams.filter(tm => roleOf(tm, u.id)).map(tm => tm.id) : [];
    const scrims = c.scrims.filter(s => (s.status === "open" && s.at > now - 1800000) || mine.includes(s.host) || mine.includes(s.guest));
    return { body: { teams: c.teams.map(tm => viewTeam(tm, u && u.id)), scrims, apps: u ? Object.keys(u.apps || {}) : [], now } };
  }
  async function create(req) {
    const u = await need(req), b = req.json, G = META.games[b.game];
    if (!G) throw new Http(400, "bad_game");
    const name = text(b.name, 24), tag = String(b.tag || "").trim().toUpperCase();
    if (name.length < 3) throw new Http(400, "team_err_name");
    if (!/^[A-Z0-9]{2,5}$/.test(tag)) throw new Http(400, "team_err_tag");
    if (/(https?:|www\.|t\.me|discord\.gg)/i.test(name + " " + b.desc + " " + b.sched)) throw new Http(400, "no_links");
    u.teams = u.teams || {};
    if (u.teams[b.game]) throw new Http(400, "team_have");
    if (await db.get("tt", tag)) throw new Http(409, "tag_taken");
    await limit("team:" + u.id, 5, 86400000);
    const open = Array.isArray(b.open) ? G.roles.filter(r => b.open.includes(r)) : [];
    const tm = { id: A.newId(8), name, tag, game: b.game, region: u.profile.region, style: META.styles.includes(b.style) ? b.style : "serious", size: G.size, open,
      desc: text(b.desc, 240), sched: text(b.sched, 80), members: [memberOf(u, b.game, "captain")], apps: [], st: null, created: Date.now() };
    await db.put("tt", tag, { id: tm.id });
    await saveTeam(tm);
    u.teams[b.game] = tm.id; if (!u.profile.games.includes(b.game)) u.profile.games.push(b.game);
    await db.put("u", u.id, u);
    return { body: { team: viewTeam(tm, u.id) } };
  }
  async function apply(req, id) {
    const u = await need(req), tm = await team(id), b = req.json;
    if (roleOf(tm, u.id)) throw new Http(400, "team_member");
    if ((u.teams || {})[tm.game]) throw new Http(400, "team_have");
    if (mainCount(tm) >= tm.size) throw new Http(400, "team_full");
    if (tm.apps.some(a => a.uid === u.id)) return { body: { ok: true } };
    if (tm.apps.length >= 30) throw new Http(400, "list_full");
    await limit("apply:" + u.id, 20, 86400000);
    const m = memberOf(u, tm.game, "player");
    m.role = META.games[tm.game].roles.includes(b.role) ? b.role : (m.role || META.games[tm.game].roles[0]);
    m.msg = V.note(text(b.msg, 300)); m.t = Date.now();
    tm.apps.push(m); await saveTeam(tm);
    u.apps = u.apps || {}; u.apps[tm.id] = m.role; await db.put("u", u.id, u);
    await tellManagers(tm, "app", [u.nick, tm.name]);
    return { body: { ok: true } };
  }
  async function answerApp(req, id) {
    const u = await need(req), tm = await team(id), b = req.json;
    if (!can(tm, u.id, "apps")) throw new Http(403, "no_rights");
    const i = tm.apps.findIndex(a => a.uid === b.uid); if (i < 0) throw new Http(404, "app_gone");
    const [ap] = tm.apps.splice(i, 1), target = await db.get("u", ap.uid);
    if (target) { if (target.apps) delete target.apps[tm.id]; }
    if (b.accept && target && !target.banned) {
      if ((target.teams || {})[tm.game]) { await saveTeam(tm); await db.put("u", target.id, target); throw new Http(400, "app_has_team"); }
      tm.members.push({ uid: ap.uid, nick: target.nick, role: ap.role, r: ap.r, trole: mainCount(tm) >= tm.size ? "sub" : "player" });
      tm.open = tm.open.filter(r => r !== ap.role);
      target.teams = target.teams || {}; target.teams[tm.game] = tm.id;
    }
    await saveTeam(tm);
    if (target) { await db.put("u", target.id, target); await notify(target.id, b.accept ? "app_ok" : "app_no", [tm.name], { type: b.accept ? "myteam" : "teams", id: tm.id }); }
    return { body: { ok: true } };
  }
  async function setRole(req, id) {
    const u = await need(req), tm = await team(id), b = req.json;
    if (!can(tm, u.id, "roster")) throw new Http(403, "no_rights");
    const m = tm.members.find(x => x.uid === b.uid);
    if (!m || m.uid === u.id || !TROLES.includes(b.trole)) throw new Http(400, "bad_target");
    m.trole = b.trole; await saveTeam(tm);
    return { body: { ok: true } };
  }
  async function removeMember(tm, uid) {
    tm.members = tm.members.filter(m => m.uid !== uid);
    const x = await db.get("u", uid);
    if (x && x.teams && x.teams[tm.game] === tm.id) { delete x.teams[tm.game]; await db.put("u", x.id, x); }
  }
  async function kick(req, id) {
    const u = await need(req), tm = await team(id), uid = String(req.json.uid || "");
    if (!can(tm, u.id, "roster") || uid === u.id || !roleOf(tm, uid)) throw new Http(403, "no_rights");
    await removeMember(tm, uid); await saveTeam(tm);
    await notify(uid, "kicked", [tm.name], { type: "teams" });
    return { body: { ok: true } };
  }
  async function disband(tm) {
    for (const m of tm.members) await removeMember(tm, m.uid);
    for (const a of tm.apps || []) { const x = await db.get("u", a.uid); if (x && x.apps) { delete x.apps[tm.id]; await db.put("u", x.id, x); } }
    for (const r of await db.list("s")) {
      const s = r.d; if (s.host !== tm.id && s.guest !== tm.id) continue;
      if (s.status === "played") continue;
      if (s.host === tm.id) { await db.del("s", s.id); if (s.guest) { const o = await db.get("t", s.guest); if (o) await tellManagers(o, "sc_cancel", [tm.name]); } }
      else { s.guest = null; s.status = "open"; delete s.veto; delete s.maps; delete s.rep; await db.put("s", s.id, s); const o = await db.get("t", s.host); if (o) await tellManagers(o, "sc_cancel", [tm.name]); }
    }
    await db.del("tt", tm.tag); await db.del("t", tm.id); dirty();
  }
  async function leave(req, id) {
    const u = await need(req), tm = await team(id), role = roleOf(tm, u.id);
    if (!role) { if (u.apps && u.apps[tm.id]) { delete u.apps[tm.id]; await db.put("u", u.id, u); tm.apps = tm.apps.filter(a => a.uid !== u.id); await saveTeam(tm); } return { body: { ok: true } }; }
    if (role === "captain") throw new Http(400, "captain_leave");
    await removeMember(tm, u.id); await saveTeam(tm);
    return { body: { ok: true } };
  }
  async function remove(req, id) {
    const u = await need(req), tm = await team(id);
    if (roleOf(tm, u.id) !== "captain") throw new Http(403, "no_rights");
    await disband(tm);
    return { body: { ok: true } };
  }
  // called when an account is deleted or renamed
  async function userGone(u) {
    for (const g of Object.keys(u.teams || {})) {
      const tm = await db.get("t", u.teams[g]); if (!tm) continue;
      const role = roleOf(tm, u.id), rest = tm.members.filter(m => m.uid !== u.id);
      if (role === "captain" && !rest.length) { await disband(tm); continue; }
      if (role === "captain") (rest.find(m => m.trole === "manager") || rest[0]).trole = "captain";
      tm.members = rest; await saveTeam(tm);
    }
    for (const id of Object.keys(u.apps || {})) { const tm = await db.get("t", id); if (tm) { tm.apps = tm.apps.filter(a => a.uid !== u.id); await saveTeam(tm); } }
  }
  async function userRenamed(u) {
    for (const g of Object.keys(u.teams || {})) { const tm = await db.get("t", u.teams[g]); if (!tm) continue; const m = tm.members.find(x => x.uid === u.id); if (m) { m.nick = u.nick; await saveTeam(tm); } }
  }

  /* ---------- scrims ---------- */
  async function newSlot(req) {
    const u = await need(req), b = req.json, tm = await team(b.team), at = Math.round(Number(b.at)), now = Date.now();
    if (!can(tm, u.id, "scrims")) throw new Http(403, "no_rights");
    if (!SCRIM_GAMES.includes(tm.game)) throw new Http(400, "bad_game");
    if (!(at > now && at < now + 21 * 86400000)) throw new Http(400, "bad_time");
    if (!FORMATS[b.format]) throw new Http(400, "bad_format");
    await limit("slot:" + u.id, 20, 86400000);
    const s = { id: A.timeId(), host: tm.id, guest: null, game: tm.game, at, format: b.format, note: V.note(text(b.note, 80)), status: "open", created: now };
    await saveScrim(s);
    return { body: { scrim: s } };
  }
  async function book(req, id) {
    const u = await need(req), s = await scrim(id), tm = await team(req.json.team), host = await team(s.host);
    if (!can(tm, u.id, "scrims")) throw new Http(403, "no_rights");
    if (s.status !== "open" || s.at < Date.now()) throw new Http(400, "slot_taken");
    if (tm.id === s.host || tm.game !== s.game) throw new Http(400, "bad_target");
    s.guest = tm.id; s.status = "requested"; await saveScrim(s);
    await tellManagers(host, "book", [tm.name, String(s.at)]);
    return { body: { scrim: s } };
  }
  async function answer(req, id) {
    const u = await need(req), s = await scrim(id), host = await team(s.host);
    if (!can(host, u.id, "scrims")) throw new Http(403, "no_rights");
    if (s.status !== "requested") throw new Http(400, "slot_taken");
    const guest = await db.get("t", s.guest);
    if (req.json.accept && guest) { s.status = "confirmed"; if (MAPS[s.game]) s.veto = { i: 0, res: {}, order: [] }; }
    else { s.status = "open"; s.guest = null; }
    await saveScrim(s);
    if (guest) await tellManagers(guest, req.json.accept ? "book_ok" : "book_no", req.json.accept ? [host.name, String(s.at)] : [host.name]);
    return { body: { scrim: s } };
  }
  async function cancel(req, id) {
    const u = await need(req), s = await scrim(id), host = await team(s.host), guest = s.guest ? await db.get("t", s.guest) : null;
    const asHost = can(host, u.id, "scrims"), asGuest = guest && can(guest, u.id, "scrims");
    if (!asHost && !asGuest) throw new Http(403, "no_rights");
    if (!["open", "requested", "confirmed"].includes(s.status)) throw new Http(400, "slot_taken");
    if (asHost) { await db.del("s", s.id); dirty(); if (guest) await tellManagers(guest, "sc_cancel", [host.name]); }
    else { const was = s.status; s.status = "open"; s.guest = null; delete s.veto; delete s.maps; await saveScrim(s); if (was === "confirmed") await tellManagers(host, "sc_cancel", [guest.name]); }
    return { body: { ok: true } };
  }
  async function sides(u, s, what) {
    const host = await team(s.host), guest = await team(s.guest);
    const side = can(host, u.id, what) ? "host" : can(guest, u.id, what) ? "guest" : null;
    if (!side) throw new Http(403, "no_rights");
    return { host, guest, side, mine: side === "host" ? host : guest, other: side === "host" ? guest : host };
  }
  async function veto(req, id) {
    const u = await need(req), s = await scrim(id);
    if (s.status !== "confirmed" || !s.veto) throw new Http(400, "veto_closed");
    const x = await sides(u, s, "veto"), seq = VETO_SEQ[s.format], v = s.veto, map = String(req.json.map || "");
    if (v.i >= seq.length) throw new Http(400, "veto_closed");
    if ((v.i % 2 === 0 ? "host" : "guest") !== x.side) throw new Http(400, "veto_turn");
    if (!MAPS[s.game].includes(map) || v.res[map]) throw new Http(400, "veto_map");
    const put = (m, by) => { const a = seq[v.i]; v.res[m] = { a, by }; if (a !== "ban") v.order.push(m); v.i++; };
    put(map, x.side);
    while (v.i < seq.length && seq[v.i] === "dec") put(MAPS[s.game].find(m => !v.res[m]), null);
    if (v.i >= seq.length) s.maps = v.order.slice(); else await tellManagers(x.other, "veto", [x.mine.name]);
    await saveScrim(s);
    return { body: { scrim: s } };
  }
  async function report(req, id) {
    const u = await need(req), s = await scrim(id), b = req.json;
    if (s.status !== "confirmed") throw new Http(400, "report_closed");
    if (s.at > Date.now() + 600000 && !process.env.DEV_EARLY_REPORT) throw new Http(400, "report_early");
    const x = await sides(u, s, "veto"), beh = ["ok", "late", "ns"].includes(b.beh) ? b.beh : "ok";
    let wins = 0, losses = 0; const games = [];
    if (beh !== "ns") {
      for (const g of (Array.isArray(b.games) ? b.games : []).slice(0, FORMATS[s.format])) {
        const a = Math.round(Number(g.a)), c = Math.round(Number(g.b));
        if (!(a >= 0 && a <= 99 && c >= 0 && c <= 99) || a === c) continue;
        games.push({ map: MAPS[s.game] && MAPS[s.game].includes(g.map) ? g.map : "", a, b: c }); a > c ? wins++ : losses++;
      }
      if (!wins && !losses) throw new Http(400, "rep_need");
    }
    s.status = "reported"; s.rep = { by: x.side, beh, wins, losses, games, t: Date.now() };
    await saveScrim(s);
    await tellManagers(x.other, "result", [x.mine.name]);
    return { body: { scrim: s } };
  }
  async function confirm(req, id) {
    const u = await need(req), s = await scrim(id), b = req.json;
    if (s.status !== "reported") throw new Http(400, "report_closed");
    const x = await sides(u, s, "veto");
    if (x.side === s.rep.by) throw new Http(400, "report_own");
    if (!b.ok) { s.status = "disputed"; await saveScrim(s); return { body: { scrim: s } }; }
    const rep = s.rep, R = x.other, C = x.mine, rs = stats(R), cs = stats(C);   // R reported, C confirms
    const beh2 = ["ok", "late"].includes(b.beh) ? b.beh : "ok";
    if (rep.beh === "ns") { cs.ns++; s.res = { ns: rep.by === "host" ? "guest" : "host" }; }
    else {
      const res = rep.wins > rep.losses ? 1 : rep.wins < rep.losses ? 0 : 0.5, E = 1 / (1 + Math.pow(10, (cs.rating - rs.rating) / 400)), d = Math.round(32 * (res - E));
      rs.rating += d; cs.rating -= d;
      if (res === 1) { rs.w++; cs.l++; } else if (res === 0) { rs.l++; cs.w++; } else { rs.d++; cs.d++; }
      cs[rep.beh === "late" ? "late" : "ok"]++; rs[beh2]++;
      s.res = { by: rep.by, res, delta: d, wins: rep.wins, losses: rep.losses };
    }
    R.st = rs; C.st = cs; s.status = "played"; s.played = Date.now();
    await db.put("t", R.id, R); await db.put("t", C.id, C); await saveScrim(s);
    await tellManagers(R, "result_ok", [C.name]);
    return { body: { scrim: s } };
  }

  const ID = "([A-Za-z0-9_-]{6,40})";
  const routes = [
    ["GET", /^\/api\/teams$/, list],
    ["POST", /^\/api\/teams$/, create],
    ["POST", new RegExp("^/api/teams/" + ID + "/apply$"), apply],
    ["POST", new RegExp("^/api/teams/" + ID + "/apps$"), answerApp],
    ["POST", new RegExp("^/api/teams/" + ID + "/role$"), setRole],
    ["POST", new RegExp("^/api/teams/" + ID + "/kick$"), kick],
    ["POST", new RegExp("^/api/teams/" + ID + "/leave$"), leave],
    ["DELETE", new RegExp("^/api/teams/" + ID + "$"), remove],
    ["POST", /^\/api\/scrims$/, newSlot],
    ["POST", new RegExp("^/api/scrims/" + ID + "/book$"), book],
    ["POST", new RegExp("^/api/scrims/" + ID + "/answer$"), answer],
    ["POST", new RegExp("^/api/scrims/" + ID + "/cancel$"), cancel],
    ["POST", new RegExp("^/api/scrims/" + ID + "/veto$"), veto],
    ["POST", new RegExp("^/api/scrims/" + ID + "/report$"), report],
    ["POST", new RegExp("^/api/scrims/" + ID + "/confirm$"), confirm]
  ];
  return { routes, userGone, userRenamed, dirty };
};
