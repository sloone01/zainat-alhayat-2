#!/bin/bash

# Complete Database Dump Fix for Railway
# This script removes ALL user/role references from the dump file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Complete Database Dump Fix for Railway${NC}"
echo ""

# Get dump file name
if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide the dump file name:${NC}"
    read -p "Dump file: " DUMP_FILE
else
    DUMP_FILE=$1
fi

if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Dump file not found: $DUMP_FILE${NC}"
    exit 1
fi

# Create completely cleaned version
CLEAN_DUMP="railway_clean_$(basename $DUMP_FILE)"

echo -e "${YELLOW}🔄 Completely cleaning dump file...${NC}"

# Remove ALL problematic lines
grep -v -E '^(CREATE ROLE|ALTER ROLE|GRANT|REVOKE|ALTER.*OWNER TO|COMMENT ON EXTENSION|SET row_security|SELECT pg_catalog\.set_config)' "$DUMP_FILE" | \
sed -e 's/OWNER TO [^;]*;//g' \
    -e 's/OWNER TO [^[:space:]]*//g' \
    -e '/^--.*school_admin/d' \
    -e '/school_admin/d' \
    -e 's/FOR ROLE [^;]*;//g' \
    -e 's/TO [^;]*;$/;/g' \
    -e '/^ALTER DEFAULT PRIVILEGES/d' \
    -e '/^REVOKE ALL/d' \
    -e '/^GRANT ALL/d' \
    -e '/^GRANT USAGE/d' \
    -e '/^GRANT CREATE/d' \
    -e '/^GRANT SELECT/d' \
    -e '/^GRANT INSERT/d' \
    -e '/^GRANT UPDATE/d' \
    -e '/^GRANT DELETE/d' \
    > "$CLEAN_DUMP"

echo -e "${GREEN}✅ Completely cleaned dump file created: $CLEAN_DUMP${NC}"

# Show file sizes
ORIGINAL_SIZE=$(wc -l < "$DUMP_FILE")
CLEAN_SIZE=$(wc -l < "$CLEAN_DUMP")

echo -e "${BLUE}📊 File comparison:${NC}"
echo -e "${YELLOW}   Original: $ORIGINAL_SIZE lines${NC}"
echo -e "${YELLOW}   Cleaned: $CLEAN_SIZE lines${NC}"
echo -e "${YELLOW}   Removed: $((ORIGINAL_SIZE - CLEAN_SIZE)) lines${NC}"

# Check for remaining problematic lines
echo ""
echo -e "${BLUE}🔍 Checking for remaining issues...${NC}"

REMAINING_ISSUES=$(grep -c "school_admin\|OWNER TO\|GRANT.*TO\|REVOKE.*FROM" "$CLEAN_DUMP" || true)

if [ "$REMAINING_ISSUES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $REMAINING_ISSUES potentially problematic lines${NC}"
    echo -e "${BLUE}Showing first few:${NC}"
    grep -n "school_admin\|OWNER TO\|GRANT.*TO\|REVOKE.*FROM" "$CLEAN_DUMP" | head -5 || true
else
    echo -e "${GREEN}✅ No problematic lines found!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Dump file is now completely cleaned for Railway!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}   1. Import using: psql \"YOUR_RAILWAY_DATABASE_URL\" < $CLEAN_DUMP${NC}"
echo -e "${YELLOW}   2. Test your backend endpoints${NC}"
echo ""
echo -e "${BLUE}💡 Example import command:${NC}"
echo -e "${YELLOW}   psql \"postgresql://user:pass@host:port/db\" < $CLEAN_DUMP${NC}"
