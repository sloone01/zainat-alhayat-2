#!/bin/bash

# ARM-Compatible Docker Build Script for Railway Deployment
# This script builds x86 images on ARM Macs for Railway compatibility

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="zinat-school"
BACKEND_IMAGE="${PROJECT_NAME}-backend"
FRONTEND_IMAGE="${PROJECT_NAME}-frontend"
TAG=${1:-latest}
PLATFORM="linux/amd64"  # Force x86 platform for Railway

echo -e "${BLUE}🍎 Building ARM-compatible Docker images for Railway${NC}"
echo -e "${BLUE}📦 Platform: ${PLATFORM}${NC}"
echo -e "${BLUE}📦 Tag: ${TAG}${NC}"
echo ""

# Check if Docker buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker buildx not available, using regular docker build${NC}"
    USE_BUILDX=false
else
    echo -e "${GREEN}✅ Docker buildx available${NC}"
    USE_BUILDX=true
fi

# Function to build backend
build_backend() {
    echo -e "${YELLOW}🔨 Building backend image for ${PLATFORM}...${NC}"
    cd school-management-backend
    
    if [ "$USE_BUILDX" = true ]; then
        if docker buildx build --platform ${PLATFORM} -t ${BACKEND_IMAGE}:${TAG} . --load; then
            echo -e "${GREEN}✅ Backend image built successfully: ${BACKEND_IMAGE}:${TAG}${NC}"
        else
            echo -e "${RED}❌ Backend build failed${NC}"
            exit 1
        fi
    else
        if docker build -t ${BACKEND_IMAGE}:${TAG} .; then
            echo -e "${GREEN}✅ Backend image built successfully: ${BACKEND_IMAGE}:${TAG}${NC}"
        else
            echo -e "${RED}❌ Backend build failed${NC}"
            exit 1
        fi
    fi
    
    cd ..
}

# Function to build frontend
build_frontend() {
    echo -e "${YELLOW}🔨 Building frontend image for ${PLATFORM}...${NC}"
    cd school-management-unified
    
    if [ "$USE_BUILDX" = true ]; then
        if docker buildx build --platform ${PLATFORM} -t ${FRONTEND_IMAGE}:${TAG} . --load; then
            echo -e "${GREEN}✅ Frontend image built successfully: ${FRONTEND_IMAGE}:${TAG}${NC}"
        else
            echo -e "${RED}❌ Frontend build failed${NC}"
            exit 1
        fi
    else
        if docker build -t ${FRONTEND_IMAGE}:${TAG} .; then
            echo -e "${GREEN}✅ Frontend image built successfully: ${FRONTEND_IMAGE}:${TAG}${NC}"
        else
            echo -e "${RED}❌ Frontend build failed${NC}"
            exit 1
        fi
    fi
    
    cd ..
}

# Function to show image info
show_images() {
    echo -e "${BLUE}📊 Built images:${NC}"
    docker images | grep ${PROJECT_NAME} | head -2
    echo ""
    echo -e "${BLUE}🔍 Image architecture info:${NC}"
    docker inspect ${BACKEND_IMAGE}:${TAG} | grep -A 5 "Architecture" || echo "Architecture info not available"
}

# Main execution
echo -e "${YELLOW}Starting ARM-compatible build process...${NC}"

# Build backend
build_backend

echo ""

# Build frontend  
build_frontend

echo ""

# Show results
show_images

echo ""
echo -e "${GREEN}🎉 All images built successfully for Railway deployment!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   • Test locally: ${YELLOW}docker-compose -f docker-compose.prod.yml up${NC}"
echo -e "   • Deploy to Railway: Push to GitHub and deploy via Railway dashboard${NC}"
echo -e "   • Or push to Docker Hub: ${YELLOW}docker push ${BACKEND_IMAGE}:${TAG}${NC}"

echo ""
echo -e "${BLUE}🚀 Railway Deployment Tips:${NC}"
echo -e "${YELLOW}   • Railway will automatically detect and use these Dockerfiles${NC}"
echo -e "${YELLOW}   • The --platform=linux/amd64 ensures x86 compatibility${NC}"
echo -e "${YELLOW}   • Images are optimized for Railway's infrastructure${NC}"
