#!/bin/zsh
set -euo pipefail
export PATH="/Users/salim/.nvm/versions/node/v20.19.5/bin:$PATH"
LOG=/tmp/fikr-railway-deploy.log
exec > >(tee "$LOG") 2>&1

echo "=== $(date) FIKR Railway deploy ==="
railway whoami

ROOT="/Users/salim/Downloads/zinat-al-haya-kindergarten"
BACKEND_SERVICE="b9a70469-4f7f-40b6-9770-860fe9964ab3"
FRONTEND_SERVICE="a151751e-c20d-4519-a3cc-436983287829"
API_HOST_DEFAULT="https://divine-clarity-production-d359.up.railway.app"

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
echo "=== Set recommended backend env (edit URLs if your frontend domain differs) ==="
cd "$ROOT/school-management-backend"
railway variables --service "$BACKEND_SERVICE" --set "NODE_ENV=production" 2>/dev/null || true
FE_DOMAIN=$(railway domain --service "$FRONTEND_SERVICE" 2>/dev/null | head -1 | tr -d '[:space:]' || true)
if [[ -n "${FE_DOMAIN:-}" && "$FE_DOMAIN" != *"error"* ]]; then
  if [[ "$FE_DOMAIN" != https://* ]]; then FE_URL="https://$FE_DOMAIN"; else FE_URL="$FE_DOMAIN"; fi
  echo "Frontend domain: $FE_URL"
  railway variables --service "$BACKEND_SERVICE" --set "PUBLIC_APP_URL=$FE_URL" || true
  railway variables --service "$BACKEND_SERVICE" --set "CORS_ORIGIN=${FE_URL},https://localhost,http://localhost:5173" || true
  railway variables --service "$FRONTEND_SERVICE" --set "VITE_API_BASE_URL=${API_HOST_DEFAULT}/api" || true
else
  echo "Could not auto-detect frontend domain. Set PUBLIC_APP_URL manually in Railway UI."
fi

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
