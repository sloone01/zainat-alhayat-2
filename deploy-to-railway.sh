#!/bin/bash

# Railway Deployment Script for Zinat Al-Haya School Management System
# This script helps deploy both backend and frontend services to Railway

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Deployment Script${NC}"
echo -e "${BLUE}📦 Zinat Al-Haya School Management System${NC}"
echo ""

# Check if Railway CLI is installed
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

echo -e "${GREEN}✅ Railway CLI is ready${NC}"
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}🔧 Deploying Backend Service${NC}"
    echo ""
    
    cd school-management-backend
    
    # Check if already linked to a project
    if [ ! -f ".railway" ]; then
        echo -e "${YELLOW}🔗 Linking to Railway project...${NC}"
        railway link
    fi
    
    echo -e "${YELLOW}⚙️  Setting environment variables...${NC}"
    
    # Generate secrets
    JWT_SECRET=$(generate_secret)
    JWT_REFRESH_SECRET=$(generate_secret)
    SESSION_SECRET=$(generate_secret)
    
    # Set environment variables using the correct Railway CLI syntax
    railway variables --set NODE_ENV=production
    railway variables --set JWT_SECRET="$JWT_SECRET"
    railway variables --set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
    railway variables --set SESSION_SECRET="$SESSION_SECRET"
    railway variables --set BCRYPT_SALT_ROUNDS=12
    railway variables --set LOG_LEVEL=info
    railway variables --set APP_NAME="Zinat Al-Haya School Management"
    railway variables --set ENABLE_SWAGGER=false
    railway variables --set ENABLE_METRICS=true
    
    echo -e "${GREEN}✅ Environment variables set${NC}"
    
    # Deploy
    echo -e "${YELLOW}🚀 Deploying backend...${NC}"
    railway up --detach
    
    # Get the service URL
    BACKEND_URL=$(railway domain)
    echo -e "${GREEN}✅ Backend deployed: $BACKEND_URL${NC}"
    
    cd ..
    
    # Store backend URL for frontend deployment
    echo "$BACKEND_URL" > .backend_url
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}🎨 Deploying Frontend Service${NC}"
    echo ""
    
    cd school-management-unified
    
    # Get backend URL
    if [ -f "../.backend_url" ]; then
        BACKEND_URL=$(cat ../.backend_url)
    else
        echo -e "${YELLOW}🔗 Please enter your backend URL:${NC}"
        read -r BACKEND_URL
    fi
    
    # Note: Frontend service needs to be created via Railway dashboard
    echo -e "${YELLOW}🆕 Frontend service setup...${NC}"
    echo -e "${BLUE}📋 Please create a frontend service via Railway dashboard:${NC}"
    echo -e "${YELLOW}   1. Go to your Railway project dashboard${NC}"
    echo -e "${YELLOW}   2. Click 'New Service'${NC}"
    echo -e "${YELLOW}   3. Select 'GitHub Repo' and choose your repository${NC}"
    echo -e "${YELLOW}   4. Set root directory to: school-management-unified${NC}"
    echo -e "${YELLOW}   5. Railway will auto-detect it as a Node.js app${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter after creating the frontend service...${NC}"
    read -r

    # Link to the frontend service
    echo -e "${YELLOW}🔗 Linking to frontend service...${NC}"
    railway link
    
    echo -e "${YELLOW}⚙️  Setting environment variables...${NC}"
    
    # Set environment variables using the correct Railway CLI syntax
    railway variables --set VITE_API_BASE_URL="$BACKEND_URL/api"
    railway variables --set VITE_APP_NAME="Zinat Al-Haya School Management"
    railway variables --set VITE_APP_VERSION="1.0.0"
    railway variables --set VITE_NODE_ENV=production
    railway variables --set VITE_DEFAULT_LOCALE=ar
    
    echo -e "${GREEN}✅ Environment variables set${NC}"
    
    # Deploy
    echo -e "${YELLOW}🚀 Deploying frontend...${NC}"
    railway up --detach
    
    # Get the service URL
    FRONTEND_URL=$(railway domain)
    echo -e "${GREEN}✅ Frontend deployed: $FRONTEND_URL${NC}"
    
    cd ..
    
    # Update backend CORS
    echo -e "${YELLOW}🔗 Updating backend CORS settings...${NC}"
    cd school-management-backend
    railway variables --set CORS_ORIGIN="$FRONTEND_URL"
    railway up --detach
    cd ..
    
    echo -e "${GREEN}✅ CORS updated${NC}"
    
    # Store URLs
    echo "$FRONTEND_URL" > .frontend_url
}

# Function to setup database
setup_database() {
    echo -e "${BLUE}🗄️  Setting up Database${NC}"
    echo ""
    
    echo -e "${YELLOW}Choose database option:${NC}"
    echo -e "1) Add Railway PostgreSQL (Recommended)"
    echo -e "2) Use external database"
    echo -e "3) Skip database setup"
    
    read -r db_choice
    
    case $db_choice in
        1)
            echo -e "${YELLOW}📦 Adding PostgreSQL service...${NC}"
            railway add -d postgres
            
            echo -e "${YELLOW}🔗 Linking database to backend...${NC}"
            cd school-management-backend
            railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'
            cd ..
            
            echo -e "${GREEN}✅ PostgreSQL added and linked${NC}"
            ;;
        2)
            echo -e "${YELLOW}🔗 Please enter your database URL:${NC}"
            read -r DATABASE_URL
            
            cd school-management-backend
            railway variables --set DATABASE_URL="$DATABASE_URL"
            cd ..
            
            echo -e "${GREEN}✅ External database configured${NC}"
            ;;
        3)
            echo -e "${YELLOW}⏭️  Skipping database setup${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
}

# Main deployment flow
echo -e "${YELLOW}🎯 What would you like to deploy?${NC}"
echo -e "1) Full deployment (Database + Backend + Frontend)"
echo -e "2) Backend only"
echo -e "3) Frontend only"
echo -e "4) Database setup only"

read -r deploy_choice

case $deploy_choice in
    1)
        setup_database
        deploy_backend
        deploy_frontend
        ;;
    2)
        deploy_backend
        ;;
    3)
        deploy_frontend
        ;;
    4)
        setup_database
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""

# Show final URLs
if [ -f ".backend_url" ]; then
    BACKEND_URL=$(cat .backend_url)
    echo -e "${BLUE}🔧 Backend: $BACKEND_URL${NC}"
fi

if [ -f ".frontend_url" ]; then
    FRONTEND_URL=$(cat .frontend_url)
    echo -e "${BLUE}🎨 Frontend: $FRONTEND_URL${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}   • Test your application${NC}"
echo -e "${YELLOW}   • Set up custom domains (optional)${NC}"
echo -e "${YELLOW}   • Monitor logs: railway logs${NC}"
echo -e "${YELLOW}   • Check status: railway status${NC}"

# Cleanup
rm -f .backend_url .frontend_url
