#!/bin/bash

# Docker Build Script for Zinat Al-Haya School Management System
# This script builds Docker images for both backend and frontend services

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

echo -e "${BLUE}🐳 Building Docker images for Zinat Al-Haya School Management System${NC}"
echo -e "${BLUE}📦 Tag: ${TAG}${NC}"
echo ""

# Function to build backend
build_backend() {
    echo -e "${YELLOW}🔨 Building backend image...${NC}"
    cd school-management-backend
    
    if docker build -t ${BACKEND_IMAGE}:${TAG} .; then
        echo -e "${GREEN}✅ Backend image built successfully: ${BACKEND_IMAGE}:${TAG}${NC}"
    else
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    fi
    
    cd ..
}

# Function to build frontend
build_frontend() {
    echo -e "${YELLOW}🔨 Building frontend image...${NC}"
    cd school-management-unified
    
    # Build with default API URL (can be overridden at runtime)
    if docker build \
        --build-arg VITE_API_BASE_URL=http://localhost:3002/api \
        -t ${FRONTEND_IMAGE}:${TAG} .; then
        echo -e "${GREEN}✅ Frontend image built successfully: ${FRONTEND_IMAGE}:${TAG}${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
    
    cd ..
}

# Function to show image sizes
show_images() {
    echo -e "${BLUE}📊 Built images:${NC}"
    docker images | grep ${PROJECT_NAME} | head -2
}

# Main execution
echo -e "${YELLOW}Starting build process...${NC}"

# Build backend
build_backend

echo ""

# Build frontend  
build_frontend

echo ""

# Show results
show_images

echo ""
echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   • Test locally: ${YELLOW}docker-compose -f docker-compose.prod.yml up${NC}"
echo -e "   • Push to registry: ${YELLOW}docker push ${BACKEND_IMAGE}:${TAG} && docker push ${FRONTEND_IMAGE}:${TAG}${NC}"
echo -e "   • Deploy to Railway: Follow the Railway deployment guide${NC}"
