"use strict";
// Entry point of the Cloud Function behind API Gateway: serves /api/* and the static site.
const fs = require("fs"), path = require("path"), zlib = require("zlib"), crypto = require("crypto");
const { MemDb, DocDb } = require("./db");
const makeApi = require("./api");

const db = process.env.DOCAPI_ENDPOINT ? new DocDb(process.env.DOCAPI_ENDPOINT, process.env.TABLE_NAME) : new MemDb();
const api = makeApi(db);

const STATIC = path.join(__dirname, "static");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2" };
const TEXT = [".html", ".js", ".css", ".json", ".webmanifest", ".txt", ".xml", ".svg"];
const PAGES = { "/": "index.html", "/privacy": "privacy.html", "/rules": "rules.html", "/admin": "admin.html" };
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com https://storage.yandexcloud.net; media-src 'self' blob: https://storage.yandexcloud.net; font-src 'self'; connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://storage.yandexcloud.net; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

const files = new Map();
function walk(dir, pre) {
  let list = []; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const d of list) { if (d.isDirectory()) walk(path.join(dir, d.name), pre + d.name + "/"); else files.set(pre + d.name, null); }
}
walk(STATIC, "");
function asset(rel) {
  if (!files.has(rel)) return null;
  let f = files.get(rel);
  if (!f) {
    const buf = fs.readFileSync(path.join(STATIC, rel)), ext = path.extname(rel).toLowerCase(), text = TEXT.includes(ext);
    f = { type: TYPES[ext] || "application/octet-stream", raw: buf, gz: text && !process.env.NO_GZIP ? zlib.gzipSync(buf, { level: 9 }) : null, html: ext === ".html",
      etag: '"' + crypto.createHash("sha1").update(buf).digest("base64url").slice(0, 16) + '"' };
    files.set(rel, f);
  }
  return f;
}

function lower(h) { const o = {}; for (const k of Object.keys(h || {})) o[k.toLowerCase()] = Array.isArray(h[k]) ? h[k].join(", ") : String(h[k]); return o; }
function reqPath(ev) {
  const rc = ev.requestContext || {};
  for (const c of [ev.url, ev.path, ev.rawPath, rc.path]) if (typeof c === "string" && c.startsWith("/") && !c.includes("{")) return c.split("?")[0];
  const pp = ev.pathParams || ev.pathParameters || ev.params || {};
  if (pp.proxy != null) return "/" + String(pp.proxy).replace(/^\/+/, "");
  return "/";
}
function cookies(h) { const o = {}; String(h || "").split(";").forEach(p => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }); return o; }
function out(status, headers, body, b64, setCookies) {
  const r = { statusCode: status, headers, body: body || "", isBase64Encoded: !!b64 };
  if (setCookies && setCookies.length) r.multiValueHeaders = { "Set-Cookie": setCookies };
  return r;
}

let SLUGS = {}; try { SLUGS = JSON.parse(fs.readFileSync(path.join(STATIC, "g/slugs.json"), "utf8")); } catch (e) {}
const META = require("./meta.json"), { rankText } = require("./jobs");
const escH = x => String(x == null ? "" : x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
// landing page of a game with the current listings rendered on the server (visible to search engines)
async function gamePage(key, method, headers) {
  const G = META.games[key], posts = (await api.seo(key)).slice(0, 20), now = Date.now();
  const ago = t => { const m = Math.max(1, Math.round((now - t) / 60000)); return m < 60 ? m + " мин назад" : Math.round(m / 60) + " ч назад"; };
  const list = posts.length ? '<ul class="list">' + posts.map(p => {
    const size = G.msize[p.mode] || G.size, roles = (p.roles || []).map(r => (G.roleNames[r] || r)).join(", ");
    return `<li><div class="h"><b>${escH(p.nick)}</b><span>${(() => { const mn = G.modeNames[p.mode] || p.mode, rt = rankText(p.r); return escH(rt.startsWith(mn) ? rt : mn + " · " + rt); })()}${p.ver ? " · подтверждён" : ""}</span><span>ищет ${size - p.have}${roles ? " · " + escH(roles) : ""}</span><span>${ago(p.t0)}</span></div>${p.note ? `<p>${escH(p.note)}</p>` : ""}</li>`;
  }).join("") + "</ul>" : `<p class="muted">Прямо сейчас объявлений нет — разместите своё первым, его увидят все, кто ищет пати в ${escH(G.name)}.</p>`;
  const body = Buffer.from(asset("g/" + key + ".html").raw.toString("utf8").replace("<!--COUNT-->", posts.length ? posts.length + " " + plural(posts.length, "объявление", "объявления", "объявлений") : "").replace("<!--LIST-->", list));
  const h = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60", "Content-Security-Policy": CSP, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };
  if (method === "HEAD") return out(200, h, "");
  if (/\bgzip\b/.test(headers["accept-encoding"] || "")) { h["Content-Encoding"] = "gzip"; h.Vary = "Accept-Encoding"; return out(200, h, zlib.gzipSync(body).toString("base64"), true); }
  return out(200, h, body.toString("utf8"));
}

async function handler(event, context) {
  event = event || {};
  if (db.setToken && context && context.token) db.setToken(context.token.access_token);
  // timer trigger: background jobs (mail queue, backups)
  if (Array.isArray(event.messages) && !event.httpMethod) { const r = await api.cron(); console.log("cron", JSON.stringify(r)); return { statusCode: 200, body: "" }; }
  const headers = lower(event.headers), rc = event.requestContext || {};
  const method = String(event.httpMethod || rc.httpMethod || (rc.http && rc.http.method) || "GET").toUpperCase();
  let p = reqPath(event); try { p = decodeURIComponent(p); } catch (e) {}
  if (p.length > 1) p = p.replace(/\/+$/, "") || "/";

  // local dev only: stand-in for Object Storage
  if (p.startsWith("/api/devstore/") && !process.env.DOCAPI_ENDPOINT && !process.env.S3_BUCKET) {
    const r = api.devstore(method, p.slice("/api/devstore/".length), event.isBase64Encoded ? event.body : Buffer.from(event.body || "").toString("base64"));
    return r.body ? out(200, { "Content-Type": "application/octet-stream" }, r.body.toString("base64"), true) : out(r.status, {}, "");
  }
  if (p === "/api" || p.startsWith("/api/")) {
    let json;
    if (event.body) {
      const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : String(event.body);
      if (raw.length > 32768) return out(413, { "Content-Type": "application/json; charset=utf-8" }, '{"error":"too_large"}');
      try { json = JSON.parse(raw); } catch (e) { json = undefined; }
    }
    const ip = String((rc.identity && rc.identity.sourceIp) || (headers["x-forwarded-for"] || "").split(",")[0].trim() || "0").slice(0, 64);
    const r = await api({ method, path: p, query: event.queryStringParameters || {}, headers, cookies: cookies(headers.cookie), json, ip });
    if (r.redirect) return out(302, { Location: r.redirect, "Cache-Control": "no-store" }, "", false, r.cookies);
    return out(r.status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }, JSON.stringify(r.body), false, r.cookies);
  }

  if (method !== "GET" && method !== "HEAD") return out(405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
  const gameKey = SLUGS[p];
  if (gameKey && asset("g/" + gameKey + ".html")) return gamePage(gameKey, method, headers);
  let rel = PAGES[p] || p.slice(1), status = 200, f = asset(rel);
  if (!f && /^ranks\/[a-z0-9-]+$/.test(rel)) { rel += ".html"; f = asset(rel); }
  if (!f) { f = asset("404.html"); status = 404; if (!f) return out(404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found"); }
  const h = { "Content-Type": f.type, ETag: f.etag, "X-Content-Type-Options": "nosniff", "Cache-Control": f.html ? "no-cache" : rel.startsWith("fonts/") ? "public, max-age=31536000, immutable" : "public, max-age=86400" };
  if (f.html) { h["Content-Security-Policy"] = CSP; h["Referrer-Policy"] = "strict-origin-when-cross-origin"; h["X-Frame-Options"] = "DENY"; }
  if (status === 200 && headers["if-none-match"] === f.etag) return out(304, h, "");
  if (method === "HEAD") return out(status, h, "");
  if (f.gz && /\bgzip\b/.test(headers["accept-encoding"] || "")) { h["Content-Encoding"] = "gzip"; h.Vary = "Accept-Encoding"; return out(status, h, f.gz.toString("base64"), true); }
  return f.gz ? out(status, h, f.raw.toString("utf8")) : out(status, h, f.raw.toString("base64"), true);
}

module.exports = { handler, db };
