#!/bin/bash

# Test Railway Deployment Script
# This script tests if your Railway deployment is working

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Railway Deployment${NC}"
echo ""

# Get URLs from user
echo -e "${YELLOW}Please enter your Railway URLs:${NC}"
read -p "Backend URL (e.g., https://backend-production-xxxx.railway.app): " BACKEND_URL
read -p "Frontend URL (e.g., https://frontend-production-xxxx.railway.app): " FRONTEND_URL

echo ""
echo -e "${BLUE}🔍 Testing Backend...${NC}"

# Test backend health
if curl -s "${BACKEND_URL}/api/health" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo -e "${YELLOW}💡 Check backend logs in Railway dashboard${NC}"
fi

# Test backend API
if curl -s "${BACKEND_URL}/api" | grep -q -i "html\|json\|api"; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API not responding${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing Frontend...${NC}"

# Test frontend
if curl -s "${FRONTEND_URL}" | grep -q -i "html\|<!DOCTYPE"; then
    echo -e "${GREEN}✅ Frontend is serving HTML${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
    echo -e "${YELLOW}💡 Check frontend logs in Railway dashboard${NC}"
fi

echo ""
echo -e "${BLUE}📋 Manual Tests:${NC}"
echo -e "${YELLOW}1. Open frontend URL in browser: ${FRONTEND_URL}${NC}"
echo -e "${YELLOW}2. Check browser console for errors${NC}"
echo -e "${YELLOW}3. Try to login or access features${NC}"
echo -e "${YELLOW}4. Verify API calls work${NC}"

echo ""
echo -e "${BLUE}🔧 If issues persist:${NC}"
echo -e "${YELLOW}• Check Railway service logs${NC}"
echo -e "${YELLOW}• Verify environment variables are set${NC}"
echo -e "${YELLOW}• Ensure CORS_ORIGIN matches frontend URL${NC}"
echo -e "${YELLOW}• Check database connection${NC}"
