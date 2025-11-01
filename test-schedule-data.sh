#!/bin/bash

# Test Schedule Data Processing
echo "🔍 Testing Schedule Data Processing"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

GROUP_ID="b23ce3b0-86ea-4a10-9c3c-4976f4273069"

echo -e "${YELLOW}Fetching schedule data for Creative Explorers group...${NC}"
echo ""

# Get the raw schedule data and format it nicely
curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID" | jq '.data[] | {
  id: .id,
  day: .day_of_week,
  time: .start_time,
  subject: .subject,
  teacher_id: .teacher_id,
  teacher_name: (if .teacher then (.teacher.firstName + " " + .teacher.lastName) else "null" end),
  room_id: .room_id,
  room_name: (if .room then .room.name else "null" end)
}' | head -50

echo ""
echo -e "${BLUE}Summary of teacher assignments:${NC}"
curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID" | jq -r '.data[] | 
  if .teacher then 
    "✅ " + .subject + " → " + .teacher.firstName + " " + .teacher.lastName
  else 
    "❌ " + .subject + " → غير محدد (No teacher assigned)"
  end' | head -10

echo ""
echo -e "${BLUE}Summary of room assignments:${NC}"
curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID" | jq -r '.data[] | 
  if .room then 
    "✅ " + .subject + " → " + .room.name
  else 
    "❌ " + .subject + " → غير محدد (No room assigned)"
  end' | head -10

echo ""
echo -e "${GREEN}Expected Frontend Display:${NC}"
echo "================================"
curl -s "http://localhost:3002/api/schedules/group/$GROUP_ID" | jq -r '.data[] | 
  "📅 " + .day_of_week + " " + .start_time + " - " + .subject + 
  "\n   👨‍🏫 Teacher: " + (if .teacher then (.teacher.firstName + " " + .teacher.lastName) else "غير محدد") +
  "\n   🏫 Room: " + (if .room then .room.name else "غير محدد") +
  "\n"' | head -30

echo ""
echo -e "${YELLOW}🔧 To fix the issue:${NC}"
echo "1. Open http://localhost:5173/schedule"
echo "2. Select 'Creative Explorers' group"
echo "3. Check browser console for debug logs"
echo "4. Verify that schedules with teachers show names, not 'غير محدد'"
echo ""
echo -e "${BLUE}Expected behavior:${NC}"
echo "• Schedules with teachers should show teacher names"
echo "• Schedules without teachers should show 'غير محدد'"
echo "• Same for rooms"
