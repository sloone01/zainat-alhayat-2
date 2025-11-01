#!/bin/bash

# Critical Functions Test Script
# Run this before and after any changes to ensure core functionality works

echo "🧪 Testing Critical Functions..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health Check
echo -e "${YELLOW}1. Testing Backend Health...${NC}"
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api)
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding (HTTP $BACKEND_RESPONSE)${NC}"
    exit 1
fi

# Test 2: Login API
echo -e "${YELLOW}2. Testing Login API...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@zinatalhaykindergarten.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login API is working${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Login API failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Protected Route (using token)
echo -e "${YELLOW}3. Testing Protected Route...${NC}"
PROFILE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:3002/api/auth/profile)

if [ "$PROFILE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Protected routes working${NC}"
else
    echo -e "${RED}❌ Protected routes failed (HTTP $PROFILE_RESPONSE)${NC}"
    exit 1
fi

# Test 4: Frontend Health
echo -e "${YELLOW}4. Testing Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is serving${NC}"
else
    echo -e "${RED}❌ Frontend is not responding (HTTP $FRONTEND_RESPONSE)${NC}"
    exit 1
fi

# Test 5: Database Connection (via API)
echo -e "${YELLOW}5. Testing Database Connection...${NC}"
DB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:3002/api/groups)

if [ "$DB_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Database connection working${NC}"
else
    echo -e "${RED}❌ Database connection failed (HTTP $DB_RESPONSE)${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All critical functions are working!${NC}"
echo "================================"
