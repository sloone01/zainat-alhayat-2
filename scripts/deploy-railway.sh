#!/bin/zsh
set -euo pipefail
export PATH="/Users/salim/.nvm/versions/node/v20.19.5/bin:$PATH"
LOG=/tmp/fikr-railway-deploy.log
exec > >(tee "$LOG") 2>&1

echo "=== $(date) FIKR Railway deploy ==="
railway whoami

ROOT="/Users/salim/Downloads/zinat-al-haya-kindergarten"
# Service names (not stale UUIDs). `railway domain -s <old uuid>` returns "Service not found".
BACKEND_SERVICE="divine-clarity"
FRONTEND_SERVICE="zinat-frontend"
API_HOST_DEFAULT="https://divine-clarity-production-d359.up.railway.app"
# Custom domain must stay on the API. Replacing these with the *.up.railway.app
# frontend domain is what made https://www.fikr.om/subscribe fail after every deploy.
PUBLIC_SITE="https://www.fikr.om"
CORS_ORIGIN_VALUE="${PUBLIC_SITE},https://fikr.om,https://zinat-frontend-production.up.railway.app,https://localhost,http://localhost,capacitor://localhost,ionic://localhost"

# IMPORTANT: never `railway up` from the monorepo root — Railpack sees the whole tree
# (backend + frontend + docs) and fails with "could not determine how to build the app".
# Always upload from school-management-backend/ or school-management-unified/.

echo ""
echo "=== Push git branch (triggers Railway GitHub deploy if linked) ==="
cd "$ROOT"
git push -u origin HEAD || echo "WARN: git push failed — continuing with railway up"

echo ""
echo "=== Deploy backend (from school-management-backend/) ==="
cd "$ROOT/school-management-backend"
[[ -f Dockerfile ]] || { echo "ERROR: Dockerfile missing in backend dir"; exit 1; }
railway up --detach --service "$BACKEND_SERVICE" --ci || {
  echo "WARN: railway up --ci log stream failed; checking deployment status..."
  railway deployment list --service "$BACKEND_SERVICE" | head -3
}

echo ""
echo "=== Deploy frontend (from school-management-unified/) ==="
cd "$ROOT/school-management-unified"
[[ -f Dockerfile ]] || { echo "ERROR: Dockerfile missing in frontend dir"; exit 1; }
railway up --detach --service "$FRONTEND_SERVICE" --ci || {
  echo "WARN: railway up --ci log stream failed; checking deployment status..."
  railway deployment list --service "$FRONTEND_SERVICE" | head -3
}

echo ""
echo "=== Pin public site CORS (do not overwrite with the Railway frontend domain) ==="
cd "$ROOT/school-management-backend"
railway variables --service "$BACKEND_SERVICE" --skip-deploys \
  --set "NODE_ENV=production" \
  --set "PUBLIC_APP_URL=$PUBLIC_SITE" \
  --set "CORS_ORIGIN=$CORS_ORIGIN_VALUE" || true
railway variables --service "$FRONTEND_SERVICE" --skip-deploys \
  --set "VITE_API_BASE_URL=${API_HOST_DEFAULT}/api" || true

echo ""
echo "=== Wait for backend health ==="
for i in {1..30}; do
  if curl -fsS "$API_HOST_DEFAULT/api/health/simple"; then
    echo ""
    echo "Health OK"
    break
  fi
  echo "waiting... $i"
  sleep 10
done

echo ""
echo "=== Smoke OTP ==="
curl -sS -X POST "$API_HOST_DEFAULT/api/public/school-subscription/email-otp/send" \
  -H 'Content-Type: application/json' \
  -d '{"email":"railway-smoke@example.com"}' || true
echo ""

echo "=== DONE — log: $LOG ==="
echo "Tip: do NOT run \`railway up\` from the repo root. Use scripts/deploy-railway.sh or cd into backend/frontend first."
