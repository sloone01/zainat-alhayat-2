#!/bin/sh
set -e

PORT="${PORT:-80}"

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

  esc=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '%s\n' "window.__APP_CONFIG__ = { API_BASE_URL: \"$esc\" };" > /usr/share/nginx/html/runtime-config.js
else
  printf '%s\n' 'window.__APP_CONFIG__ = { API_BASE_URL: "" };' > /usr/share/nginx/html/runtime-config.js
fi

cat > /etc/nginx/conf.d/default.conf <<EOF
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

    # Public static files (logos, landing shots, favicons)
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|svg|ico|avif)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

exec nginx -g "daemon off;"
