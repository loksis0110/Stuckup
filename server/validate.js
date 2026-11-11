"use strict";
const META = require("./meta.json");

const EMAIL_RE = /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const NICK_RE = /^[A-Za-zА-Яа-яЁё0-9_.-]{3,20}$/;
const DC_RE = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/;
const TG_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
const RESERVED = ["admin", "administrator", "moderator", "moder", "support", "stuckup", "stackup", "system", "админ", "администратор", "модератор", "поддержка", "стакап"];
const LINK_RE = /(https?:\/\/|www\.|t\.me\/|discord\.gg|discord\.com\/invite|vk\.cc|bit\.ly)/i;

class Bad extends Error { constructor(code, field) { super(code); this.code = code; this.field = field || null; } }

function email(v) {
  const e = String(v || "").trim().toLowerCase();
  if (e.length > 254 || !EMAIL_RE.test(e)) throw new Bad("bad_email", "email");
  return e;
}
function password(v) {
  const p = String(v == null ? "" : v);
  if (p.length < 8) throw new Bad("short_password", "password");
  if (p.length > 72) throw new Bad("long_password", "password");
  return p;
}
function nick(v) {
  const n = String(v || "").trim();
  if (!NICK_RE.test(n)) throw new Bad("bad_nick", "nick");
  if (RESERVED.includes(n.toLowerCase())) throw new Bad("nick_taken", "nick");
  return n;
}
function nickKey(n) { return String(n).toLowerCase().replace(/ё/g, "е"); }

function subset(v, allowed, max) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const x of v) if (typeof x === "string" && allowed.includes(x) && !out.includes(x)) out.push(x);
  return out.slice(0, max || allowed.length);
}
function rank(sys, r) {
  const s = META.sys[sys];
  if (!s || !r || typeof r !== "object") return null;
  if (s.kind === "rating") { const v = Math.round(Number(r.v)); return Number.isFinite(v) && v >= 0 && v <= 40000 ? { sys, v } : null; }
  if (s.kind === "faceit") { const e = Math.round(Number(r.elo)); return Number.isFinite(e) && e >= 100 && e <= 5000 ? { sys, elo: e } : null; }
  const t = Number(r.t);
  if (!Number.isInteger(t) || t < 0 || t >= s.n) return null;
  const out = { sys, t };
  if (s.subs && t >= s.subMin && t <= s.subTop) { const sv = Number(r.s); out.s = Number.isInteger(sv) && sv >= 1 && sv <= s.subs ? sv : 1; }
  return out;
}
function contacts(dc, tg) {
  const d = String(dc || "").trim().replace(/^@/, "").toLowerCase();
  const t = String(tg || "").trim().replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, "").replace(/^@/, "").replace(/\/.*$/, "");
  if (d && !DC_RE.test(d)) throw new Bad("bad_dc", "dc");
  if (t && !TG_RE.test(t)) throw new Bad("bad_tg", "tg");
  return { dc: d, tg: t };
}
function blankProfile(lang) {
  return { dc: "", tg: "", langs: [lang === "en" ? "en" : "ru"], region: "ru", adult: false, games: [], roles: {}, ranks: {}, time: [], days: [], style: "fun", onboarded: false };
}
// Returns a clean profile built only from known fields; unknown input is dropped.
function profile(input, prev) {
  const p = input && typeof input === "object" ? input : {}, old = prev || blankProfile();
  const c = contacts(p.dc != null ? p.dc : old.dc, p.tg != null ? p.tg : old.tg);
  const out = { dc: c.dc, tg: c.tg };
  out.langs = subset(p.langs != null ? p.langs : old.langs, META.langs); if (!out.langs.length) out.langs = ["ru"];
  out.region = META.regions.includes(p.region) ? p.region : (old.region || "ru");
  out.adult = p.adult != null ? p.adult === true : !!old.adult;
  out.games = subset(p.games != null ? p.games : old.games, Object.keys(META.games));
  out.time = subset(p.time != null ? p.time : old.time, META.times);
  out.days = subset(p.days != null ? p.days : old.days, META.days);
  out.style = META.styles.includes(p.style) ? p.style : (old.style || "fun");
  out.onboarded = p.onboarded != null ? p.onboarded === true : !!old.onboarded;
  const rolesIn = p.roles && typeof p.roles === "object" ? p.roles : (old.roles || {}), ranksIn = p.ranks && typeof p.ranks === "object" ? p.ranks : (old.ranks || {});
  out.roles = {}; out.ranks = {};
  for (const g of Object.keys(META.games)) {
    const G = META.games[g];
    const rl = subset(rolesIn[g], G.roles); if (rl.length) out.roles[g] = rl;
    const rk = ranksIn[g];
    if (rk && typeof rk === "object") {
      const o = {};
      for (const sys of G.systems) { const r = rank(sys, rk[sys]); if (r) o[sys] = r; }
      if (Object.keys(o).length) out.ranks[g] = o;
    }
  }
  return out;
}
function note(v) {
  const s = String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  if (LINK_RE.test(s)) throw new Bad("no_links", "note");
  return s;
}
// Validates a new listing against the game tables. `prof` is the author's saved profile.
function post(input, prof) {
  const p = input && typeof input === "object" ? input : {};
  const G = META.games[p.game];
  if (!G) throw new Bad("bad_game", "game");
  if (!G.modes.includes(p.mode)) throw new Bad("bad_mode", "mode");
  const sys = G.sysOf[p.mode], r = rank(sys, p.r);
  if (!r) throw new Bad("need_rank", "rank");
  const size = G.msize[p.mode] || G.size;
  let have = Math.round(Number(p.have)); if (!Number.isFinite(have)) have = 1;
  have = Math.max(1, Math.min(size - 1, have));
  let roles = subset(p.roles, G.roles); if (!roles.length) roles = [G.roles[0]];
  const dur = META.durs.includes(Number(p.dur)) ? Number(p.dur) : 180;
  let stags = subset(p.stags, META.stags); if (!prof.adult) stags = stags.filter(s => s !== "adult");
  return {
    game: p.game, mode: p.mode, r, roles, have,
    region: META.regions.includes(p.region) ? p.region : prof.region,
    mic: p.mic !== false, note: note(p.note), dur,
    style: META.styles.includes(p.style) ? p.style : prof.style, stags
  };
}

module.exports = { META, Bad, email, password, nick, nickKey, profile, blankProfile, post, rank, contacts, note };
