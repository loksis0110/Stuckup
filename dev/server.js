"use strict";
// Local dev server: wraps the cloud function handler in a plain HTTP server (in-memory database).
const http = require("http");
const { handler } = require("../server/index.js");
const port = +(process.env.PORT || 8787);
http.createServer((req, res) => {
  const chunks = [];
  req.on("data", c => chunks.push(c));
  req.on("end", async () => {
    const u = new URL(req.url, "http://x");
    const event = { httpMethod: req.method, path: u.pathname, headers: req.headers, queryStringParameters: Object.fromEntries(u.searchParams), body: Buffer.concat(chunks).toString("base64"), isBase64Encoded: true,
      requestContext: { identity: { sourceIp: req.socket.remoteAddress } } };
    if (!chunks.length) { delete event.body; event.isBase64Encoded = false; }
    try {
      const r = await handler(event, {});
      const h = Object.assign({}, r.headers);
      if (r.multiValueHeaders && r.multiValueHeaders["Set-Cookie"]) h["Set-Cookie"] = r.multiValueHeaders["Set-Cookie"];
      res.writeHead(r.statusCode, h);
      res.end(r.isBase64Encoded ? Buffer.from(r.body, "base64") : r.body);
    } catch (e) { console.error(e); res.writeHead(500); res.end("error"); }
  });
}).listen(port, () => console.log("Stuckup dev server: http://localhost:" + port));
