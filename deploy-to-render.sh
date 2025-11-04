#!/bin/bash

# 🚀 Quick Deploy to Render Script
# Zinat Al-Haya School Management System

echo "🚀 Preparing for Render Deployment..."
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Generate secrets
echo "🔑 Generating secure keys..."
node generate-secrets.js > deployment-secrets.txt
echo "✅ Secrets saved to deployment-secrets.txt"

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Prepare for Render deployment - $(date)"

echo ""
echo "✅ Repository prepared for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push this repository to GitHub"
echo "2. Follow the steps in RENDER_DEPLOYMENT_GUIDE.md"
echo "3. Use the secrets from deployment-secrets.txt for environment variables"
echo ""
echo "🔗 Quick Links:"
echo "- Render Dashboard: https://dashboard.render.com"
echo "- GitHub: https://github.com"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
