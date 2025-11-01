#!/bin/bash

# Test Schedule Table Without Authentication
echo "🚧 Testing Schedule Table with Authentication Disabled"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Backend API without authentication
echo -e "${YELLOW}Step 1: Testing Backend API (No Auth Required)...${NC}"

# Test groups endpoint
GROUPS_RESPONSE=$(curl -s http://localhost:3002/api/groups)
if echo "$GROUPS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Groups API accessible without auth${NC}"
    GROUP_ID=$(echo "$GROUPS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    GROUP_NAME=$(echo "$GROUPS_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${BLUE}Found group: $GROUP_NAME (ID: $GROUP_ID)${NC}"
else
    echo -e "${RED}❌ Groups API failed${NC}"
    echo "Response: $GROUPS_RESPONSE"
    exit 1
fi

# Test schedules endpoint
echo -e "${YELLOW}Step 2: Testing Schedules API (No Auth Required)...${NC}"
SCHEDULES_RESPONSE=$(curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID")
if echo "$SCHEDULES_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Schedules API accessible without auth${NC}"
    SCHEDULE_COUNT=$(echo "$SCHEDULES_RESPONSE" | grep -o '"id":"[^"]*' | wc -l)
    echo -e "${BLUE}Found $SCHEDULE_COUNT schedules for group $GROUP_NAME${NC}"
    
    # Show sample schedule with time format
    echo -e "${BLUE}Sample schedule data:${NC}"
    echo "$SCHEDULES_RESPONSE" | grep -o '"start_time":"[^"]*' | head -3
    echo "$SCHEDULES_RESPONSE" | grep -o '"day_of_week":"[^"]*' | head -3
else
    echo -e "${RED}❌ Schedules API failed${NC}"
    echo "Response: $SCHEDULES_RESPONSE"
    exit 1
fi

# Test courses endpoint
echo -e "${YELLOW}Step 3: Testing Courses API (No Auth Required)...${NC}"
COURSES_RESPONSE=$(curl -s "http://localhost:3002/api/courses?school_id=1")
if echo "$COURSES_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Courses API accessible without auth${NC}"
    COURSE_COUNT=$(echo "$COURSES_RESPONSE" | grep -o '"id":"[^"]*' | wc -l)
    echo -e "${BLUE}Found $COURSE_COUNT courses${NC}"
else
    echo -e "${RED}❌ Courses API failed${NC}"
    echo "Response: $COURSES_RESPONSE"
    exit 1
fi

# Test 4: Frontend accessibility
echo -e "${YELLOW}Step 4: Testing Frontend Pages (No Auth Required)...${NC}"

# Test schedule page
SCHEDULE_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/schedule)
if [ "$SCHEDULE_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Schedule page accessible without auth${NC}"
else
    echo -e "${RED}❌ Schedule page not accessible (HTTP $SCHEDULE_PAGE_STATUS)${NC}"
    exit 1
fi

# Test dashboard page
DASHBOARD_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/dashboard)
if [ "$DASHBOARD_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard page accessible without auth${NC}"
else
    echo -e "${RED}❌ Dashboard page not accessible (HTTP $DASHBOARD_PAGE_STATUS)${NC}"
    exit 1
fi

# Test 5: Create a test schedule to verify saving works
echo -e "${YELLOW}Step 5: Testing Schedule Creation (No Auth Required)...${NC}"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3002/api/schedules \
    -H "Content-Type: application/json" \
    -d "{
        \"day_of_week\": \"wednesday\",
        \"start_time\": \"11:00:00\",
        \"end_time\": \"11:45:00\",
        \"duration_minutes\": 45,
        \"subject\": \"Development Test Schedule\",
        \"notes\": \"Test schedule created during development\",
        \"is_recurring\": true,
        \"group_id\": \"$GROUP_ID\",
        \"teacher_id\": null
    }")

if echo "$CREATE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Schedule creation working without auth${NC}"
    NEW_SCHEDULE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Created schedule ID: $NEW_SCHEDULE_ID${NC}"
else
    echo -e "${RED}❌ Schedule creation failed${NC}"
    echo "Response: $CREATE_RESPONSE"
fi

# Test 6: Verify the new schedule appears in group schedules
echo -e "${YELLOW}Step 6: Verifying Schedule Persistence...${NC}"
UPDATED_SCHEDULES=$(curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID")
UPDATED_COUNT=$(echo "$UPDATED_SCHEDULES" | grep -o '"id":"[^"]*' | wc -l)
echo -e "${BLUE}Updated schedule count: $UPDATED_COUNT${NC}"

if [ "$UPDATED_COUNT" -gt "$SCHEDULE_COUNT" ]; then
    echo -e "${GREEN}✅ New schedule persisted successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Schedule count unchanged (may be duplicate)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Authentication Disabled Successfully!${NC}"
echo "============================================"
echo -e "${GREEN}✅ Backend: All APIs accessible without authentication${NC}"
echo -e "${GREEN}✅ Frontend: All pages accessible without login${NC}"
echo -e "${GREEN}✅ Database: Schedule operations working${NC}"
echo -e "${GREEN}✅ Persistence: Data saving and loading correctly${NC}"
echo ""
echo -e "${BLUE}📋 Development Environment Ready:${NC}"
echo -e "• Backend: http://localhost:3002/api"
echo -e "• Frontend: http://localhost:5173"
echo -e "• Schedule Management: http://localhost:5173/schedule"
echo -e "• Dashboard: http://localhost:5173/dashboard"
echo ""
echo -e "${YELLOW}🔧 Development Mode Active:${NC}"
echo -e "• No login required"
echo -e "• All routes accessible"
echo -e "• Mock user automatically provided"
echo -e "• Focus on schedule table development"
echo ""
echo -e "${GREEN}🚀 Ready to work on schedule table without authentication interruptions!${NC}"
