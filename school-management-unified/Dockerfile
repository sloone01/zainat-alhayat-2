# Multi-stage build for Vue.js Frontend
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Zinat Al-Haya School Management"
ARG VITE_APP_VERSION="1.0.0"
ARG VITE_NODE_ENV="production"
ARG VITE_DEFAULT_LOCALE="ar"

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_DEFAULT_LOCALE=$VITE_DEFAULT_LOCALE

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx template that uses PORT environment variable
RUN echo 'server {' > /etc/nginx/conf.d/default.conf.template && \
    echo '    listen ${PORT:-80};' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location /api {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        return 404;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    gzip on;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '}' >> /etc/nginx/conf.d/default.conf.template

# Create startup script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export PORT=${PORT:-80}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port (Railway will set PORT environment variable)
EXPOSE ${PORT:-80}

# Health check using PORT environment variable
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-80}/ || exit 1

# Start with custom script that handles PORT variable
ENTRYPOINT ["dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
