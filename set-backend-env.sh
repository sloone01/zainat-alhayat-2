#!/bin/bash

# Quick script to set backend environment variables on Railway
# Run this from the school-management-backend directory

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting Backend Environment Variables${NC}"
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Generate secrets
echo -e "${YELLOW}🔐 Generating secure secrets...${NC}"
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)

echo -e "${YELLOW}⚙️  Setting environment variables...${NC}"

# Set environment variables
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables --set SESSION_SECRET="$SESSION_SECRET"
railway variables --set BCRYPT_SALT_ROUNDS=12
railway variables --set LOG_LEVEL=info
railway variables --set APP_NAME="Zinat Al-Haya School Management"
railway variables --set ENABLE_SWAGGER=false
railway variables --set ENABLE_METRICS=true

echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Variables set:${NC}"
echo -e "${YELLOW}   NODE_ENV=production${NC}"
echo -e "${YELLOW}   JWT_SECRET=****** (32 chars)${NC}"
echo -e "${YELLOW}   JWT_REFRESH_SECRET=****** (32 chars)${NC}"
echo -e "${YELLOW}   SESSION_SECRET=****** (32 chars)${NC}"
echo -e "${YELLOW}   BCRYPT_SALT_ROUNDS=12${NC}"
echo -e "${YELLOW}   LOG_LEVEL=info${NC}"
echo -e "${YELLOW}   APP_NAME=Zinat Al-Haya School Management${NC}"
echo -e "${YELLOW}   ENABLE_SWAGGER=false${NC}"
echo -e "${YELLOW}   ENABLE_METRICS=true${NC}"
echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "${YELLOW}   1. Set DATABASE_URL if you have a database${NC}"
echo -e "${YELLOW}   2. Set CORS_ORIGIN after deploying frontend${NC}"
echo -e "${YELLOW}   3. Deploy with: railway up${NC}"
