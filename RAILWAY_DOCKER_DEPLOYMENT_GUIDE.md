# 🚀 Railway Docker Deployment Guide

## 🎯 Overview

This guide will help you deploy your Zinat Al-Haya School Management System to Railway using Docker containers. This approach provides better reliability and consistency compared to traditional deployments.

## 📋 Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Docker installed locally (for testing)
- Railway account with a project created
- Your code pushed to a Git repository

## 🏗️ Project Structure

Your project now includes:
```
├── school-management-backend/
│   ├── Dockerfile                 # Backend Docker configuration
│   ├── railway.json              # Railway backend config
│   └── .dockerignore             # Backend build optimization
├── school-management-unified/
│   ├── Dockerfile                # Frontend Docker configuration  
│   ├── railway.json              # Railway frontend config
│   └── .dockerignore             # Frontend build optimization
├── docker-compose.prod.yml       # Production Docker Compose
├── docker-build.sh              # Local build script
├── .env.prod.example             # Environment template
└── RAILWAY_DOCKER_DEPLOYMENT_GUIDE.md
```

## 🔧 Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## 🗄️ Step 2: Set Up Database

### Option A: Use Railway PostgreSQL (Recommended)
```bash
# Create a new Railway project
railway new

# Add PostgreSQL service
railway add -d postgres

# Get database connection details
railway variables
```

### Option B: Use External Database
If you prefer an external database, you can use services like:
- Supabase (Free tier available)
- ElephantSQL (Free tier available)
- AWS RDS (Paid)

## 🚀 Step 3: Deploy Backend Service

```bash
# Navigate to backend directory
cd school-management-backend

# Link to Railway project
railway link

# Set environment variables
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
railway variables --set JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
railway variables --set SESSION_SECRET="your-super-secret-session-key-min-32-chars"
railway variables --set BCRYPT_SALT_ROUNDS=12
railway variables --set LOG_LEVEL=info
railway variables --set APP_NAME="Zinat Al-Haya School Management"
railway variables --set ENABLE_SWAGGER=false
railway variables --set ENABLE_METRICS=true

# Set database URL (if using Railway PostgreSQL)
railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'

# Deploy backend
railway up
```

## 🎨 Step 4: Deploy Frontend Service

```bash
# Navigate to frontend directory
cd ../school-management-unified

# Create frontend service via Railway dashboard:
# 1. Go to your Railway project dashboard
# 2. Click "New Service"
# 3. Select "GitHub Repo" and choose your repository
# 4. Set root directory to: school-management-unified
# 5. Railway will auto-detect it as a Node.js app

# Link to the frontend service
railway link

# Set environment variables
railway variables --set VITE_API_BASE_URL=https://your-backend-service.railway.app/api
railway variables --set VITE_APP_NAME="Zinat Al-Haya School Management"
railway variables --set VITE_APP_VERSION="1.0.0"
railway variables --set VITE_NODE_ENV=production
railway variables --set VITE_DEFAULT_LOCALE=ar

# Deploy frontend
railway up
```

## 🔗 Step 5: Configure CORS

After both services are deployed, update the backend CORS settings:

```bash
# Go back to backend directory
cd ../school-management-backend

# Update CORS origin with your frontend URL
railway variables --set CORS_ORIGIN=https://your-frontend-service.railway.app

# Redeploy backend
railway up

## ✅ Step 6: Verify Deployment

### Check Backend Health
```bash
# Test backend API
curl https://your-backend-service.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Check Frontend
Visit your frontend URL: `https://your-frontend-service.railway.app`

## 🔧 Step 7: Environment Variables Reference

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=3002  # Railway sets this automatically
DATABASE_URL=${{Postgres.DATABASE_URL}}  # If using Railway PostgreSQL
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
SESSION_SECRET=your-super-secret-session-key-min-32-chars
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info
APP_NAME=Zinat Al-Haya School Management
CORS_ORIGIN=https://your-frontend-service.railway.app
ENABLE_SWAGGER=false
ENABLE_METRICS=true
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend-service.railway.app/api
VITE_APP_NAME=Zinat Al-Haya School Management
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_DEFAULT_LOCALE=ar
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
railway logs

# Common solutions:
# - Ensure Dockerfile is in the correct directory
# - Check for missing dependencies in package.json
# - Verify Node.js version compatibility
```

#### 2. Database Connection Issues
```bash
# Check database variables
railway variables

# Ensure DATABASE_URL is set correctly:
# postgresql://username:password@host:port/database
```

#### 3. CORS Errors
```bash
# Update CORS origin in backend
railway variables --set CORS_ORIGIN=https://your-frontend-service.railway.app

# Redeploy backend
railway up
```

#### 4. Frontend API Connection Issues
```bash
# Check frontend environment variables
railway variables

# Ensure VITE_API_BASE_URL points to your backend:
# https://your-backend-service.railway.app/api
```

## 📊 Monitoring and Logs

```bash
# View real-time logs
railway logs --follow

# View specific service logs
railway logs --service backend
railway logs --service frontend

# Check service status
railway status
```

## 🔄 Updates and Redeployment

```bash
# After making code changes, simply push to your repository
git add .
git commit -m "Update application"
git push

# Railway will automatically redeploy
# Or manually trigger deployment:
railway up
```

## 💰 Cost Optimization

### Railway Pricing Tips:
- **Starter Plan**: $5/month per service
- **Database**: Additional cost for PostgreSQL
- **Sleep Mode**: Services sleep after 30 minutes of inactivity (Starter plan)
- **Custom Domains**: Available on paid plans

### Optimization Strategies:
1. Use Railway's PostgreSQL for simplicity
2. Enable sleep mode for development environments
3. Monitor resource usage in Railway dashboard
4. Consider combining services if possible

## 🎉 Success! Your Application is Live

After successful deployment, you'll have:
- ✅ Backend API: `https://your-backend-service.railway.app`
- ✅ Frontend App: `https://your-frontend-service.railway.app`
- ✅ Database: Managed PostgreSQL on Railway
- ✅ Automatic deployments on code changes
- ✅ SSL certificates (HTTPS) included
- ✅ Health checks and monitoring

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Vue.js Production Deployment](https://vuejs.org/guide/best-practices/production-deployment.html)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway logs: `railway logs`
3. Verify environment variables: `railway variables`
4. Check service status: `railway status`
5. Consult Railway documentation or community

Your school management system is now running on Railway with Docker! 🎓✨
```
