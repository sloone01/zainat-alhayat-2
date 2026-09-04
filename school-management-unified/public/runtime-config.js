// Overwritten at container start on Railway (see docker-entrypoint.sh).
// Empty API_BASE_URL → app uses Vite build-time VITE_API_BASE_URL or dev fallback.
window.__APP_CONFIG__ = window.__APP_CONFIG__ || { API_BASE_URL: '' }
