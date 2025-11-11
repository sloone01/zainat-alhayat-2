# 🍎 ARM Mac Railway Deployment Guide

## 🎯 ARM Mac Specific Issues & Solutions

### **The Problem**
ARM Macs (M1/M2/M3) build Docker images for ARM architecture, but Railway runs on x86 infrastructure. This causes:
- ❌ "exec format error" when containers start
- ❌ Backend crashes with architecture mismatch
- ❌ Native dependencies fail to load

### **The Solution**
I've updated your Dockerfiles to force x86 builds using `--platform=linux/amd64`.

## ✅ **What's Been Fixed**

### **1. Backend Dockerfile Updates:**
- `FROM --platform=linux/amd64 node:20-alpine` - Forces x86 base image
- Added build dependencies for cross-compilation
- `npm ci --platform=linux/amd64` - Forces x86 packages

### **2. Frontend Dockerfile Updates:**
- `FROM --platform=linux/amd64 node:20-alpine` - Forces x86 base image
- `FROM --platform=linux/amd64 nginx:alpine` - Forces x86 nginx
- Cross-platform build support

### **3. Build Scripts:**
- `docker-build-arm.sh` - ARM-aware build script
- Uses Docker buildx for multi-platform builds
- Automatic platform detection and handling

## 🚀 **Deployment Options for ARM Mac**

### **Option 1: Railway Dashboard (Recommended)**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "ARM-compatible Docker configuration"
   git push
   ```

2. **Deploy via Railway Dashboard:**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Railway will build using the updated Dockerfiles
   - The `--platform=linux/amd64` ensures x86 compatibility

### **Option 2: Local Build + Push to Docker Hub**

```bash
# Build ARM-compatible images
./docker-build-arm.sh

# Tag for Docker Hub (replace with your username)
docker tag zinat-school-backend:latest YOUR_USERNAME/zinat-backend:latest
docker tag zinat-school-frontend:latest YOUR_USERNAME/zinat-frontend:latest

# Push to Docker Hub
docker push YOUR_USERNAME/zinat-backend:latest
docker push YOUR_USERNAME/zinat-frontend:latest

# Deploy on Railway using these images
```

### **Option 3: Railway CLI with ARM Support**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add database
railway add -d postgres

# Deploy backend (Railway will use ARM-compatible Dockerfile)
cd school-management-backend
railway up

# Deploy frontend
cd ../school-management-unified
railway up
```

## 🧪 **Test ARM Compatibility Locally**

```bash
# Build and test ARM-compatible images
./docker-build-arm.sh

# Start production environment
./docker-start-prod.sh

# Test services
curl http://localhost:3002/api/health  # Backend
open http://localhost:3000             # Frontend
```

## 🔧 **Environment Variables for Railway**

### **Backend Variables:**
```
NODE_ENV=production
JWT_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-32-char-refresh-secret-here
SESSION_SECRET=your-32-char-session-secret-here
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info
APP_NAME=Zinat Al-Haya School Management
ENABLE_SWAGGER=false
ENABLE_METRICS=true
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### **Frontend Variables:**
```
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_APP_NAME=Zinat Al-Haya School Management
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_DEFAULT_LOCALE=ar
```

## 🆘 **ARM-Specific Troubleshooting**

### **Issue: "exec format error"**
**Solution:** Dockerfiles now use `--platform=linux/amd64`

### **Issue: Native dependencies fail**
**Solution:** Added build tools (python3, make, g++) for cross-compilation

### **Issue: npm packages wrong architecture**
**Solution:** Using `--platform=linux/amd64` flag in npm ci

### **Issue: Docker buildx not available**
**Solution:** Script falls back to regular docker build

## 🎉 **Ready to Deploy!**

Your project is now ARM Mac compatible! The key changes:

1. ✅ **Cross-platform Dockerfiles** - Build x86 images on ARM Mac
2. ✅ **Build dependencies** - Handle native module compilation
3. ✅ **Platform-specific scripts** - ARM-aware build process
4. ✅ **Railway compatibility** - Images work on Railway's x86 infrastructure

## 🚀 **Next Steps:**

1. **Test locally:** `./docker-build-arm.sh`
2. **Deploy to Railway:** Use dashboard or CLI
3. **Monitor deployment:** Check Railway logs for success
4. **Test live app:** Verify all functionality works

Your ARM Mac will now build Docker images that work perfectly on Railway! 🎓✨
