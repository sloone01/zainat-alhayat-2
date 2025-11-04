# 🚀 Zinat Al-Haya School Management - Deployment Guide

## 📋 Environment Files Created

### ✅ Files Created:
- `school-management-unified/.env.production` - Frontend production environment
- `school-management-backend/.env.production` - Backend production environment

## 🔧 How to Use These Environment Files

### **Step 1: Generate Secure Keys**

Before deploying, generate secure JWT secrets:

```bash
# Generate JWT Secret (64 characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT Refresh Secret (64 characters) 
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret (32 characters)
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### **Step 2: Update Environment Variables**

#### **For Railway (Backend):**
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Add these variables one by one:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<your-generated-jwt-secret>
JWT_REFRESH_SECRET=<your-generated-refresh-secret>
SESSION_SECRET=<your-generated-session-secret>
CORS_ORIGIN=https://your-frontend-app.vercel.app
APP_NAME=Zinat Al-Haya School Management
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info
ENABLE_SWAGGER=false
```

**Note:** Railway automatically provides `DATABASE_URL` when you add PostgreSQL.

#### **For Vercel (Frontend):**
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add these variables:

```env
VITE_API_URL=https://your-backend-app.railway.app/api
VITE_APP_NAME=Zinat Al-Haya School Management
VITE_NODE_ENV=production
VITE_DEFAULT_LOCALE=ar
VITE_ENABLE_DEVTOOLS=false
```

### **Step 3: Update URLs After Deployment**

#### **After Railway Backend Deployment:**
1. Copy your Railway backend URL (e.g., `https://school-backend-production.railway.app`)
2. Update the frontend environment variable:
   - `VITE_API_URL=https://your-actual-railway-url.railway.app/api`

#### **After Vercel Frontend Deployment:**
1. Copy your Vercel frontend URL (e.g., `https://school-management.vercel.app`)
2. Update the backend environment variable:
   - `CORS_ORIGIN=https://your-actual-vercel-url.vercel.app`

## 🔒 Security Checklist

### ✅ Before Deployment:
- [ ] Generate unique JWT secrets (minimum 64 characters)
- [ ] Update all placeholder URLs with actual deployment URLs
- [ ] Set `NODE_ENV=production`
- [ ] Disable development features (`ENABLE_SWAGGER=false`)
- [ ] Use strong database passwords
- [ ] Enable HTTPS only in production

### ✅ After Deployment:
- [ ] Test all API endpoints
- [ ] Verify CORS configuration
- [ ] Check database connectivity
- [ ] Test authentication flow
- [ ] Verify file upload functionality
- [ ] Test both English and Arabic interfaces

## 🌐 Custom Domain Setup (Optional)

### **For Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `school.yourschool.com`)
3. Update DNS records as instructed
4. Update backend `CORS_ORIGIN` to include your custom domain

### **For Railway:**
1. Go to Service Settings → Networking
2. Add custom domain (e.g., `api.yourschool.com`)
3. Update DNS CNAME record
4. Update frontend `VITE_API_URL` to use your custom domain

## 📊 Monitoring Setup (Optional)

### **Add Error Tracking:**
1. Sign up for Sentry.io (free tier available)
2. Get your DSN
3. Add to environment variables:
   - Backend: `SENTRY_DSN=https://your-sentry-dsn`
   - Frontend: `VITE_SENTRY_DSN=https://your-sentry-dsn`

### **Add Analytics:**
1. Set up Google Analytics
2. Add tracking ID:
   - Frontend: `VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX`

## 🚨 Important Notes

### **Security:**
- **NEVER** commit `.env` files to version control
- Use your hosting platform's environment variable settings
- Regularly rotate JWT secrets
- Use strong, unique passwords for database

### **Performance:**
- Enable gzip compression on your hosting platform
- Use CDN for static assets
- Monitor database performance
- Set up database connection pooling

### **Backup:**
- Set up automated database backups
- Export important data regularly
- Test restore procedures

## 📞 Support

If you encounter issues during deployment:

1. **Check Logs:**
   - Railway: Go to your service → Deployments → View logs
   - Vercel: Go to your project → Functions → View logs

2. **Common Issues:**
   - CORS errors: Check `CORS_ORIGIN` configuration
   - Database connection: Verify `DATABASE_URL`
   - Build failures: Check Node.js version compatibility

3. **Get Help:**
   - Railway Docs: https://docs.railway.app
   - Vercel Docs: https://vercel.com/docs

## 🎯 Quick Deployment Commands

```bash
# 1. Commit your changes
git add .
git commit -m "Add production environment configuration"
git push origin main

# 2. Deploy will happen automatically via Git integration

# 3. Update environment variables on hosting platforms
# (Use the values from the generated secrets above)
```

Your Zinat Al-Haya School Management System is now ready for production deployment! 🌟
