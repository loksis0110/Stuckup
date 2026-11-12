"use strict";
// Yandex Object Storage: writes with the function's IAM token (backups), presigned links for chat media.
// Without S3_BUCKET (local dev) files are kept in memory and served by /api/devstore.
const crypto = require("crypto");

const HOST = "storage.yandexcloud.net", REGION = "ru-central1";
const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const encKey = k => k.split("/").map(enc).join("/");
const hmac = (k, s) => crypto.createHmac("sha256", k).update(s).digest();
const sha = s => crypto.createHash("sha256").update(s).digest("hex");

// AWS Signature V4 query-string presigning (S3 compatible). `headers` are extra signed headers (lowercase names).
function presignUrl(o) {
  const t = (o.now || new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z"), day = t.slice(0, 8);
  const scope = day + "/" + o.region + "/s3/aws4_request";
  const hdrs = Object.assign({ host: o.host }, o.headers || {}), names = Object.keys(hdrs).sort();
  const q = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": o.keyId + "/" + scope, "X-Amz-Date": t, "X-Amz-Expires": String(o.expires), "X-Amz-SignedHeaders": names.join(";") };
  const query = Object.keys(q).sort().map(k => enc(k) + "=" + enc(q[k])).join("&");
  const canon = [o.method, o.path, query, names.map(n => n + ":" + String(hdrs[n]).trim()).join("\n") + "\n", names.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const sts = ["AWS4-HMAC-SHA256", t, scope, sha(canon)].join("\n");
  const key = hmac(hmac(hmac(hmac("AWS4" + o.secret, day), o.region), "s3"), "aws4_request");
  return "https://" + o.host + o.path + "?" + query + "&X-Amz-Signature=" + crypto.createHmac("sha256", key).update(sts).digest("hex");
}

const mem = new Map();
module.exports = function makeStorage(getToken) {
  const bucket = () => process.env.S3_BUCKET || "";
  const real = () => !!bucket();
  const media = () => real() ? !!(process.env.S3_KEY_ID && process.env.S3_SECRET) : !process.env.DOCAPI_ENDPOINT;
  const url = key => "https://" + HOST + "/" + bucket() + "/" + encKey(key);

  async function iam(method, key, body, headers) {
    const tok = getToken(); if (!tok) throw new Error("no IAM token");
    const r = await fetch(url(key) + (key.startsWith("?") ? "" : ""), { method, headers: Object.assign({ "X-YaCloud-SubjectToken": tok }, headers || {}), body, signal: AbortSignal.timeout(20000) });
    if (!r.ok && !(method === "DELETE" && r.status === 404)) throw new Error("storage " + method + " " + r.status + " " + (await r.text()).slice(0, 200));
    return r;
  }
  async function put(key, body, type) {
    if (!real()) { mem.set(key, { body: Buffer.from(body), type }); return; }
    await iam("PUT", key, body, { "Content-Type": type || "application/octet-stream" });
  }
  async function del(key) { if (!real()) { mem.delete(key); return; } await iam("DELETE", key); }
  async function setCors(origins) {
    const xml = `<CORSConfiguration><CORSRule>${origins.map(o => `<AllowedOrigin>${o}</AllowedOrigin>`).join("")}<AllowedMethod>GET</AllowedMethod><AllowedMethod>PUT</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>*</AllowedHeader><MaxAgeSeconds>3600</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
    const tok = getToken();
    const r = await fetch("https://" + HOST + "/" + bucket() + "?cors", { method: "PUT", headers: { "X-YaCloud-SubjectToken": tok, "Content-Type": "application/xml", "Content-MD5": crypto.createHash("md5").update(xml).digest("base64") }, body: xml, signal: AbortSignal.timeout(15000) });
    return r.status + " " + (await r.text()).slice(0, 160);
  }
  function sign(method, key, expires, headers) {
    if (!real()) return "/api/devstore/" + encKey(key) + "?m=" + method;
    return presignUrl({ method, host: HOST, path: "/" + bucket() + "/" + encKey(key), region: REGION, keyId: process.env.S3_KEY_ID, secret: process.env.S3_SECRET, expires, headers });
  }
  // uploads: the signed link fixes size and type, so the browser cannot upload something else
  const uploadUrl = (key, size, type) => sign("PUT", key, 900, { "content-length": String(size), "content-type": type });
  const viewUrl = key => sign("GET", key, 6 * 3600);
  // local dev only
  function devstore(method, key, bodyB64) {
    if (method === "PUT") { mem.set(key, { body: Buffer.from(bodyB64 || "", "base64"), type: "application/octet-stream" }); return { status: 200 }; }
    const f = mem.get(key); return f ? { status: 200, body: f.body } : { status: 404 };
  }
  return { real, media, put, del, setCors, uploadUrl, viewUrl, devstore, bucket };
};
module.exports.presignUrl = presignUrl;
