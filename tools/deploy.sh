#!/usr/bin/env bash
# Deploys Stuckup to Yandex Cloud: serverless YDB + one Cloud Function + API Gateway.
# Runs in GitHub Actions. Needs YC_SA_KEY (authorized key JSON of the deploy service account) and YC_FOLDER_ID.
# Never prints secret values: this log is published to the deploy-logs branch.
set -euo pipefail
say() { echo "[$(date -u +%H:%M:%S)] $*"; }
NAME=stuckup
WORK="${RUNNER_TEMP:-/tmp}/stuckup-deploy"; mkdir -p "$WORK"

say "1/7 install yc"
if ! command -v yc >/dev/null 2>&1; then
  curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash -s -- -i "$HOME/yc" -n >/dev/null 2>&1
  export PATH="$HOME/yc/bin:$PATH"
fi
yc version

say "2/7 authorize"
if [ -z "${YC_SA_KEY:-}" ]; then say "ERROR: secret YC_SA_KEY is empty"; exit 10; fi
printf '%s' "$YC_SA_KEY" > "$WORK/key.json"
python3 - "$WORK/key.json" <<'PY'
import json, sys
try:
    k = json.load(open(sys.argv[1]))
except Exception as e:
    print("ERROR: YC_SA_KEY is not valid JSON:", type(e).__name__); sys.exit(11)
print("key fields:", ", ".join(sorted(k.keys())))
need = {"id", "service_account_id", "private_key"}
if not need <= set(k):
    print("ERROR: YC_SA_KEY must be an *authorized key* JSON (fields id, service_account_id, private_key)"); sys.exit(12)
PY
SA_ID=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["service_account_id"])' "$WORK/key.json")
yc config profile create deploy >/dev/null 2>&1 || yc config profile activate deploy >/dev/null
yc config set service-account-key "$WORK/key.json"
yc config set folder-id "$YC_FOLDER_ID"
say "service account: $SA_ID, folder: $YC_FOLDER_ID"

say "3/7 database"
if ! yc ydb database get "$NAME" >/dev/null 2>&1; then
  say "creating serverless YDB database (takes a minute)"
  yc ydb database create "$NAME" --serverless >/dev/null
fi
for i in $(seq 1 40); do
  ST=$(yc ydb database get "$NAME" --format json | jq -r .status)
  [ "$ST" = "RUNNING" ] && break
  say "database status: $ST"; sleep 10
done
DOCAPI=$(yc ydb database get "$NAME" --format json | jq -r '.document_api_endpoint // empty')
if [ -z "$DOCAPI" ]; then say "ERROR: database has no document_api_endpoint"; yc ydb database get "$NAME" --format json | jq 'del(.endpoint)'; exit 13; fi
say "document api: $DOCAPI"

say "4/7 function"
yc serverless function get "$NAME" >/dev/null 2>&1 || yc serverless function create --name "$NAME" >/dev/null
FN_ID=$(yc serverless function get "$NAME" --format json | jq -r .id)
(cd server && zip -qr "$WORK/build.zip" .)
say "function: $FN_ID, package: $(du -k "$WORK/build.zip" | cut -f1) KB"
SESSION_SECRET=$(printf 'session|%s' "$YC_SA_KEY" | sha256sum | cut -d' ' -f1)
SMOKE_KEY=$(printf 'smoke|%s' "$YC_SA_KEY" | sha256sum | cut -d' ' -f1)
BUILD="${GITHUB_SHA:-local}"; BUILD="${BUILD:0:7}"
ENVS=(--environment "DOCAPI_ENDPOINT=$DOCAPI" --environment "TABLE_NAME=$NAME" --environment "SESSION_SECRET=$SESSION_SECRET" --environment "SMOKE_KEY=$SMOKE_KEY" --environment "BUILD=$BUILD")
if [ -n "${SMTP_HOST:-}" ] && [ -n "${SMTP_USER:-}" ] && [ -n "${SMTP_PASS:-}" ]; then
  ENVS+=(--environment "SMTP_HOST=$SMTP_HOST" --environment "SMTP_PORT=${SMTP_PORT:-465}" --environment "SMTP_USER=$SMTP_USER" --environment "SMTP_PASS=$SMTP_PASS" --environment "MAIL_FROM=${MAIL_FROM:-$SMTP_USER}")
  say "mail: smtp via $SMTP_HOST"
else
  say "mail: not configured (codes are shown on screen)"
fi
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then ENVS+=(--environment "TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN"); fi
yc serverless function version create --function-name "$NAME" --runtime nodejs22 --entrypoint index.handler --memory 256m --execution-timeout 15s \
  --source-path "$WORK/build.zip" --service-account-id "$SA_ID" "${ENVS[@]}" >/dev/null
say "function version created (build $BUILD)"

say "5/7 api gateway"
cat > "$WORK/spec.yaml" <<YAML
openapi: 3.0.0
info:
  title: stuckup
  version: 1.0.0
paths:
  /:
    x-yc-apigateway-any-method:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: $FN_ID
        service_account_id: $SA_ID
        payload_format_version: "1.0"
  /{proxy+}:
    x-yc-apigateway-any-method:
      parameters:
        - name: proxy
          in: path
          required: true
          schema:
            type: string
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: $FN_ID
        service_account_id: $SA_ID
        payload_format_version: "1.0"
YAML
if yc serverless api-gateway get "$NAME" >/dev/null 2>&1; then
  yc serverless api-gateway update --name "$NAME" --spec "$WORK/spec.yaml" >/dev/null
else
  yc serverless api-gateway create --name "$NAME" --spec "$WORK/spec.yaml" >/dev/null
fi
DOMAIN=$(yc serverless api-gateway get "$NAME" --format json | jq -r .domain)
say "gateway: https://$DOMAIN"
echo "$DOMAIN" > "$WORK/domain.txt"

say "6/7 wait for the site"
OK=0
for i in $(seq 1 20); do
  CODE=$(curl -s -o "$WORK/health.json" -w '%{http_code}' "https://$DOMAIN/api/health" || true)
  if [ "$CODE" = "200" ] && grep -q "\"build\":\"$BUILD\"" "$WORK/health.json"; then OK=1; break; fi
  say "health: HTTP $CODE $(head -c 300 "$WORK/health.json" 2>/dev/null || true)"; sleep 6
done
if [ "$OK" != "1" ]; then say "ERROR: site did not come up"; exit 14; fi
say "health: $(cat "$WORK/health.json")"

say "7/7 smoke test"
SMOKE_KEY="$SMOKE_KEY" node dev/smoke.js "https://$DOMAIN"
say "DEPLOY OK https://$DOMAIN"
