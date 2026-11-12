// Builds server/meta.json (validation tables) from the game definitions in web/src/app.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const src = fs.readFileSync(path.join(__dirname, "src/app.js"), "utf8");
const a = src.indexOf("/* ================= games & rank systems ================= */");
const b = src.indexOf("/* ---- v4 constants ---- */");
if (a < 0 || b < 0) throw new Error("markers not found");
const ctx = {};
vm.runInNewContext(src.slice(a, b) + "\n;out = { DURS, GAME_KEYS, GAMES, SYS, REGIONS, STYLES, STAGS };", ctx);
const { DURS, GAME_KEYS, GAMES, SYS, REGIONS, STYLES, STAGS } = ctx.out;
const games = {};
for (const g of GAME_KEYS) {
  const G = GAMES[g], sysOf = {};
  for (const m of Object.keys(G.modes)) sysOf[m] = G.sysOf(m);
  games[g] = { short: G.short || G.name, modeNames: Object.fromEntries(Object.keys(G.modes).map(m => [m, (Array.isArray(G.modes[m]) ? G.modes[m][0] : m)])), roleNames: Object.fromEntries(Object.keys(G.roles).map(r => [r, (Array.isArray(G.roles[r]) ? G.roles[r][0] : r)])), name: G.name, size: G.size, msize: G.msize, modes: Object.keys(G.modes), roles: Object.keys(G.roles), systems: G.systems, sysOf };
}
const sys = {};
for (const k of Object.keys(SYS)) {
  const s = SYS[k];
  sys[k] = s.kind === "tiers" ? { kind: "tiers", n: s.tiers.ru.length, subs: s.subs || 0, subMin: s.subMin || 0, subTop: s.subTop == null ? -1 : s.subTop, names: s.tiers.ru } : { kind: s.kind };
  sys[k].label = Array.isArray(s.label) ? s.label[0] : k;
}
const meta = { durs: DURS, games, sys, regions: Object.keys(REGIONS), styles: STYLES, stags: STAGS, times: ["morning", "day", "evening", "night"], days: ["wd", "we"], langs: ["ru", "en"] };
fs.writeFileSync(path.join(__dirname, "../server/meta.json"), JSON.stringify(meta));
console.log("meta.json:", Object.keys(games).length, "games,", Object.keys(sys).length, "rank systems");
