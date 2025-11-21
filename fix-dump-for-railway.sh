#!/bin/bash

# Fix Database Dump for Railway
# This script removes user-specific references from the dump file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Database Dump for Railway${NC}"
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

# Create fixed version
FIXED_DUMP="railway_fixed_$(basename $DUMP_FILE)"

echo -e "${YELLOW}🔄 Processing dump file...${NC}"

# Remove problematic lines and fix ownership
sed -e '/^CREATE ROLE/d' \
    -e '/^ALTER ROLE/d' \
    -e '/^GRANT.*TO school_admin/d' \
    -e '/^REVOKE.*FROM school_admin/d' \
    -e 's/OWNER TO school_admin;//g' \
    -e 's/OWNER TO school_admin/OWNER TO postgres/g' \
    -e '/^ALTER.*OWNER TO school_admin/d' \
    -e '/^COMMENT ON EXTENSION/d' \
    -e '/^SET row_security/d' \
    -e '/^SELECT pg_catalog.set_config/d' \
    "$DUMP_FILE" > "$FIXED_DUMP"

echo -e "${GREEN}✅ Fixed dump file created: $FIXED_DUMP${NC}"

# Show file sizes
ORIGINAL_SIZE=$(wc -l < "$DUMP_FILE")
FIXED_SIZE=$(wc -l < "$FIXED_DUMP")

echo -e "${BLUE}📊 File comparison:${NC}"
echo -e "${YELLOW}   Original: $ORIGINAL_SIZE lines${NC}"
echo -e "${YELLOW}   Fixed: $FIXED_SIZE lines${NC}"
echo -e "${YELLOW}   Removed: $((ORIGINAL_SIZE - FIXED_SIZE)) lines${NC}"

echo ""
echo -e "${GREEN}🎉 Dump file is now ready for Railway!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}   1. Import using: psql \"YOUR_RAILWAY_DATABASE_URL\" < $FIXED_DUMP${NC}"
echo -e "${YELLOW}   2. Test your backend endpoints${NC}"
echo ""
echo -e "${BLUE}💡 Example import command:${NC}"
echo -e "${YELLOW}   psql \"postgresql://user:pass@host:port/db\" < $FIXED_DUMP${NC}"
