# ARM-compatible Railway Dockerfile for Vue.js Frontend
FROM --platform=linux/amd64 node:20-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies for ARM compatibility
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies with ARM compatibility
RUN npm ci --platform=linux/amd64

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM --platform=linux/amd64 nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a simple startup script that generates nginx config
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'PORT=${PORT:-80}' >> /start.sh && \
    echo 'echo "Starting nginx on port $PORT"' >> /start.sh && \
    echo 'cat > /etc/nginx/conf.d/default.conf << EOF' >> /start.sh && \
    echo 'server {' >> /start.sh && \
    echo '    listen $PORT;' >> /start.sh && \
    echo '    server_name localhost;' >> /start.sh && \
    echo '    root /usr/share/nginx/html;' >> /start.sh && \
    echo '    index index.html;' >> /start.sh && \
    echo '    location / {' >> /start.sh && \
    echo '        try_files \$uri \$uri/ /index.html;' >> /start.sh && \
    echo '    }' >> /start.sh && \
    echo '}' >> /start.sh && \
    echo 'EOF' >> /start.sh && \
    echo 'echo "Generated nginx config:"' >> /start.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 80

# Start with our script
CMD ["/start.sh"]
