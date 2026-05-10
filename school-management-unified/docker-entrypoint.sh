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
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

exec nginx -g "daemon off;"
