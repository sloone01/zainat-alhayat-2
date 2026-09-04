#!/bin/bash

# Quick Start Script for Zinat Al-Haya Kindergarten Management System
# This script helps you start the system quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏫 Zinat Al-Haya Kindergarten Management System${NC}"
echo -e "${BLUE}🚀 Quick Start Script${NC}"
echo ""

# Check if backend is running
echo -e "${YELLOW}🔍 Checking system status...${NC}"

if curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 3002${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo -e "${YELLOW}💡 Starting backend...${NC}"
    
    cd school-management-backend
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    npm install
    
    echo -e "${BLUE}🚀 Starting backend in development mode...${NC}"
    npm run start:dev &
    
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    sleep 10
    
    if curl -s http://localhost:3002/api/health > /dev/null; then
        echo -e "${GREEN}✅ Backend started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
    
    cd ..
fi

# Test authentication
echo -e "${YELLOW}🔐 Testing authentication...${NC}"
if node test-authentication.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Authentication system working${NC}"
else
    echo -e "${RED}❌ Authentication system not working${NC}"
    exit 1
fi

# Display system info
echo ""
echo -e "${GREEN}🎉 System is ready!${NC}"
echo ""
echo -e "${BLUE}📊 System Information:${NC}"
echo -e "🔗 Backend API: http://localhost:3002/api"
echo -e "🏥 Health Check: http://localhost:3002/api/health"
echo -e "🔧 Debug Info: http://localhost:3002/api/debug"
echo ""
echo -e "${BLUE}🔑 Admin Login Credentials:${NC}"
echo -e "📧 Email: Zahra@gmail.com"
echo -e "🔒 Password: ZahraAdmin123"
echo -e "👑 Role: Administrator"
echo ""
echo -e "${BLUE}🖥️  Frontend Setup:${NC}"
echo -e "1. Make sure you have Node.js 20+ installed"
echo -e "2. cd school-management-unified"
echo -e "3. npm install"
echo -e "4. npm run dev"
echo -e "5. Open http://localhost:5173"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo -e "• node test-authentication.js - Test login system"
echo -e "• node test-complete-system.js - Test all features"
echo -e "• node system-status-report.js - Generate status report"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
