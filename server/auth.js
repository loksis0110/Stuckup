"use strict";
const crypto = require("crypto");

const SESSION_DAYS = 30;
const COOKIE = "sid";

function secret() { return process.env.SESSION_SECRET || "dev-secret-not-for-production"; }
function b64u(buf) { return Buffer.from(buf).toString("base64url"); }
function hmac(s) { return b64u(crypto.createHmac("sha256", secret()).update(s).digest()); }
function safeEq(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }

function scrypt(pw, salt) {
  return new Promise((res, rej) => crypto.scrypt(String(pw), salt, 32, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))));
}
async function hashPassword(pw) { const salt = crypto.randomBytes(16); return "s1$" + b64u(salt) + "$" + b64u(await scrypt(pw, salt)); }
async function checkPassword(pw, stored) {
  const p = String(stored || "").split("$");
  if (p.length !== 3 || p[0] !== "s1") return false;
  const key = await scrypt(pw, Buffer.from(p[1], "base64url"));
  return safeEq(b64u(key), p[2]);
}

function newId(n) { return b64u(crypto.randomBytes(n || 9)); }
// Time-sortable id: fixed-width base36 milliseconds + random tail
let lastMs = 0, seq = 0;
function timeId() {
  let ms = Date.now();
  if (ms <= lastMs) { ms = lastMs; seq++; } else { lastMs = ms; seq = 0; }
  return ms.toString(36).padStart(9, "0") + seq.toString(36).padStart(2, "0") + b64u(crypto.randomBytes(4));
}

function newCode() { return String(crypto.randomInt(0, 1000000)).padStart(6, "0"); }
function codeHash(email, code) { return hmac("code|" + email + "|" + code); }

function makeSession(uid, sv) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const body = uid + "." + exp + "." + (sv || 0);
  return body + "." + hmac("sess|" + body);
}
function readSession(tok) {
  const p = String(tok || "").split(".");
  if (p.length !== 4) return null;
  const body = p[0] + "." + p[1] + "." + p[2];
  if (!safeEq(hmac("sess|" + body), p[3])) return null;
  if (+p[1] < Date.now() / 1000) return null;
  return { uid: p[0], sv: +p[2] };
}
function sessionCookie(tok) { return COOKIE + "=" + tok + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + SESSION_DAYS * 86400; }
function clearCookie() { return COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"; }

module.exports = { COOKIE, hashPassword, checkPassword, newId, timeId, newCode, codeHash, makeSession, readSession, sessionCookie, clearCookie, safeEq, hmac };
