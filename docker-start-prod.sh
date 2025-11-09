#!/bin/bash

# Production Docker Start Script for Zinat Al-Haya School Management System
# This script starts the production environment using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}🚀 Starting Zinat Al-Haya School Management System (Production)${NC}"
echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Environment file not found: $ENV_FILE${NC}"
    echo -e "${BLUE}📋 Creating from template...${NC}"
    
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example $ENV_FILE
        echo -e "${GREEN}✅ Created $ENV_FILE from template${NC}"
        echo -e "${RED}🔒 IMPORTANT: Please edit $ENV_FILE and update the secrets!${NC}"
        echo -e "${YELLOW}   - Update database password${NC}"
        echo -e "${YELLOW}   - Update JWT secrets (minimum 32 characters)${NC}"
        echo -e "${YELLOW}   - Update session secret${NC}"
        echo ""
        read -p "Press Enter after updating the environment file..."
    else
        echo -e "${RED}❌ Template file .env.prod.example not found${NC}"
        exit 1
    fi
fi

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to update secrets in env file
update_secrets() {
    echo -e "${BLUE}🔐 Generating secure secrets...${NC}"
    
    # Generate secrets
    JWT_SECRET=$(generate_secret)
    JWT_REFRESH_SECRET=$(generate_secret)
    SESSION_SECRET=$(generate_secret)
    DB_PASSWORD=$(generate_secret | cut -c1-16)
    
    # Update env file
    sed -i.bak "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/" $ENV_FILE
    sed -i.bak "s/your-super-secret-refresh-key-change-in-production-min-32-chars/$JWT_REFRESH_SECRET/" $ENV_FILE
    sed -i.bak "s/your-super-secret-session-key-change-in-production-min-32-chars/$SESSION_SECRET/" $ENV_FILE
    sed -i.bak "s/your-secure-database-password-here/$DB_PASSWORD/" $ENV_FILE
    
    # Remove backup file
    rm -f $ENV_FILE.bak
    
    echo -e "${GREEN}✅ Secrets generated and updated in $ENV_FILE${NC}"
}

# Ask if user wants to generate secrets
echo -e "${YELLOW}🔐 Do you want to auto-generate secure secrets? (y/n)${NC}"
read -r generate_secrets_choice

if [[ $generate_secrets_choice =~ ^[Yy]$ ]]; then
    update_secrets
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
echo -e "${YELLOW}   This may take a few minutes on first run...${NC}"
echo ""

# Load environment and start
if docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up --build -d; then
    echo ""
    echo -e "${GREEN}🎉 Services started successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}   Backend API: http://localhost:3002/api${NC}"
    echo -e "${GREEN}   Health Check: http://localhost:3002/api/health${NC}"
    echo -e "${GREEN}   Database: localhost:5432${NC}"
    echo ""
    echo -e "${BLUE}📋 Useful Commands:${NC}"
    echo -e "${YELLOW}   View logs: docker-compose -f $COMPOSE_FILE logs -f${NC}"
    echo -e "${YELLOW}   Stop services: docker-compose -f $COMPOSE_FILE down${NC}"
    echo -e "${YELLOW}   Restart: docker-compose -f $COMPOSE_FILE restart${NC}"
    echo ""
    echo -e "${GREEN}✨ Your school management system is now running in production mode!${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    echo -e "${YELLOW}💡 Check logs: docker-compose -f $COMPOSE_FILE logs${NC}"
    exit 1
fi
