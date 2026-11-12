"use strict";
// Minimal SMTP client (implicit TLS on 465, STARTTLS otherwise) with AUTH LOGIN.
// Written by hand so the function has no npm dependencies.
const tls = require("tls"), net = require("net"), crypto = require("crypto");

function cfg() {
  const e = process.env;
  const port = +(e.SMTP_PORT || 465);
  return { host: e.SMTP_HOST || "", port, implicitTls: e.SMTP_SECURE ? e.SMTP_SECURE === "tls" : port === 465, user: e.SMTP_USER || "", pass: e.SMTP_PASS || "", from: e.MAIL_FROM || e.SMTP_USER || "" };
}
function mode() { const c = cfg(); return c.host && c.user && c.pass ? "smtp" : "dev"; }

function encWord(s) { return /^[\x20-\x7e]*$/.test(s) ? s : "=?UTF-8?B?" + Buffer.from(s).toString("base64") + "?="; }
function b64lines(s) { return Buffer.from(s).toString("base64").replace(/(.{76})/g, "$1\r\n"); }
function buildMessage(m) {
  const b = "b" + crypto.randomBytes(12).toString("hex"), domain = m.from.split("@")[1] || "stuckup.ru";
  return [
    "From: " + encWord(m.fromName || "Stuckup") + " <" + m.from + ">",
    "To: <" + m.to + ">",
    "Subject: " + encWord(m.subject),
    "Date: " + new Date().toUTCString().replace("GMT", "+0000"),
    "Message-ID: <" + crypto.randomBytes(12).toString("hex") + "@" + domain + ">",
    "MIME-Version: 1.0",
    "Auto-Submitted: auto-generated",
    ...(m.headers || []),
    'Content-Type: multipart/alternative; boundary="' + b + '"',
    "",
    "--" + b, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", b64lines(m.text),
    "--" + b, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", b64lines(m.html),
    "--" + b + "--", ""
  ].join("\r\n");
}

function smtpSend(c, to, data, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    let sock = null, buf = "", waiter = null, finished = false;
    const finish = err => { if (finished) return; finished = true; clearTimeout(timer); try { sock && sock.destroy(); } catch (e) {} err ? reject(err) : resolve(); };
    const timer = setTimeout(() => finish(new Error("smtp timeout")), opts.timeout || 10000);
    const pump = () => {
      if (!waiter) return;
      const lines = buf.split("\r\n");
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3}( |$)/.test(lines[i])) { const reply = lines.slice(0, i + 1); buf = lines.slice(i + 1).join("\r\n"); const w = waiter; waiter = null; w(reply); return; }
      }
    };
    const attach = s => { sock = s; s.setEncoding("utf8"); s.on("data", d => { buf += d; pump(); }); s.on("error", e => finish(new Error("smtp socket: " + e.message))); s.on("close", () => finish(new Error("smtp closed"))); };
    const cmd = (line, expect, label) => new Promise((res, rej) => {
      waiter = reply => { const code = +reply[reply.length - 1].slice(0, 3); expect.includes(code) ? res(reply) : rej(new Error("smtp " + (label || "cmd") + " -> " + reply[reply.length - 1].slice(0, 120))); };
      if (line != null) sock.write(line + "\r\n");
      pump();
    });
    const tlsOpts = { host: c.host, port: c.port, servername: c.host };
    if (opts.ca) tlsOpts.ca = opts.ca;
    (async () => {
      const name = "stuckup.ru";
      if (c.implicitTls) {
        await new Promise((res, rej) => { const s = tls.connect(tlsOpts, res); s.once("error", rej); attach(s); });
        await cmd(null, [220], "greeting");
        await cmd("EHLO " + name, [250], "ehlo");
      } else {
        const plain = await new Promise((res, rej) => { const s = net.connect(c.port, c.host, () => res(s)); s.once("error", rej); attach(s); });
        await cmd(null, [220], "greeting");
        await cmd("EHLO " + name, [250], "ehlo");
        await cmd("STARTTLS", [220], "starttls");
        plain.removeAllListeners("data"); plain.removeAllListeners("close");
        await new Promise((res, rej) => { const s = tls.connect(Object.assign({}, tlsOpts, { socket: plain, host: undefined, port: undefined }), res); s.once("error", rej); attach(s); });
        await cmd("EHLO " + name, [250], "ehlo");
      }
      await cmd("AUTH LOGIN", [334], "auth");
      await cmd(Buffer.from(c.user).toString("base64"), [334], "auth user");
      await cmd(Buffer.from(c.pass).toString("base64"), [235], "auth password");
      await cmd("MAIL FROM:<" + c.from + ">", [250], "mail from");
      await cmd("RCPT TO:<" + to + ">", [250, 251], "rcpt to");
      await cmd("DATA", [354], "data");
      await cmd(data.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..") + "\r\n.", [250], "body");
      try { sock.write("QUIT\r\n"); } catch (e) {}
      finish();
    })().catch(finish);
  });
}

const TPL = {
  ru: {
    reg: c => ({ subject: "Код подтверждения Stuckup: " + c, lead: "Код для регистрации на Stuckup:", tail: "Код действует 15 минут. Если вы не регистрировались на stuckup.ru, просто не отвечайте на это письмо." }),
    reset: c => ({ subject: "Сброс пароля Stuckup: " + c, lead: "Код для сброса пароля на Stuckup:", tail: "Код действует 15 минут. Если вы не запрашивали сброс пароля, ничего делать не нужно — пароль останется прежним." })
  },
  en: {
    reg: c => ({ subject: "Stuckup confirmation code: " + c, lead: "Your Stuckup sign-up code:", tail: "The code is valid for 15 minutes. If you did not sign up at stuckup.ru, just ignore this email." }),
    reset: c => ({ subject: "Stuckup password reset: " + c, lead: "Your Stuckup password reset code:", tail: "The code is valid for 15 minutes. If you did not ask for a reset, do nothing — your password stays the same." })
  }
};
function codeMessage(to, code, lang, kind) {
  const c = cfg(), t = (TPL[lang === "en" ? "en" : "ru"][kind === "reset" ? "reset" : "reg"])(code);
  const text = t.lead + "\n\n" + code + "\n\n" + t.tail + "\n\nStuckup · https://stuckup.ru\n";
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">' +
    '<div style="font-weight:700;font-size:18px;letter-spacing:.06em">STUCKUP</div>' +
    '<p style="font-size:15px;line-height:1.5;margin:20px 0 8px">' + t.lead + "</p>" +
    '<div style="font-size:34px;font-weight:700;letter-spacing:.2em;padding:14px 0">' + code + "</div>" +
    '<p style="font-size:13px;line-height:1.5;color:#555;margin:8px 0 0">' + t.tail + "</p>" +
    '<p style="font-size:12px;color:#888;margin:24px 0 0">Stuckup · <a href="https://stuckup.ru" style="color:#888">stuckup.ru</a></p></div>';
  return buildMessage({ from: c.from, fromName: "Stuckup", to, subject: t.subject, text, html });
}
const escH = x => String(x == null ? "" : x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Notification letter: a title, a few lines, one button and an unsubscribe link
function noticeMessage(o) {
  const c = cfg(), ru = o.lang !== "en";
  const foot = ru ? "Вы получили письмо, потому что зарегистрированы на stuckup.ru." : "You get this email because you have an account at stuckup.ru.";
  const unsub = ru ? "Отписаться от таких писем" : "Unsubscribe from these emails";
  const text = o.title + "\n\n" + o.lines.join("\n") + "\n\n" + o.button.text + ": " + o.button.url + "\n\n—\n" + foot + "\n" + unsub + ": " + o.unsub + "\n";
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">' +
    '<div style="font-weight:700;font-size:16px;letter-spacing:.08em">STUCK<span style="color:#d18f00">UP</span></div>' +
    '<h1 style="font-size:20px;line-height:1.3;margin:22px 0 10px">' + escH(o.title) + "</h1>" +
    o.lines.map(l => '<p style="font-size:15px;line-height:1.5;margin:0 0 8px;color:#333">' + escH(l) + "</p>").join("") +
    '<p style="margin:22px 0"><a href="' + escH(o.button.url) + '" style="display:inline-block;background:#ffb000;color:#1a1300;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">' + escH(o.button.text) + "</a></p>" +
    '<p style="font-size:12px;color:#888;line-height:1.5;margin:28px 0 0">' + escH(foot) + '<br><a href="' + escH(o.unsub) + '" style="color:#888">' + escH(unsub) + "</a></p></div>";
  return buildMessage({ from: c.from, fromName: "Stuckup", to: o.to, subject: o.subject, text, html, headers: ["List-Unsubscribe: <" + o.unsub + ">", "List-Unsubscribe-Post: List-Unsubscribe=One-Click"] });
}
async function sendNotice(o, opts) { await smtpSend(cfg(), o.to, noticeMessage(o), opts); }
async function sendCode(to, code, lang, kind, opts) { await smtpSend(cfg(), to, codeMessage(to, code, lang, kind), opts); }

module.exports = { mode, sendCode, sendNotice, noticeMessage, smtpSend, buildMessage, cfg };
