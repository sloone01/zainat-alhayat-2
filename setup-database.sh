#!/bin/bash

# Quick script to set up PostgreSQL database on Railway
# Run this from your project root directory

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Setting up PostgreSQL Database on Railway${NC}"
echo ""

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo -e "${YELLOW}💡 Install it with: npm install -g @railway/cli${NC}"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Railway first${NC}"
    railway login
fi

echo -e "${YELLOW}📦 Adding PostgreSQL database to your Railway project...${NC}"

# Add PostgreSQL database
if railway add -d postgres; then
    echo -e "${GREEN}✅ PostgreSQL database added successfully!${NC}"
    echo ""
    
    echo -e "${YELLOW}🔗 Linking database to backend service...${NC}"
    
    # Go to backend directory and set database URL
    if [ -d "school-management-backend" ]; then
        cd school-management-backend
        
        # Set the database URL environment variable
        railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'
        
        echo -e "${GREEN}✅ Database linked to backend service!${NC}"
        
        cd ..
    else
        echo -e "${YELLOW}⚠️  Backend directory not found. Please set DATABASE_URL manually:${NC}"
        echo -e "${YELLOW}   cd school-management-backend${NC}"
        echo -e "${YELLOW}   railway variables --set DATABASE_URL='\${{Postgres.DATABASE_URL}}'${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Database Information:${NC}"
    echo -e "${YELLOW}   • Database Type: PostgreSQL${NC}"
    echo -e "${YELLOW}   • Connection: Automatic via Railway${NC}"
    echo -e "${YELLOW}   • Environment Variable: DATABASE_URL${NC}"
    echo ""
    echo -e "${GREEN}🎉 Database setup complete!${NC}"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "${YELLOW}   1. Deploy your backend: cd school-management-backend && railway up${NC}"
    echo -e "${YELLOW}   2. Check database connection in your app logs${NC}"
    echo -e "${YELLOW}   3. Run migrations if needed${NC}"
    
else
    echo -e "${RED}❌ Failed to add PostgreSQL database${NC}"
    echo -e "${YELLOW}💡 You can also add it manually from the Railway dashboard${NC}"
    exit 1
fi
