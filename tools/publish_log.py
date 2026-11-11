"""Prepares the deploy log for the public deploy-logs branch: masks anything derived from secrets."""
import hashlib, json, os, pathlib, sys, datetime
src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
log = src.read_text(errors="replace") if src.exists() else "(no log produced)"
secrets = []
key = os.environ.get("YC_SA_KEY", "")
if key:
    for salt in ("session|", "smoke|"):
        secrets.append(hashlib.sha256((salt + key).encode()).hexdigest())
    try:
        k = json.loads(key)
        secrets += [l for l in str(k.get("private_key", "")).splitlines() if len(l) > 20]
    except Exception:
        pass
for name in ("TELEGRAM_BOT_TOKEN", "SMTP_PASS"):
    v = os.environ.get(name, "")
    if len(v) >= 6: secrets.append(v)
for s in secrets:
    log = log.replace(s, "***")
code = os.environ.get("CODE", "") or "?"
(out / "deploy.log").write_text(log)
(out / "status.json").write_text(json.dumps({"ok": code == "0", "exit": code, "sha": os.environ.get("GITHUB_SHA", "")[:7], "time": datetime.datetime.utcnow().isoformat() + "Z", "run": os.environ.get("GITHUB_RUN_ID", "")}))
