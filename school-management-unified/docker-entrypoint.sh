#!/bin/sh
set -e

PORT="${PORT:-80}"
CONF=/etc/nginx/conf.d/default.conf
MAP_CONF=/etc/nginx/conf.d/00-forwarded-proto.conf

# Railway / Docker: set VITE_API_BASE_URL (or API_BASE_URL) on the frontend service.
# Must include /api suffix, e.g. https://your-backend.up.railway.app/api
API_URL="${VITE_API_BASE_URL:-${API_BASE_URL:-}}"

# Normalize so a bare hostname (e.g. Railway RAILWAY_PUBLIC_DOMAIN) still produces a valid absolute URL.
if [ -n "$API_URL" ]; then
  # Trim surrounding whitespace and a trailing slash.
  API_URL=$(printf '%s' "$API_URL" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//; s:/$::')

  # Prepend https:// if no scheme is present.
  case "$API_URL" in
    http://*|https://*) ;;
    *) API_URL="https://$API_URL" ;;
  esac

  # Append /api if the URL doesn't already end with /api.
  case "$API_URL" in
    */api|*/api/) ;;
    *) API_URL="$API_URL/api" ;;
  esac
fi

# ---------------------------------------------------------------------------
# Same-origin /api proxy (FIKR-260920-99FABE)
#
# Serving the SPA from www.fikr.om while it calls the backend on a different
# Railway origin makes every API call cross-origin: the browser must send a CORS
# preflight first, and a dropped preflight surfaces in axios as a bare
# "Network Error" that never reaches Nest (so nothing is logged server-side).
# Proxying /api and /socket.io through this nginx makes every call same-origin,
# so no preflight is issued at all — same shape as the Vite dev proxy.
#
# Enabled automatically whenever the API URL resolves to <origin>/api.
# Set API_PROXY_ENABLED=false to fall back to direct cross-origin calls.
# ---------------------------------------------------------------------------
API_ORIGIN=""
API_HOST=""
case "${API_PROXY_ENABLED:-true}" in
  false|FALSE|0|off|no) PROXY_DISABLED=1 ;;
  *) PROXY_DISABLED=0 ;;
esac

if [ -n "$API_URL" ] && [ "$PROXY_DISABLED" = "0" ]; then
  # Split scheme://host[:port] from the path, and only proxy when the backend
  # really is mounted at <origin>/api (anything else would need path rewriting).
  API_SCHEME=$(printf '%s' "$API_URL" | sed -n 's#^\(https\?\)://.*#\1#p')
  API_HOST=$(printf '%s' "$API_URL" | sed -n 's#^https\?://\([^/]*\).*#\1#p')
  API_PATH=$(printf '%s' "$API_URL" | sed -n 's#^https\?://[^/]*\(.*\)$#\1#p')
  if [ -n "$API_SCHEME" ] && [ -n "$API_HOST" ] && [ "$API_PATH" = "/api" ]; then
    API_ORIGIN="$API_SCHEME://$API_HOST"
  else
    echo "[entrypoint] API URL '$API_URL' is not <origin>/api — serving without the /api proxy." >&2
    API_HOST=""
  fi
fi

# Browser-facing API base: relative when proxied (same-origin), absolute otherwise.
write_runtime_config() {
  base="$1"
  esc=$(printf '%s' "$base" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '%s\n' "window.__APP_CONFIG__ = { API_BASE_URL: \"$esc\" };" \
    > /usr/share/nginx/html/runtime-config.js
}

# Keep the scheme the browser actually used when this container sits behind
# Railway's TLS edge (map is http-level; conf.d is included inside http).
cat > "$MAP_CONF" <<'MAPEOF'
map $http_x_forwarded_proto $fwd_proto {
    default $http_x_forwarded_proto;
    ""      $scheme;
}
MAPEOF

# write_conf <api_origin> <api_host> — empty origin means "no backend proxy".
write_conf() {
  origin="$1"
  host="$2"

  cat > "$CONF" <<EOF
server {
    listen ${PORT};
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Hashed Vite build output — safe to cache forever
    location ^~ /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }

    # Runtime API base — must never be stale across deploys
    location = /runtime-config.js {
        add_header Cache-Control "no-store";
        try_files \$uri =404;
    }

    # SPA shell — always revalidate so users pick up new asset hashes
    location = /index.html {
        add_header Cache-Control "no-cache";
        try_files \$uri =404;
    }
EOF

  if [ -n "$origin" ]; then
    # Railway private domains (*.railway.internal) are IPv6-only; public edge
    # hostnames resolve over IPv4.
    case "$host" in
      *.railway.internal|*.railway.internal:*) resolver_ipv6="ipv6=on" ;;
      *) resolver_ipv6="ipv6=off" ;;
    esac

    # nginx ignores /etc/resolv.conf, but a variable in proxy_pass needs a resolver
    # (and that keeps nginx booting even while the backend host is unresolvable).
    resolvers=$(sed -n 's/^nameserver[[:space:]]\{1,\}\([^[:space:]]*\).*/\1/p' /etc/resolv.conf \
      | head -3 | sed 's/.*:.*/[&]/' | tr '\n' ' ')
    case "$resolvers" in
      ''|' ') resolvers="1.1.1.1 8.8.8.8 " ;;
    esac

    echo "[entrypoint] proxying /api and /socket.io to $origin (resolver: $resolvers$resolver_ipv6)"

    cat >> "$CONF" <<EOF

    # ---- Same-origin backend proxy: no CORS preflight for SPA calls ----
    resolver ${resolvers}valid=10s ${resolver_ipv6};
    set \$api_origin "${origin}";

    # Registration documents and receipts are multipart uploads; session media is
    # capped at 50MB per file server-side, so leave headroom above that.
    client_max_body_size 64m;

    location ^~ /api/ {
        proxy_pass \$api_origin\$request_uri;
        proxy_http_version 1.1;
        # Railway's edge routes by Host, so send the backend's hostname, not ours.
        proxy_set_header Host ${host};
        proxy_ssl_server_name on;
        proxy_set_header Connection "";
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$fwd_proto;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_redirect off;
    }

    location ^~ /socket.io/ {
        proxy_pass \$api_origin\$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Host ${host};
        proxy_ssl_server_name on;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$fwd_proto;
        proxy_connect_timeout 30s;
        proxy_send_timeout 3600s;
        proxy_read_timeout 3600s;
        proxy_buffering off;
        proxy_redirect off;
    }
EOF
  fi

  cat >> "$CONF" <<'EOF'

    # Public static files (logos, landing shots, favicons)
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|svg|ico|avif)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
}

if [ -n "$API_ORIGIN" ]; then
  write_runtime_config "/api"
else
  write_runtime_config "$API_URL"
fi
write_conf "$API_ORIGIN" "$API_HOST"

# Never let a proxy misconfiguration take the SPA down: fall back to serving the
# app with direct cross-origin API calls instead of refusing to boot.
if ! nginx -t; then
  if [ -n "$API_ORIGIN" ]; then
    echo "[entrypoint] nginx rejected the /api proxy config — falling back to direct API calls." >&2
    write_runtime_config "$API_URL"
    write_conf "" ""
    nginx -t
  else
    exit 1
  fi
fi

exec nginx -g "daemon off;"
