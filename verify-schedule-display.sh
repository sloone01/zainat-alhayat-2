#!/bin/bash

# Verify Schedule Display Fix
echo "🔍 Verifying Schedule Display Fix"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

GROUP_ID="b23ce3b0-86ea-4a10-9c3c-4976f4273069"

echo -e "${YELLOW}Testing schedule data for Creative Explorers group...${NC}"
echo ""

# Get schedules and show teacher assignments
echo -e "${BLUE}📊 Schedule Analysis:${NC}"
echo "===================="

RESPONSE=$(curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID")

# Count schedules with teachers
WITH_TEACHERS=$(echo "$RESPONSE" | grep -o '"teacher":{"id"' | wc -l)
WITHOUT_TEACHERS=$(echo "$RESPONSE" | grep -o '"teacher":null' | wc -l)

echo -e "${GREEN}✅ Schedules with teachers: $WITH_TEACHERS${NC}"
echo -e "${YELLOW}⚠️  Schedules without teachers: $WITHOUT_TEACHERS${NC}"

echo ""
echo -e "${BLUE}📋 Expected Frontend Display:${NC}"
echo "============================="

# Show what should appear in the frontend
echo "$RESPONSE" | grep -o '"subject":"[^"]*"' | head -5 | while read subject; do
    SUBJ=$(echo "$subject" | cut -d'"' -f4)
    echo -e "${BLUE}📚 Subject: $SUBJ${NC}"
done

echo ""
echo -e "${GREEN}👨‍🏫 Teachers that should appear:${NC}"
echo "================================"

# Extract teacher names
echo "$RESPONSE" | grep -o '"firstName":"[^"]*","lastName":"[^"]*"' | sort -u | while read teacher; do
    FIRST=$(echo "$teacher" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4)
    LAST=$(echo "$teacher" | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ $FIRST $LAST${NC}"
done

echo ""
echo -e "${YELLOW}Expected behavior in frontend:${NC}"
echo "• Some schedules should show teacher names (Sara Abdullah, Aisha Mohamed)"
echo "• Some schedules should show 'غير محدد' for teacher"
echo "• All schedules should show 'غير محدد' for room (since room_id is null)"
echo "• Subject should show course names (Language Development, Physical Development, etc.)"

echo ""
echo -e "${BLUE}🔧 To verify the fix:${NC}"
echo "1. Open: http://localhost:5173/schedule"
echo "2. Select 'Creative Explorers' group from dropdown"
echo "3. Look at the schedule table"
echo "4. Verify that you see DIFFERENT information:"
echo "   - Some cells show teacher names"
echo "   - Some cells show 'غير محدد'"
echo "   - NOT all cells showing the same 'غير محدد'"

echo ""
echo -e "${GREEN}🎯 Success criteria:${NC}"
echo "• Teacher column shows mix of names and 'غير محدد'"
echo "• Room column shows 'غير محدد' (expected since no rooms assigned)"
echo "• Subject column shows course names, not IDs"
echo "• Time slots display correctly"

echo ""
echo -e "${RED}🚨 If still seeing duplicate 'غير محدد':${NC}"
echo "• Clear browser cache (Cmd+Shift+R on Mac)"
echo "• Check browser console for errors"
echo "• Verify frontend hot reload picked up changes"

echo ""
echo -e "${BLUE}📱 Quick test URLs:${NC}"
echo "• Schedule page: http://localhost:5173/schedule"
echo "• Backend API: http://localhost:3002/api/schedules/group/$GROUP_ID"
