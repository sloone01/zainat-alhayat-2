# 🔧 Railway Database Connection Fix

## 🚨 Current Issue
Your backend is showing: `Unable to connect to the database. Retrying (1)...`

This means the `DATABASE_URL` environment variable is not properly set or the database service isn't linked.

## ✅ Step-by-Step Fix

### **Step 1: Check Database Service**
1. **Go to Railway Dashboard** → Your Project
2. **Verify PostgreSQL service exists**
   - Look for a service named "Postgres", "PostgreSQL", or "Database"
   - Status should be "Healthy" (green)
   - If missing: Click **"New Service"** → **"Database"** → **"PostgreSQL"**

### **Step 2: Get the Correct Service Name**
1. **Note the exact name** of your database service (case-sensitive)
2. Common names: `Postgres`, `PostgreSQL`, `Database`

### **Step 3: Fix Backend Environment Variables**
1. **Go to Backend Service** → **Variables** tab
2. **Update DATABASE_URL** using the correct service name:

   ```bash
   # If your database service is named "Postgres":
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # If your database service is named "PostgreSQL":
   DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
   
   # If your database service is named "Database":
   DATABASE_URL=${{Database.DATABASE_URL}}
   ```

### **Step 4: Add Additional Database Variables**
Add these variables to your backend service (replace "Postgres" with your actual service name):

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}
```

### **Step 5: Redeploy Backend**
1. **Click "Deploy" or "Redeploy"** on your backend service
2. **Wait for deployment** to complete
3. **Check logs** for connection success

## 🔍 Debugging Steps

### **Check Database Service Variables**
1. **Go to PostgreSQL service** → **Variables** tab
2. **Verify these variables exist:**
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### **Manual Database URL (If Variables Don't Work)**
1. **Copy the DATABASE_URL** from PostgreSQL service
2. **Paste it directly** in backend service variables
3. **Format should be:** `postgresql://username:password@host:port/database`

### **Test Connection**
1. **Check backend logs** in Railway dashboard
2. **Look for:** `Database connected successfully` or similar
3. **Test health endpoint:** `https://your-backend-url.railway.app/api/health`

## 🚨 Common Issues & Solutions

### **Issue: "Service reference not found"**
**Solution:** Check database service name matches exactly (case-sensitive)

### **Issue: "Connection timeout"**
**Solution:** Database might still be starting up, wait 2-3 minutes

### **Issue: "Authentication failed"**
**Solution:** Use the exact DATABASE_URL from PostgreSQL service

### **Issue: "SSL connection error"**
**Solution:** Your code already handles SSL correctly for production

## 📋 Quick Checklist

- [ ] PostgreSQL service exists and is "Healthy"
- [ ] Database service name noted (case-sensitive)
- [ ] Backend DATABASE_URL uses correct service reference
- [ ] Backend service redeployed
- [ ] Logs show successful database connection
- [ ] Health endpoint returns OK

## 🎯 Expected Success

After fixing, you should see in backend logs:
```
[Nest] Database connected successfully
[Nest] Application is running on: http://[::]:3002
```

And health endpoint should return:
```json
{"status":"ok","timestamp":"2024-11-09T19:02:41.000Z"}
```

## 💡 Pro Tips

1. **Service names are case-sensitive** in Railway variable references
2. **Wait 2-3 minutes** after database creation before connecting
3. **Check both services are in the same project**
4. **Use Railway's built-in variable references** instead of manual URLs when possible

Your database connection should work after following these steps! 🎓✨
