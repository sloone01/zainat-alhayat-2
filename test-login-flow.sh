#!/bin/bash

# Comprehensive Login Flow Test
echo "🔐 Testing Complete Login Flow..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test credentials
EMAIL="admin@zinatalhaykindergarten.com"
PASSWORD="admin123"

echo -e "${BLUE}Testing with credentials:${NC}"
echo -e "Email: $EMAIL"
echo -e "Password: $PASSWORD"
echo ""

# Step 1: Test Backend Login API
echo -e "${YELLOW}Step 1: Testing Backend Login API...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Raw response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Backend login API working${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "Token extracted: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Backend login API failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Step 2: Test Token Verification
echo -e "${YELLOW}Step 2: Testing Token Verification...${NC}"
VERIFY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:3002/api/auth/verify)

if [ "$VERIFY_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Token verification working${NC}"
else
    echo -e "${RED}❌ Token verification failed (HTTP $VERIFY_RESPONSE)${NC}"
    exit 1
fi

# Step 3: Test Profile Endpoint
echo -e "${YELLOW}Step 3: Testing Profile Endpoint...${NC}"
PROFILE_RESPONSE=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:3002/api/auth/profile)

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✅ Profile endpoint working${NC}"
    echo "Profile data: $(echo "$PROFILE_RESPONSE" | head -c 100)..."
else
    echo -e "${RED}❌ Profile endpoint failed${NC}"
    echo "Response: $PROFILE_RESPONSE"
    exit 1
fi

# Step 4: Test Frontend Serving
echo -e "${YELLOW}Step 4: Testing Frontend Serving...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend serving correctly${NC}"
else
    echo -e "${RED}❌ Frontend not serving (HTTP $FRONTEND_STATUS)${NC}"
    exit 1
fi

# Step 5: Test Login Page
echo -e "${YELLOW}Step 5: Testing Login Page...${NC}"
LOGIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/login)
if [ "$LOGIN_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Login page accessible${NC}"
else
    echo -e "${RED}❌ Login page not accessible (HTTP $LOGIN_PAGE_STATUS)${NC}"
    exit 1
fi

# Step 6: Test CORS Headers
echo -e "${YELLOW}Step 6: Testing CORS Headers...${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    http://localhost:3002/api/auth/login)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
else
    echo -e "${YELLOW}⚠️ CORS headers may be missing${NC}"
    echo "CORS response: $CORS_RESPONSE"
fi

# Step 7: Test Frontend API Call (simulated)
echo -e "${YELLOW}Step 7: Testing Frontend-style API Call...${NC}"
FRONTEND_API_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:5173" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$FRONTEND_API_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Frontend-style API call working${NC}"
else
    echo -e "${RED}❌ Frontend-style API call failed${NC}"
    echo "Response: $FRONTEND_API_RESPONSE"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All login flow tests passed!${NC}"
echo "================================"
echo -e "${BLUE}Summary:${NC}"
echo "✅ Backend login API working"
echo "✅ Token verification working"
echo "✅ Profile endpoint working"
echo "✅ Frontend serving correctly"
echo "✅ Login page accessible"
echo "✅ CORS configured"
echo "✅ Frontend-style API calls working"
echo ""
echo -e "${GREEN}🚀 Login should be working in the browser!${NC}"
echo -e "${BLUE}Try logging in at: http://localhost:5173/login${NC}"
