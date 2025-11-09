# 🚀 Railway Manual Deployment Guide

## Current Status
You have successfully deployed your backend service! Now let's deploy the frontend.

## 🎨 Step 1: Create Frontend Service

Since the Railway CLI doesn't support creating services directly, we'll use the web dashboard:

### **Via Railway Dashboard:**
1. **Go to your Railway project dashboard**
   - Visit [railway.app](https://railway.app)
   - Navigate to your project: `efficient-dedication`

2. **Create new service**
   - Click **"New Service"** button
   - Select **"GitHub Repo"**
   - Choose your repository: `zinat-al-haya-kindergarten`

3. **Configure the service**
   - **Service Name**: `frontend` (or any name you prefer)
   - **Root Directory**: `school-management-unified`
   - **Branch**: `main`
   - Railway will auto-detect it as a Node.js application

4. **Deploy**
   - Click **"Deploy"**
   - Railway will automatically build and deploy your frontend

## 🔧 Step 2: Set Frontend Environment Variables

After the frontend service is created:

### **Via Railway Dashboard:**
1. Go to your frontend service
2. Click on **"Variables"** tab
3. Add these environment variables:

```
VITE_API_BASE_URL = https://your-backend-service-url.railway.app/api
VITE_APP_NAME = Zinat Al-Haya School Management
VITE_APP_VERSION = 1.0.0
VITE_NODE_ENV = production
VITE_DEFAULT_LOCALE = ar
```

### **Via CLI (Alternative):**
```bash
# Navigate to frontend directory
cd school-management-unified

# Link to your frontend service
railway link

# Set environment variables
railway variables --set VITE_API_BASE_URL=https://your-backend-url.railway.app/api
railway variables --set VITE_APP_NAME="Zinat Al-Haya School Management"
railway variables --set VITE_APP_VERSION="1.0.0"
railway variables --set VITE_NODE_ENV=production
railway variables --set VITE_DEFAULT_LOCALE=ar

# Redeploy with new variables
railway up --detach
```

## 🔗 Step 3: Update Backend CORS

Once your frontend is deployed, update the backend CORS settings:

1. **Get your frontend URL** from Railway dashboard
2. **Update backend environment variables:**

```bash
# Go to backend directory
cd ../school-management-backend

# Update CORS origin
railway variables --set CORS_ORIGIN=https://your-frontend-url.railway.app

# Redeploy backend
railway up --detach
```

## ✅ Step 4: Verify Deployment

### **Check Services:**
1. **Backend**: `https://your-backend-url.railway.app/api/health`
2. **Frontend**: `https://your-frontend-url.railway.app`

### **Test Connection:**
1. Open your frontend URL
2. Try to login or access any API functionality
3. Check browser console for any CORS or connection errors

## 🎉 Success!

Your complete school management system should now be running on Railway with:
- ✅ **Backend API**: Dockerized NestJS application
- ✅ **Frontend**: Dockerized Vue.js application with Nginx
- ✅ **Database**: Railway PostgreSQL
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **Custom domains**: Available if needed

## 💡 Next Steps

1. **Test all functionality** thoroughly
2. **Set up custom domains** (optional)
3. **Monitor logs** via Railway dashboard
4. **Set up backups** for your database
5. **Configure alerts** for service health

## 🆘 Troubleshooting

### **Common Issues:**
- **CORS errors**: Check CORS_ORIGIN in backend matches frontend URL
- **API connection issues**: Verify VITE_API_BASE_URL points to backend
- **Build failures**: Check logs in Railway dashboard
- **Environment variables**: Ensure all required variables are set

### **Useful Commands:**
```bash
# View logs
railway logs

# Check service status  
railway status

# View environment variables
railway variables

# Redeploy service
railway up --detach
```

Your school management system is now live on Railway! 🎓✨
