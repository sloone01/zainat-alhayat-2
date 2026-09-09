#!/bin/zsh
set -euo pipefail
export PATH="/Users/salim/.nvm/versions/node/v20.19.5/bin:$PATH"
LOG=/tmp/fikr-railway-deploy.log
exec > >(tee "$LOG") 2>&1

echo "=== $(date) FIKR Railway deploy ==="
railway whoami
ROOT="/Users/salim/Downloads/zinat-al-haya-kindergarten"

echo ""
echo "=== Backend service link/status ==="
cd "$ROOT/school-management-backend"
railway status || true

echo ""
echo "=== Ensure production env vars (idempotent) ==="
# PUBLIC_APP_URL should be the frontend public URL for email logos.
# CORS must include frontend + https://localhost for Capacitor.
# These set commands update if already present on Railway.
BACKEND_SERVICE="b9a70469-4f7f-40b6-9770-860fe9964ab3"
FRONTEND_SERVICE="a151751e-c20d-4519-a3cc-436983287829"
PROJECT="e42fc462-f63c-426b-bb8f-305c577a9778"
ENV="d4690a6b-d71e-412d-8106-95a3efb52ae5"

# Discover public domains
echo "Listing domains..."
railway domain --service "$BACKEND_SERVICE" 2>&1 || true
railway domain --service "$FRONTEND_SERVICE" 2>&1 || true

echo ""
echo "=== Deploy backend (Dockerfile) ==="
cd "$ROOT/school-management-backend"
railway up --detach --service "$BACKEND_SERVICE" --environment production 2>&1

echo ""
echo "=== Deploy frontend (Dockerfile) ==="
cd "$ROOT/school-management-unified"
railway up --detach --service "$FRONTEND_SERVICE" --environment production 2>&1

echo ""
echo "=== Wait for backend health ==="
# Try known API host from handoff + any new domain
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if curl -fsS "https://divine-clarity-production-d359.up.railway.app/api/health/simple" | tee /tmp/fikr-health.json; then
    echo ""
    echo "Health OK"
    break
  fi
  echo "waiting... $i"
  sleep 15
done

echo ""
echo "=== Trigger remote migrations via railway run ==="
cd "$ROOT/school-management-backend"
railway run --service "$BACKEND_SERVICE" --environment production -- npm run migrate:deploy 2>&1 || \
  railway run --service "$BACKEND_SERVICE" --environment production -- node dist/migration-runner.js 2>&1 || \
  echo "WARN: could not run migrations via railway run; check release command"

echo ""
echo "=== Smoke OTP endpoint ==="
curl -sS -X POST "https://divine-clarity-production-d359.up.railway.app/api/public/school-subscription/email-otp/send" \
  -H 'Content-Type: application/json' \
  -d '{"email":"railway-smoke@example.com"}' | head -c 500
echo ""

echo "=== DONE ===" 
echo "Log: $LOG"
