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
FROM --platform=linux/amd64 nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# At container start: write runtime-config.js from VITE_API_BASE_URL (Railway) then nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
