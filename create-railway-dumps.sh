#!/bin/bash

# Create Railway-Compatible Database Dumps
# This script creates separate schema and data dumps for Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Creating Railway-Compatible Database Dumps${NC}"
echo ""

# Database configuration
DB_CONTAINER="zinat_postgres_prod"
DB_NAME="school_management"
DB_USER="school_admin"

# Check if Docker container exists
if ! docker ps | grep -q $DB_CONTAINER; then
    echo -e "${RED}❌ Docker container $DB_CONTAINER not found or not running${NC}"
    echo -e "${YELLOW}💡 Make sure your local database is running${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Creating schema-only dump...${NC}"

# Create schema-only dump (no data, no ownership)
docker exec -t $DB_CONTAINER pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    --schema-only \
    --no-owner \
    --no-privileges \
    --no-tablespaces \
    --no-security-labels \
    --no-comments \
    > railway_schema.sql

echo -e "${GREEN}✅ Schema dump created: railway_schema.sql${NC}"

echo -e "${YELLOW}🔄 Creating data-only dump...${NC}"

# Create data-only dump (no schema, clean inserts)
docker exec -t $DB_CONTAINER pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    --data-only \
    --no-owner \
    --no-privileges \
    --inserts \
    --disable-triggers \
    > railway_data.sql

echo -e "${GREEN}✅ Data dump created: railway_data.sql${NC}"

# Show file sizes
SCHEMA_SIZE=$(wc -l < railway_schema.sql)
DATA_SIZE=$(wc -l < railway_data.sql)

echo ""
echo -e "${BLUE}📊 Dump files created:${NC}"
echo -e "${YELLOW}   Schema: railway_schema.sql ($SCHEMA_SIZE lines)${NC}"
echo -e "${YELLOW}   Data: railway_data.sql ($DATA_SIZE lines)${NC}"

# Check for problematic content
echo ""
echo -e "${BLUE}🔍 Checking for issues...${NC}"

SCHEMA_ISSUES=$(grep -c "school_admin\|OWNER TO\|GRANT\|REVOKE" railway_schema.sql || true)
DATA_ISSUES=$(grep -c "school_admin\|OWNER TO\|GRANT\|REVOKE" railway_data.sql || true)

if [ "$SCHEMA_ISSUES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Schema file has $SCHEMA_ISSUES potential issues${NC}"
else
    echo -e "${GREEN}✅ Schema file looks clean${NC}"
fi

if [ "$DATA_ISSUES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Data file has $DATA_ISSUES potential issues${NC}"
else
    echo -e "${GREEN}✅ Data file looks clean${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Railway-compatible dumps created!${NC}"
echo ""
echo -e "${BLUE}📋 Import instructions:${NC}"
echo -e "${YELLOW}   1. Import schema first:${NC}"
echo -e "${YELLOW}      psql \"YOUR_RAILWAY_DATABASE_URL\" < railway_schema.sql${NC}"
echo ""
echo -e "${YELLOW}   2. Then import data:${NC}"
echo -e "${YELLOW}      psql \"YOUR_RAILWAY_DATABASE_URL\" < railway_data.sql${NC}"
echo ""
echo -e "${BLUE}💡 Alternative - Combined import:${NC}"
echo -e "${YELLOW}   cat railway_schema.sql railway_data.sql | psql \"YOUR_RAILWAY_DATABASE_URL\"${NC}"
