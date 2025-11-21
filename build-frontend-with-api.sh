#!/bin/bash

# Build Frontend with Custom API URL
# Usage: ./build-frontend-with-api.sh YOUR_BACKEND_URL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Building Frontend with Custom API URL${NC}"
echo ""

# Get backend URL from user
if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide your Railway backend URL:${NC}"
    echo -e "${YELLOW}Example: https://backend-production-1234.railway.app${NC}"
    read -p "Backend URL: " BACKEND_URL
else
    BACKEND_URL=$1
fi

# Add /api if not present
if [[ ! "$BACKEND_URL" == */api ]]; then
    API_URL="${BACKEND_URL}/api"
else
    API_URL="$BACKEND_URL"
fi

echo -e "${BLUE}📡 Using API URL: ${API_URL}${NC}"
echo ""

# Docker Hub username
DOCKER_USERNAME="sloone01"
IMAGE_NAME="${DOCKER_USERNAME}/zinat-frontend:latest"

echo -e "${YELLOW}🔨 Building frontend image with API URL...${NC}"

# Build with API URL as build argument
echo -e "${BLUE}🔧 Build arguments:${NC}"
echo -e "${YELLOW}   VITE_API_BASE_URL=${API_URL}${NC}"
echo -e "${YELLOW}   VITE_NODE_ENV=production${NC}"
echo ""

if docker buildx build --platform linux/amd64 \
    --build-arg VITE_API_BASE_URL="$API_URL" \
    --build-arg VITE_APP_NAME="Zinat Al-Haya School Management" \
    --build-arg VITE_APP_VERSION="1.0.0" \
    --build-arg VITE_NODE_ENV="production" \
    --build-arg VITE_DEFAULT_LOCALE="ar" \
    -t "$IMAGE_NAME" \
    ./school-management-unified --push; then
    
    echo -e "${GREEN}✅ Frontend image built and pushed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Image Details:${NC}"
    echo -e "${YELLOW}   Image: ${IMAGE_NAME}${NC}"
    echo -e "${YELLOW}   API URL: ${API_URL}${NC}"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "${YELLOW}   1. Go to Railway frontend service${NC}"
    echo -e "${YELLOW}   2. Click 'Deploy' or 'Redeploy'${NC}"
    echo -e "${YELLOW}   3. Railway will pull the updated image${NC}"
    echo -e "${YELLOW}   4. Test your frontend URL${NC}"
    
else
    echo -e "${RED}❌ Build failed, trying regular docker build...${NC}"
    
    # Fallback to regular build
    docker build \
        --build-arg VITE_API_BASE_URL="$API_URL" \
        --build-arg VITE_APP_NAME="Zinat Al-Haya School Management" \
        --build-arg VITE_APP_VERSION="1.0.0" \
        --build-arg VITE_NODE_ENV="production" \
        --build-arg VITE_DEFAULT_LOCALE="ar" \
        -t "$IMAGE_NAME" \
        ./school-management-unified
    
    docker push "$IMAGE_NAME"
    
    echo -e "${GREEN}✅ Frontend image built and pushed with regular build!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Frontend ready for Railway deployment!${NC}"
