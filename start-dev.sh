#!/bin/bash

# Zinat Al-Haya School Management - Development Startup Script
# This script starts the complete development environment

echo "🌸 Starting Zinat Al-Haya School Management System..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to start PostgreSQL
start_database() {
    echo -e "${BLUE}🐘 Starting PostgreSQL database...${NC}"
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
    
    # Check if database is ready
    until docker-compose exec postgres pg_isready -U school_admin -d school_management > /dev/null 2>&1; do
        echo -e "${YELLOW}⏳ Still waiting for PostgreSQL...${NC}"
        sleep 2
    done
    
    echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
}

# Function to run migrations
run_migrations() {
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    cd school-management-backend
    npm run migration:run
    cd ..
    echo -e "${GREEN}✅ Migrations completed${NC}"
}

# Function to seed database (DISABLED FOR PRODUCTION SAFETY)
seed_database() {
    echo -e "${YELLOW}⚠️  Database seeding disabled to prevent sample data contamination${NC}"
    echo -e "${BLUE}📦 Seed files archived in school-management-backend/archived-seeds/${NC}"
    echo -e "${GREEN}✅ Skipping seeding (production-safe)${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🚀 Starting backend server...${NC}"
    cd school-management-backend
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend application...${NC}"
    cd school-management-unified
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
}

# Main execution
main() {
    check_docker
    start_database
    run_migrations
    seed_database
    start_backend
    sleep 5
    start_frontend
    
    echo ""
    echo -e "${GREEN}🎉 Development environment is ready!${NC}"
    echo "=================================================="
    echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3000/api"
    echo -e "${BLUE}🗄️  pgAdmin:${NC} http://localhost:8080"
    echo ""
    echo -e "${YELLOW}📋 Login Credentials:${NC}"
    echo -e "${BLUE}👨‍💼 Admin:${NC} admin / admin123"
    echo -e "${BLUE}👩‍🏫 Teacher:${NC} teacher1 / teacher123"
    echo -e "${BLUE}👨‍👩‍👧‍👦 Parent:${NC} parent1 / parent123"
    echo ""
    echo -e "${YELLOW}💡 To stop all services, run:${NC} ./stop-dev.sh"
    echo ""
    
    # Keep script running
    wait
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}🛑 Shutting down...${NC}"; docker-compose down; exit 0' INT

main
