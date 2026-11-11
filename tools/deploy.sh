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
SITE_URL="https://stuckup.ru"
GW_JSON=$(yc serverless api-gateway get "$NAME" --format json 2>/dev/null || echo '{}')
if ! echo "$GW_JSON" | jq -e '.attached_domains[]? | select(.domain=="stuckup.ru")' >/dev/null 2>&1; then
  GW_DOMAIN=$(echo "$GW_JSON" | jq -r '.domain // empty'); [ -n "$GW_DOMAIN" ] && SITE_URL="https://$GW_DOMAIN"
fi
say "site url for links: $SITE_URL"
TG_HOOK_SECRET=$(printf 'tghook|%s' "$YC_SA_KEY" | sha256sum | cut -d' ' -f1)
BUILD="${GITHUB_SHA:-local}"; BUILD="${BUILD:0:7}"
ENVS=(--environment "DOCAPI_ENDPOINT=$DOCAPI" --environment "TABLE_NAME=$NAME" --environment "SESSION_SECRET=$SESSION_SECRET" --environment "SMOKE_KEY=$SMOKE_KEY" --environment "BUILD=$BUILD" --environment "TG_HOOK_SECRET=$TG_HOOK_SECRET" --environment "SITE_URL=$SITE_URL")
if [ -n "${SMTP_HOST:-}" ] && [ -n "${SMTP_USER:-}" ] && [ -n "${SMTP_PASS:-}" ]; then
  ENVS+=(--environment "SMTP_HOST=$SMTP_HOST" --environment "SMTP_PORT=${SMTP_PORT:-465}" --environment "SMTP_USER=$SMTP_USER" --environment "SMTP_PASS=$SMTP_PASS" --environment "MAIL_FROM=${MAIL_FROM:-$SMTP_USER}")
  say "mail: smtp via $SMTP_HOST"
else
  say "mail: not configured (codes are shown on screen)"
fi
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then ENVS+=(--environment "TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN"); fi
for V in ADMIN_PASSWORD VK_CLIENT_ID VK_CLIENT_SECRET FACEIT_API_KEY; do
  if [ -n "${!V:-}" ]; then ENVS+=(--environment "$V=${!V}"); say "secret $V: set"; else say "secret $V: not set"; fi
done
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

if [ -n "${SMTP_HOST:-}" ]; then say "mail test: $(curl -s --max-time 20 -X POST -H 'Content-Type: application/json' -H "x-smoke-key: $SMOKE_KEY" -d '{}' "https://$DOMAIN/api/health/mail")"; fi
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  say "telegram webhook state before: $(curl -s --max-time 20 "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq -c '.result | {pending_update_count, last_error_date, last_error_message, url: (.url | sub("https://";""))}' 2>/dev/null)"
  say "telegram webhook: $(curl -s --max-time 20 "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" --data-urlencode "url=https://$DOMAIN/api/tg/hook" --data-urlencode "secret_token=$TG_HOOK_SECRET" --data-urlencode 'allowed_updates=["message"]' | head -c 200)"
  say "telegram bot: $(curl -s --max-time 20 "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" | jq -r '.result.username // .description' 2>/dev/null)"
fi
say "7/7 smoke test"
SMOKE_KEY="$SMOKE_KEY" node dev/smoke.js "https://$DOMAIN"

say "8/8 custom domain (problems here do not fail the deploy)"
set +e
SITE_DOMAIN=stuckup.ru; ZONE=stuckup-ru; CERT=stuckup-ru
domain_setup() {
  yc dns zone get "$ZONE" >/dev/null 2>&1 || yc dns zone create --name "$ZONE" --zone "$SITE_DOMAIN." --public-visibility >/dev/null || { say "dns zone create failed"; return 1; }
  rec() { # name ttl type value : replace the record set
    local cur; cur=$(yc dns zone list-records --name "$ZONE" --format json | jq -r --arg n "$1" --arg t "$3" '.[] | select(.name==$n and .type==$t) | .data[]' 2>/dev/null)
    [ "$cur" = "$4" ] && return 0
    if [ -n "$cur" ]; then while read -r v; do yc dns zone delete-records --name "$ZONE" --record "$1 $2 $3 $v" >/dev/null; done <<< "$cur"; fi
    yc dns zone add-records --name "$ZONE" --record "$1 $2 $3 $4" >/dev/null && say "dns: $1 $3 -> $4"
  }
  rec "$SITE_DOMAIN." 300 ANAME "$DOMAIN."
  rec "www.$SITE_DOMAIN." 300 CNAME "$DOMAIN."
  yc certificate-manager certificate get --name "$CERT" >/dev/null 2>&1 || yc certificate-manager certificate request --name "$CERT" --domains "$SITE_DOMAIN,www.$SITE_DOMAIN" --challenge dns >/dev/null || { say "certificate request failed"; return 1; }
  yc certificate-manager certificate get --name "$CERT" --full --format json > "$WORK/cert.json"
  CERT_ID=$(jq -r .id "$WORK/cert.json"); CERT_ST=$(jq -r .status "$WORK/cert.json")
  say "certificate $CERT_ID: $CERT_ST"
  jq -r '.challenges[]? | select(.dns_challenge != null) | .dns_challenge | select(.type=="CNAME") | "\(.name) \(.value)"' "$WORK/cert.json" | while read -r n v; do
    [ -n "$n" ] && rec "${n%.}." 300 CNAME "${v%.}."
  done
  if [ "$CERT_ST" != "ISSUED" ]; then
    say "certificate is not issued yet: it will be once the domain's NS point to ns1.yandexcloud.net / ns2.yandexcloud.net; then re-run the deploy"
    say "current NS of $SITE_DOMAIN: $(dig +short NS "$SITE_DOMAIN" 2>/dev/null | tr '\n' ' ')"
    return 0
  fi
  local have; have=$(yc serverless api-gateway get "$NAME" --format json | jq -r '.attached_domains[]?.domain' 2>/dev/null)
  for d in "$SITE_DOMAIN" "www.$SITE_DOMAIN"; do
    if echo "$have" | grep -qx "$d"; then say "domain attached: $d"; else
      yc serverless api-gateway add-domain --name "$NAME" --domain "$d" --certificate-id "$CERT_ID" >/dev/null && say "domain attached now: $d" || { say "add-domain failed for $d"; yc serverless api-gateway add-domain --help 2>&1 | head -30; }
    fi
  done
  say "check: $(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$SITE_DOMAIN/api/health")"
}
domain_setup 2>&1 | grep -v 'PRIVATE KEY'
set -e
say "DEPLOY OK https://$DOMAIN"
