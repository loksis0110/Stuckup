"use strict";
// Storage layer. One table, three attributes: pk (partition), sk (sort), d (JSON string).
// Two adapters with the same interface: MemDb (local dev and tests) and DocDb
// (YDB serverless through its DynamoDB-compatible Document API over plain HTTPS).

class MemDb {
  constructor() { this.m = new Map(); }
  async get(pk, sk) { const v = this.m.get(pk + "\u0000" + sk); return v === undefined ? null : JSON.parse(v); }
  async put(pk, sk, d) { this.m.set(pk + "\u0000" + sk, JSON.stringify(d)); }
  async del(pk, sk) { this.m.delete(pk + "\u0000" + sk); }
  async list(pk) {
    const out = [], pre = pk + "\u0000";
    for (const [k, v] of this.m) if (k.startsWith(pre)) out.push({ sk: k.slice(pre.length), d: JSON.parse(v) });
    return out.sort((a, b) => (a.sk < b.sk ? -1 : a.sk > b.sk ? 1 : 0));
  }
  async ping() { return true; }
  async scan() { return [...this.m].map(([k, v]) => { const i = k.indexOf("\u0000"); return { pk: k.slice(0, i), sk: k.slice(i + 1), d: v }; }); }
}

class DocDb {
  constructor(endpoint, table) { this.endpoint = endpoint; this.table = table || "stuckup"; this.token = ""; this.ready = false; }
  setToken(t) { if (t) this.token = t; }
  async call(op, body) {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-amz-json-1.0", "X-Amz-Target": "DynamoDB_20120810." + op, Authorization: "Bearer " + this.token },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000)
    });
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch (e) {}
    if (!res.ok) {
      const err = new Error("docapi " + op + " " + res.status + " " + text.slice(0, 300));
      err.kind = String((j && (j.__type || j.code)) || "");
      err.status = res.status;
      throw err;
    }
    return j || {};
  }
  async ensureTable() {
    try {
      await this.call("CreateTable", {
        TableName: this.table,
        AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }, { AttributeName: "sk", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }, { AttributeName: "sk", KeyType: "RANGE" }]
      });
    } catch (e) { if (!/ResourceInUse|already exists/i.test(e.kind + " " + e.message)) throw e; }
    for (let i = 0; i < 20; i++) {
      try { const d = await this.call("DescribeTable", { TableName: this.table }); if (!d.Table || !d.Table.TableStatus || d.Table.TableStatus === "ACTIVE") return; } catch (e) {}
      await new Promise(r => setTimeout(r, 500));
    }
  }
  // Runs an operation; if the table does not exist yet, creates it once and retries.
  async run(op, body) {
    try { return await this.call(op, body); }
    catch (e) {
      if (this.ready || !/ResourceNotFound|not found|does not exist|SCHEME_ERROR/i.test(e.kind + " " + e.message)) throw e;
      await this.ensureTable(); this.ready = true;
      return await this.call(op, body);
    }
  }
  async get(pk, sk) {
    const r = await this.run("GetItem", { TableName: this.table, Key: { pk: { S: pk }, sk: { S: sk } }, ConsistentRead: true });
    this.ready = true;
    return r.Item && r.Item.d ? JSON.parse(r.Item.d.S) : null;
  }
  async put(pk, sk, d) { await this.run("PutItem", { TableName: this.table, Item: { pk: { S: pk }, sk: { S: sk }, d: { S: JSON.stringify(d) } } }); this.ready = true; }
  async del(pk, sk) { await this.run("DeleteItem", { TableName: this.table, Key: { pk: { S: pk }, sk: { S: sk } } }); }
  async list(pk) {
    const out = []; let start;
    for (let page = 0; page < 50; page++) {
      const body = { TableName: this.table, KeyConditionExpression: "pk = :p", ExpressionAttributeValues: { ":p": { S: pk } } };
      if (start) body.ExclusiveStartKey = start;
      const r = await this.run("Query", body);
      for (const it of r.Items || []) out.push({ sk: it.sk.S, d: JSON.parse(it.d.S) });
      start = r.LastEvaluatedKey;
      if (!start) break;
    }
    this.ready = true;
    return out.sort((a, b) => (a.sk < b.sk ? -1 : a.sk > b.sk ? 1 : 0));
  }
  async ping() { await this.get("sys", "ping"); return true; }
  // whole table, raw JSON strings (for backups)
  async scan() {
    const out = []; let start;
    for (let page = 0; page < 10000; page++) {
      const body = { TableName: this.table, Limit: 1000 }; if (start) body.ExclusiveStartKey = start;
      const r = await this.run("Scan", body);
      for (const it of r.Items || []) out.push({ pk: it.pk.S, sk: it.sk.S, d: it.d.S });
      start = r.LastEvaluatedKey; if (!start) break;
    }
    return out;
  }
}

module.exports = { MemDb, DocDb };
