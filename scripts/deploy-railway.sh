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

# Each service has rootDirectory set to its app folder. Upload from the repo root
# so that folder exists in the archive. Uploading from inside the app folder makes
# the build fail with "lstat .../school-management-backend: no such file".

echo ""
echo "=== Push git branch (triggers Railway GitHub deploy if linked) ==="
cd "$ROOT"
git push -u origin HEAD || echo "WARN: git push failed — continuing with railway up"

echo ""
echo "=== Deploy backend (repo root; service root is /school-management-backend) ==="
cd "$ROOT"
[[ -f school-management-backend/Dockerfile ]] || { echo "ERROR: Dockerfile missing in backend dir"; exit 1; }
railway up --detach --service "$BACKEND_SERVICE" --ci || {
  echo "WARN: railway up --ci log stream failed; checking deployment status..."
  railway deployment list --service "$BACKEND_SERVICE" | head -3
}

echo ""
echo "=== Deploy frontend (repo root; service root is /school-management-unified) ==="
cd "$ROOT"
[[ -f school-management-unified/Dockerfile ]] || { echo "ERROR: Dockerfile missing in frontend dir"; exit 1; }
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
echo "Tip: run scripts/deploy-railway.sh from anywhere. It uploads the repo root so each service rootDirectory resolves."
