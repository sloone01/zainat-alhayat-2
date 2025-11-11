# 🚀 Railway Docker Deployment Checklist

## ✅ Pre-Deployment (Done Locally)

- [ ] Docker Hub account created
- [ ] Logged in to Docker Hub: `docker login`
- [ ] Built and pushed images: `./build-and-push.sh YOUR_USERNAME`
- [ ] Confirmed images are on Docker Hub

## 🗄️ Step 1: Create Railway Project & Database

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click **"New Project"**
   - Select **"Empty Project"**

2. **Add PostgreSQL Database**
   - Click **"New Service"**
   - Select **"Database"** → **"PostgreSQL"**
   - Wait for deployment to complete
   - Note: Database URL will be available as `${{Postgres.DATABASE_URL}}`

## 🔧 Step 2: Deploy Backend Service

1. **Create Backend Service**
   - Click **"New Service"**
   - Select **"Docker Image"**
   - Enter: `YOUR_DOCKERHUB_USERNAME/zinat-backend:latest`
   - Service name: `backend`

2. **Set Backend Environment Variables**
   Go to backend service → **Variables** tab, add these:

   ```
   NODE_ENV=production
   JWT_SECRET=generate-32-char-secret-here-use-strong-password
   JWT_REFRESH_SECRET=generate-32-char-refresh-secret-here-different
   SESSION_SECRET=generate-32-char-session-secret-here-unique
   BCRYPT_SALT_ROUNDS=12
   LOG_LEVEL=info
   APP_NAME=Zinat Al-Haya School Management
   ENABLE_SWAGGER=false
   ENABLE_METRICS=true
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=3002
   ```

3. **Deploy Backend**
   - Click **"Deploy"**
   - Wait for deployment to complete
   - **IMPORTANT**: Copy the backend URL (e.g., `https://backend-production-xxxx.railway.app`)

## 🎨 Step 3: Deploy Frontend Service

1. **Create Frontend Service**
   - Click **"New Service"**
   - Select **"Docker Image"**
   - Enter: `YOUR_DOCKERHUB_USERNAME/zinat-frontend:latest`
   - Service name: `frontend`

2. **Set Frontend Environment Variables**
   Go to frontend service → **Variables** tab, add these (replace backend URL):

   ```
   VITE_API_BASE_URL=https://your-backend-url-from-step-2.railway.app/api
   VITE_APP_NAME=Zinat Al-Haya School Management
   VITE_APP_VERSION=1.0.0
   VITE_NODE_ENV=production
   VITE_DEFAULT_LOCALE=ar
   ```

3. **Deploy Frontend**
   - Click **"Deploy"**
   - Wait for deployment to complete
   - **IMPORTANT**: Copy the frontend URL (e.g., `https://frontend-production-xxxx.railway.app`)

## 🔗 Step 4: Update Backend CORS

1. **Go to Backend Service**
   - Navigate to backend service → **Variables** tab

2. **Add CORS Variable**
   ```
   CORS_ORIGIN=https://your-frontend-url-from-step-3.railway.app
   ```

3. **Redeploy Backend**
   - Click **"Deploy"** or **"Redeploy"**
   - Wait for deployment to complete

## ✅ Step 5: Test Deployment

### **Backend Tests:**
- [ ] Visit: `https://your-backend-url.railway.app/api/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`
- [ ] Check Railway logs for any errors

### **Frontend Tests:**
- [ ] Visit: `https://your-frontend-url.railway.app`
- [ ] Page should load without errors
- [ ] Check browser console for errors
- [ ] Try to access login page

### **Integration Tests:**
- [ ] Try to login from frontend
- [ ] Check if API calls work
- [ ] Verify no CORS errors in browser console

## 🆘 Troubleshooting

### **Backend Issues:**
- **Health check fails**: Check environment variables, especially DATABASE_URL
- **Database connection errors**: Verify DATABASE_URL format
- **JWT errors**: Ensure JWT secrets are at least 32 characters

### **Frontend Issues:**
- **Blank page**: Check VITE_API_BASE_URL points to correct backend
- **API errors**: Verify CORS_ORIGIN in backend matches frontend URL
- **Build errors**: Check Docker Hub image was pushed successfully

### **Common Solutions:**
```bash
# Check if images exist on Docker Hub
docker pull YOUR_USERNAME/zinat-backend:latest
docker pull YOUR_USERNAME/zinat-frontend:latest

# Generate secure secrets (32+ characters)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

## 🎉 Success Indicators

- [ ] Backend health endpoint returns OK
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] No CORS errors in browser console
- [ ] Database connections successful
- [ ] All Railway services show "Healthy" status

## 📋 Final URLs

After successful deployment, you'll have:

- **Backend API**: `https://your-backend-service.railway.app`
- **Frontend App**: `https://your-frontend-service.railway.app`
- **Database**: Internal Railway PostgreSQL
- **Admin Panel**: Access via frontend URL

## 💰 Cost Estimate

- **Backend Service**: ~$5/month
- **Frontend Service**: ~$5/month
- **PostgreSQL Database**: ~$5/month
- **Total**: ~$15/month

Your school management system is now live on Railway! 🎓✨
