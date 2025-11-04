#!/bin/bash

# 🔧 Fix Dependency Conflicts for Render Deployment
# Zinat Al-Haya School Management System

echo "🔧 Fixing dependency conflicts..."
echo "=================================="

# Navigate to backend directory
cd school-management-backend

# Remove node_modules and package-lock.json
echo "🧹 Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Install with legacy peer deps
echo "📦 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Test build
echo "🔨 Testing build process..."
npm run build:render

if [ $? -eq 0 ]; then
    echo "✅ Dependencies fixed successfully!"
    echo "📋 Next steps:"
    echo "1. Commit and push changes"
    echo "2. Update Render build command to: npm install --legacy-peer-deps && npm run build:render"
    echo "3. Redeploy on Render"
else
    echo "❌ Build still failing. Check the error messages above."
    echo "💡 Try removing @nestjs/terminus from package.json if issues persist."
fi

cd ..
