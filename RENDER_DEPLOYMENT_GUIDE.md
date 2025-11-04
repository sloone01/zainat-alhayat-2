# 🚀 Render Deployment Guide - Zinat Al-Haya School Management

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Generated Secrets** - Run the secret generation script

## 🔑 Step 1: Generate Secure Keys

Run this command to generate secure keys:

```bash
node generate-secrets.js
```

Copy the generated keys - you'll need them for environment variables.

## 📂 Step 2: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - School Management System for Render deployment"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git

# Push to GitHub
git push -u origin main
```

## 🗄️ Step 3: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with your GitHub account

2. **Create Database**
   - Click "New +" → "PostgreSQL"
   - **Name**: `school-management-db`
   - **Database**: `school_management`
   - **User**: `school_admin`
   - **Region**: Choose closest to your users
   - **Plan**: Free
   - Click "Create Database"

3. **Save Database Info**
   - Copy the **Internal Database URL** (starts with `postgresql://`)
   - You'll need this for the backend service

## 🔧 Step 4: Deploy Backend Service

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Name**: `school-management-backend`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `school-management-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build:render`
   - **Start Command**: `npm run start:prod`

2. **Configure Environment Variables**
   Click "Environment" tab and add these variables:

   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[Your Internal Database URL from Step 3]
   JWT_SECRET=[Generated JWT Secret]
   JWT_REFRESH_SECRET=[Generated Refresh Secret]
   SESSION_SECRET=[Generated Session Secret]
   CORS_ORIGIN=https://school-management-frontend.onrender.com
   BCRYPT_SALT_ROUNDS=12
   LOG_LEVEL=info
   APP_NAME=Zinat Al-Haya School Management
   ENABLE_SWAGGER=false
   ENABLE_METRICS=true
   ENABLE_HEALTH_CHECK=true
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://school-management-backend.onrender.com`)

## 🌐 Step 5: Deploy Frontend Service

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - **Name**: `school-management-frontend`
   - **Branch**: `main`
   - **Root Directory**: `school-management-unified`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

2. **Configure Environment Variables**
   Click "Environment" tab and add these variables:

   ```env
   VITE_API_URL=[Your Backend URL from Step 4]/api
   VITE_APP_NAME=Zinat Al-Haya School Management
   VITE_NODE_ENV=production
   VITE_DEFAULT_LOCALE=ar
   VITE_ENABLE_DEVTOOLS=false
   VITE_ENABLE_CONSOLE_LOGS=false
   VITE_SESSION_TIMEOUT=60
   VITE_API_TIMEOUT=30000
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://school-management-frontend.onrender.com`)

## 🔄 Step 6: Update CORS Configuration

1. **Update Backend CORS**
   - Go to your backend service in Render
   - Update the `CORS_ORIGIN` environment variable with your actual frontend URL
   - Example: `CORS_ORIGIN=https://school-management-frontend.onrender.com`

2. **Redeploy Backend**
   - Click "Manual Deploy" → "Deploy latest commit"

## ✅ Step 7: Test Your Deployment

1. **Check Backend Health**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return health status

2. **Check Frontend**
   - Visit: `https://your-frontend-url.onrender.com`
   - Should load the login page

3. **Test Login**
   - Try logging in with default credentials
   - Check if API calls work properly

## 🎯 Step 8: Initialize Database (First Time Only)

Your backend should automatically create the database tables on first run. If you need to manually initialize:

1. **Connect to Database**
   - Use the External Database URL from Render
   - Connect with a PostgreSQL client

2. **Run Migrations** (if needed)
   - Your NestJS app should handle this automatically

## 🔒 Security Checklist

### ✅ Before Going Live:
- [ ] All environment variables use secure, generated values
- [ ] `NODE_ENV=production` is set
- [ ] `ENABLE_SWAGGER=false` in production
- [ ] CORS is configured with your actual frontend URL
- [ ] Database uses strong passwords
- [ ] JWT secrets are at least 64 characters long

## 📊 Monitoring Your App

### **Render Dashboard**
- Monitor deployment logs
- Check service health
- View resource usage
- Set up alerts

### **Application Logs**
- Backend logs: Available in Render service dashboard
- Frontend logs: Check browser console for errors

## 💰 Render Free Tier Limits

### **Web Services (Backend):**
- 750 hours/month (about 31 days)
- Sleeps after 15 minutes of inactivity
- Wakes up on first request (may take 30+ seconds)

### **Static Sites (Frontend):**
- Unlimited bandwidth
- Global CDN included
- Always available (no sleeping)

### **PostgreSQL:**
- 1GB storage
- 1 month data retention
- Shared CPU

## 🚀 Going to Production

### **Upgrade Considerations:**
- **Paid Plans**: $7/month for web services (no sleeping)
- **Database**: $7/month for dedicated database
- **Custom Domains**: Free with paid plans
- **SSL Certificates**: Automatic and free

## 🔧 Troubleshooting

### **Common Issues:**

1. **"nest: not found" Build Error**
   - **Problem**: NestJS CLI not available globally in Render
   - **Solution**: Use `npm run build:render` instead of `npm run build`
   - **Fix**: Update build command in Render dashboard to: `npm run build:render`

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify build commands
   - Check for missing dependencies
   - Try the alternative build script: `npm run build:render`

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check if database service is running
   - Ensure backend and database are in same region

3. **CORS Errors**
   - Update `CORS_ORIGIN` with correct frontend URL
   - Redeploy backend after CORS changes

4. **Service Sleeping (Free Tier)**
   - First request after 15 minutes takes longer
   - Consider upgrading to paid plan for production

### **Getting Help:**
- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Support**: Available with paid plans

## 🎉 Success!

Your Zinat Al-Haya School Management System is now deployed on Render! 

**Your URLs:**
- **Frontend**: `https://school-management-frontend.onrender.com`
- **Backend API**: `https://school-management-backend.onrender.com/api`
- **Health Check**: `https://school-management-backend.onrender.com/api/health`

Remember to bookmark these URLs and share them with your team! 🌟
