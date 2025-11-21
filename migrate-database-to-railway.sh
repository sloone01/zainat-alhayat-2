#!/bin/bash

# Migrate Local Database to Railway
# This script exports your local database and imports it to Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Database Migration to Railway${NC}"
echo ""

# Check if pg_dump and psql are available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ pg_dump not found. Please install PostgreSQL client tools.${NC}"
    echo -e "${YELLOW}💡 On Mac: brew install postgresql${NC}"
    exit 1
fi

# Get Railway database URL
echo -e "${YELLOW}📋 Please provide your Railway database connection details:${NC}"
echo ""
echo -e "${BLUE}You can find these in your Railway PostgreSQL service → Variables tab${NC}"
echo ""

read -p "Railway DATABASE_URL (postgresql://user:pass@host:port/db): " RAILWAY_DB_URL

if [ -z "$RAILWAY_DB_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is required${NC}"
    exit 1
fi

# Local database configuration
echo ""
echo -e "${YELLOW}📋 Local database configuration:${NC}"
echo -e "${BLUE}Choose your local database setup:${NC}"
echo "1) Docker container (zinat_postgres_prod)"
echo "2) Local PostgreSQL installation"
echo "3) Custom connection"

read -p "Choose option (1-3): " LOCAL_OPTION

case $LOCAL_OPTION in
    1)
        echo -e "${GREEN}✅ Using Docker container${NC}"
        LOCAL_CONTAINER="zinat_postgres_prod"
        LOCAL_DB_NAME="school_management"
        LOCAL_USER="school_admin"
        ;;
    2)
        echo -e "${GREEN}✅ Using local PostgreSQL${NC}"
        LOCAL_HOST="localhost"
        LOCAL_PORT="5432"
        LOCAL_DB_NAME="school_management"
        LOCAL_USER="school_admin"
        ;;
    3)
        echo -e "${GREEN}✅ Using custom connection${NC}"
        read -p "Local DATABASE_URL: " LOCAL_DB_URL
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

# Create backup filename with timestamp
BACKUP_FILE="railway_migration_$(date +%Y%m%d_%H%M%S).sql"

echo ""
echo -e "${YELLOW}🔄 Starting database migration...${NC}"

# Step 1: Export local database
echo -e "${BLUE}📤 Exporting local database...${NC}"

if [ "$LOCAL_OPTION" = "1" ]; then
    # Docker export
    if docker exec -t $LOCAL_CONTAINER pg_dump -U $LOCAL_USER -d $LOCAL_DB_NAME --clean --if-exists --create > $BACKUP_FILE; then
        echo -e "${GREEN}✅ Local database exported successfully${NC}"
    else
        echo -e "${RED}❌ Failed to export local database${NC}"
        exit 1
    fi
elif [ "$LOCAL_OPTION" = "2" ]; then
    # Local PostgreSQL export
    if pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB_NAME --clean --if-exists --create > $BACKUP_FILE; then
        echo -e "${GREEN}✅ Local database exported successfully${NC}"
    else
        echo -e "${RED}❌ Failed to export local database${NC}"
        exit 1
    fi
else
    # Custom connection export
    if pg_dump "$LOCAL_DB_URL" --clean --if-exists --create > $BACKUP_FILE; then
        echo -e "${GREEN}✅ Local database exported successfully${NC}"
    else
        echo -e "${RED}❌ Failed to export local database${NC}"
        exit 1
    fi
fi

# Check backup file size
BACKUP_SIZE=$(wc -l < $BACKUP_FILE)
echo -e "${BLUE}📊 Backup file: $BACKUP_FILE ($BACKUP_SIZE lines)${NC}"

if [ $BACKUP_SIZE -lt 10 ]; then
    echo -e "${RED}❌ Backup file seems too small. Please check your local database connection.${NC}"
    exit 1
fi

# Step 2: Import to Railway
echo ""
echo -e "${BLUE}📥 Importing to Railway database...${NC}"
echo -e "${YELLOW}⚠️  This will replace all data in your Railway database!${NC}"
read -p "Continue? (y/N): " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Migration cancelled${NC}"
    exit 0
fi

if psql "$RAILWAY_DB_URL" < $BACKUP_FILE; then
    echo -e "${GREEN}✅ Database imported to Railway successfully!${NC}"
else
    echo -e "${RED}❌ Failed to import database to Railway${NC}"
    echo -e "${YELLOW}💡 Check your Railway DATABASE_URL and try again${NC}"
    exit 1
fi

# Step 3: Verify migration
echo ""
echo -e "${BLUE}🔍 Verifying migration...${NC}"

# Test connection and check tables
if psql "$RAILWAY_DB_URL" -c "\dt" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Railway database connection successful${NC}"
    
    # List tables
    echo -e "${BLUE}📋 Tables in Railway database:${NC}"
    psql "$RAILWAY_DB_URL" -c "\dt" | grep -E "groups|students|users|courses" || echo "No main tables found"
else
    echo -e "${RED}❌ Failed to connect to Railway database${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database migration completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}   1. Test your backend: https://zinat-backend-production.up.railway.app/api/health${NC}"
echo -e "${YELLOW}   2. Check API endpoints work${NC}"
echo -e "${YELLOW}   3. Test frontend connectivity${NC}"
echo ""
echo -e "${BLUE}📁 Backup file saved as: $BACKUP_FILE${NC}"
echo -e "${YELLOW}   Keep this file safe in case you need to restore!${NC}"
