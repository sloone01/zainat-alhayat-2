#!/bin/bash

# Build and Push Docker Images to Docker Hub
# Run this script to build ARM-compatible images and push to Docker Hub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Build and Push to Docker Hub${NC}"
echo ""

# Get Docker Hub username
if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide your Docker Hub username:${NC}"
    read -p "Docker Hub Username: " DOCKER_USERNAME
else
    DOCKER_USERNAME=$1
fi

echo -e "${BLUE}📦 Using Docker Hub username: ${DOCKER_USERNAME}${NC}"
echo ""

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}🔐 Please login to Docker Hub:${NC}"
    docker login
fi

# Image names
BACKEND_IMAGE="${DOCKER_USERNAME}/zinat-backend:latest"
FRONTEND_IMAGE="${DOCKER_USERNAME}/zinat-frontend:latest"

echo -e "${YELLOW}🔨 Building and pushing images...${NC}"
echo ""

# Function to build and push backend
build_backend() {
    echo -e "${BLUE}📦 Building backend image: ${BACKEND_IMAGE}${NC}"
    
    # Try buildx first (for ARM compatibility)
    if docker buildx version > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Using Docker buildx for cross-platform build${NC}"
        if docker buildx build --platform linux/amd64 -t ${BACKEND_IMAGE} ./school-management-backend --push; then
            echo -e "${GREEN}✅ Backend image built and pushed successfully!${NC}"
        else
            echo -e "${RED}❌ Backend buildx failed, trying regular build...${NC}"
            docker build -t ${BACKEND_IMAGE} ./school-management-backend
            docker push ${BACKEND_IMAGE}
            echo -e "${GREEN}✅ Backend image built and pushed with regular build!${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker buildx not available, using regular build${NC}"
        docker build -t ${BACKEND_IMAGE} ./school-management-backend
        docker push ${BACKEND_IMAGE}
        echo -e "${GREEN}✅ Backend image built and pushed successfully!${NC}"
    fi
}

# Function to build and push frontend
build_frontend() {
    echo -e "${BLUE}🎨 Building frontend image: ${FRONTEND_IMAGE}${NC}"
    
    # Try buildx first (for ARM compatibility)
    if docker buildx version > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Using Docker buildx for cross-platform build${NC}"
        if docker buildx build --platform linux/amd64 -t ${FRONTEND_IMAGE} ./school-management-unified --push; then
            echo -e "${GREEN}✅ Frontend image built and pushed successfully!${NC}"
        else
            echo -e "${RED}❌ Frontend buildx failed, trying regular build...${NC}"
            docker build -t ${FRONTEND_IMAGE} ./school-management-unified
            docker push ${FRONTEND_IMAGE}
            echo -e "${GREEN}✅ Frontend image built and pushed with regular build!${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker buildx not available, using regular build${NC}"
        docker build -t ${FRONTEND_IMAGE} ./school-management-unified
        docker push ${FRONTEND_IMAGE}
        echo -e "${GREEN}✅ Frontend image built and pushed successfully!${NC}"
    fi
}

# Build and push both images
build_backend
echo ""
build_frontend

echo ""
echo -e "${GREEN}🎉 All images built and pushed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Your Docker Hub images:${NC}"
echo -e "${YELLOW}   Backend:  ${BACKEND_IMAGE}${NC}"
echo -e "${YELLOW}   Frontend: ${FRONTEND_IMAGE}${NC}"
echo ""
echo -e "${BLUE}🚀 Next steps for Railway deployment:${NC}"
echo -e "${YELLOW}   1. Go to railway.app${NC}"
echo -e "${YELLOW}   2. Create new project${NC}"
echo -e "${YELLOW}   3. Add PostgreSQL database${NC}"
echo -e "${YELLOW}   4. Deploy backend using: ${BACKEND_IMAGE}${NC}"
echo -e "${YELLOW}   5. Deploy frontend using: ${FRONTEND_IMAGE}${NC}"
echo -e "${YELLOW}   6. Set environment variables${NC}"
echo -e "${YELLOW}   7. Update CORS settings${NC}"
echo ""
echo -e "${GREEN}✨ Your school management system is ready for Railway! 🎓${NC}"
