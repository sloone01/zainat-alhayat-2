# ARM-compatible Railway Dockerfile for NestJS Backend
FROM --platform=linux/amd64 node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for ARM compatibility
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Create uploads directory
RUN mkdir -p uploads

# Clean up build dependencies to reduce image size
RUN apk del python3 make g++

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
