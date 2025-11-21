#!/bin/bash

# Diagnose Railway Database Issues
# This script checks what tables exist and their structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Railway Database Diagnostic${NC}"
echo ""

# Get Railway database URL
echo -e "${YELLOW}📋 Please provide your Railway DATABASE_URL:${NC}"
read -p "DATABASE_URL: " RAILWAY_DB_URL

if [ -z "$RAILWAY_DB_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Checking database connection...${NC}"

# Test connection
if psql "$RAILWAY_DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Listing all tables...${NC}"
psql "$RAILWAY_DB_URL" -c "\dt"

echo ""
echo -e "${BLUE}🔍 Searching for 'groups' table...${NC}"
GROUPS_EXISTS=$(psql "$RAILWAY_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups');" | xargs)

if [ "$GROUPS_EXISTS" = "t" ]; then
    echo -e "${GREEN}✅ 'groups' table exists${NC}"
    
    echo ""
    echo -e "${BLUE}📊 Groups table structure:${NC}"
    psql "$RAILWAY_DB_URL" -c "\d groups"
    
    echo ""
    echo -e "${BLUE}📈 Groups table data count:${NC}"
    psql "$RAILWAY_DB_URL" -c "SELECT COUNT(*) as total_groups FROM groups;"
    
    echo ""
    echo -e "${BLUE}📋 Sample groups data:${NC}"
    psql "$RAILWAY_DB_URL" -c "SELECT id, name, school_id, is_active FROM groups LIMIT 5;"
    
else
    echo -e "${RED}❌ 'groups' table does NOT exist${NC}"
    
    echo ""
    echo -e "${BLUE}🔍 Searching for similar table names...${NC}"
    psql "$RAILWAY_DB_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%group%';"
fi

echo ""
echo -e "${BLUE}🔍 Checking other expected tables...${NC}"

EXPECTED_TABLES=("students" "users" "courses" "schools" "academic_years")

for table in "${EXPECTED_TABLES[@]}"; do
    EXISTS=$(psql "$RAILWAY_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | xargs)
    if [ "$EXISTS" = "t" ]; then
        echo -e "${GREEN}✅ $table table exists${NC}"
    else
        echo -e "${RED}❌ $table table missing${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔍 Checking database schema...${NC}"
psql "$RAILWAY_DB_URL" -c "SELECT schema_name FROM information_schema.schemata;"

echo ""
echo -e "${BLUE}🔍 Checking current database and user...${NC}"
psql "$RAILWAY_DB_URL" -c "SELECT current_database(), current_user;"

echo ""
echo -e "${GREEN}🎉 Database diagnostic complete!${NC}"

if [ "$GROUPS_EXISTS" = "t" ]; then
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "${YELLOW}   • Groups table exists, so the issue might be with the backend connection${NC}"
    echo -e "${YELLOW}   • Check backend logs for more detailed error messages${NC}"
    echo -e "${YELLOW}   • Verify DATABASE_URL in Railway backend service matches this URL${NC}"
else
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "${YELLOW}   • Groups table is missing - the import may have failed${NC}"
    echo -e "${YELLOW}   • Try re-importing the database dump${NC}"
    echo -e "${YELLOW}   • Or enable TYPEORM_SYNCHRONIZE=true to auto-create tables${NC}"
fi
