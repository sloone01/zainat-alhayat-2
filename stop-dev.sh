#!/bin/bash

# Zinat Al-Haya School Management - Stop Development Environment
# This script stops all development services

echo "🛑 Stopping Zinat Al-Haya School Management System..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Stop Docker services
echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
docker-compose down

# Kill any remaining Node.js processes
echo -e "${BLUE}🔄 Stopping Node.js processes...${NC}"
pkill -f "nest start"
pkill -f "vite"
pkill -f "npm run dev"
pkill -f "npm run start:dev"

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
echo -e "${YELLOW}💡 To start again, run:${NC} ./start-dev.sh"
