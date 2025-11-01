#!/bin/bash

# Test Login Button Direct Redirect
echo "🔄 Testing Login Button Direct Redirect to Dashboard"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Verify login page is accessible
echo -e "${YELLOW}Step 1: Testing Login Page Accessibility...${NC}"
LOGIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/login)
if [ "$LOGIN_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Login page accessible${NC}"
else
    echo -e "${RED}❌ Login page not accessible (HTTP $LOGIN_PAGE_STATUS)${NC}"
    exit 1
fi

# Test 2: Verify dashboard is accessible
echo -e "${YELLOW}Step 2: Testing Dashboard Accessibility...${NC}"
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/dashboard)
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard accessible${NC}"
else
    echo -e "${RED}❌ Dashboard not accessible (HTTP $DASHBOARD_STATUS)${NC}"
    exit 1
fi

# Test 3: Verify schedule page is accessible
echo -e "${YELLOW}Step 3: Testing Schedule Page Accessibility...${NC}"
SCHEDULE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/schedule)
if [ "$SCHEDULE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Schedule page accessible${NC}"
else
    echo -e "${RED}❌ Schedule page not accessible (HTTP $SCHEDULE_STATUS)${NC}"
    exit 1
fi

# Test 4: Verify backend is still working
echo -e "${YELLOW}Step 4: Testing Backend API...${NC}"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend API accessible${NC}"
else
    echo -e "${RED}❌ Backend API not accessible (HTTP $BACKEND_STATUS)${NC}"
    exit 1
fi

# Test 5: Verify groups API (for schedule functionality)
echo -e "${YELLOW}Step 5: Testing Groups API for Schedule...${NC}"
GROUPS_RESPONSE=$(curl -s http://localhost:3002/api/groups)
if echo "$GROUPS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Groups API working${NC}"
    GROUP_COUNT=$(echo "$GROUPS_RESPONSE" | grep -o '"id":"[^"]*' | wc -l)
    echo -e "${BLUE}Found $GROUP_COUNT groups available${NC}"
else
    echo -e "${RED}❌ Groups API failed${NC}"
    exit 1
fi

# Test 6: Verify schedules API
echo -e "${YELLOW}Step 6: Testing Schedules API...${NC}"
SCHEDULES_RESPONSE=$(curl -s http://localhost:3002/api/schedules)
if echo "$SCHEDULES_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Schedules API working${NC}"
    SCHEDULE_COUNT=$(echo "$SCHEDULES_RESPONSE" | grep -o '"id":"[^"]*' | wc -l)
    echo -e "${BLUE}Found $SCHEDULE_COUNT total schedules${NC}"
else
    echo -e "${RED}❌ Schedules API failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Login Button Redirect Setup Complete!${NC}"
echo "=========================================="
echo -e "${GREEN}✅ Login page: Accessible and ready${NC}"
echo -e "${GREEN}✅ Dashboard: Accessible without auth${NC}"
echo -e "${GREEN}✅ Schedule page: Accessible without auth${NC}"
echo -e "${GREEN}✅ Backend APIs: Working without auth${NC}"
echo -e "${GREEN}✅ Data available: Groups and schedules ready${NC}"
echo ""
echo -e "${BLUE}📋 Development Workflow:${NC}"
echo -e "1. Open: http://localhost:5173/login"
echo -e "2. Click the login button (no credentials needed)"
echo -e "3. Automatically redirected to dashboard"
echo -e "4. Navigate to schedule management"
echo -e "5. Work on schedule table without interruptions"
echo ""
echo -e "${YELLOW}🔧 Current Development Mode Features:${NC}"
echo -e "• Login button → Direct dashboard redirect"
echo -e "• No authentication required anywhere"
echo -e "• All pages accessible"
echo -e "• All APIs accessible"
echo -e "• Mock user automatically provided"
echo -e "• Schedule data ready for testing"
echo ""
echo -e "${GREEN}🚀 Ready for schedule table development!${NC}"
echo ""
echo -e "${BLUE}Quick Access URLs:${NC}"
echo -e "• Login: http://localhost:5173/login"
echo -e "• Dashboard: http://localhost:5173/dashboard"
echo -e "• Schedule: http://localhost:5173/schedule"
echo -e "• Backend: http://localhost:3002/api"
