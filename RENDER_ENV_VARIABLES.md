# ⚙️ RENDER ENVIRONMENT VARIABLES - QUICK SETUP

## 🔑 **COPY THESE TO RENDER ENVIRONMENT TAB**

### **🗄️ DATABASE (REQUIRED)**
```
DATABASE_URL = postgresql://username:password@host:port/database
```
*(Get this from your Render PostgreSQL database - use Internal URL)*

### **🔐 SECURITY (REQUIRED)**
```
NODE_ENV = production
JWT_SECRET = your_super_secure_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN = 24h
JWT_REFRESH_SECRET = your_super_secure_refresh_secret_minimum_32_characters_long
JWT_REFRESH_EXPIRES_IN = 7d
BCRYPT_SALT_ROUNDS = 12
```

### **🌐 APPLICATION (REQUIRED)**
```
PORT = 10000
APP_NAME = Zinat Al-Haya School Management
APP_VERSION = 1.0.0
LOG_LEVEL = info
```

### **🔗 CORS (UPDATE WITH YOUR FRONTEND URL)**
```
CORS_ORIGIN = https://your-frontend-app.onrender.com
CORS_CREDENTIALS = true
```

### **📁 FILE UPLOAD (OPTIONAL)**
```
UPLOAD_DEST = ./uploads
MAX_FILE_SIZE = 5242880
ALLOWED_FILE_TYPES = jpg,jpeg,png,gif,pdf,doc,docx
```

---

## 🚨 **IMPORTANT NOTES**

### **🔑 Generate Secure Secrets:**
For JWT secrets, use strong random strings (32+ characters). You can generate them:
- Online: [randomkeygen.com](https://randomkeygen.com)
- Command line: `openssl rand -base64 32`

### **🗄️ Database URL Format:**
```
postgresql://username:password@host:port/database
```
Example:
```
postgresql://school_admin:abc123@dpg-ck123-a:5432/school_management
```

### **🌐 CORS Origin:**
- For development: `http://localhost:3000,http://localhost:5173`
- For production: `https://your-frontend-domain.com`
- Multiple origins: separate with commas

---

## ✅ **QUICK CHECKLIST**

- [ ] Created PostgreSQL database on Render
- [ ] Copied Internal Database URL
- [ ] Set DATABASE_URL environment variable
- [ ] Set all required environment variables
- [ ] Generated secure JWT secrets
- [ ] Updated CORS_ORIGIN with your frontend URL
- [ ] Saved changes in Render
- [ ] Checked deployment logs for success

---

## 🎯 **EXPECTED SUCCESS LOG**

After setting environment variables, you should see:
```
✅ Database connection initialized
✅ Running migrations...
✅ All migrations completed successfully!
✅ Application started on port 10000
🌐 Service is live at https://your-app.onrender.com
```

---

## 🔧 **IF DATABASE CONNECTION FAILS**

1. **Check DATABASE_URL** is correctly formatted
2. **Verify database is running** (green status in Render)
3. **Use Internal Database URL** (not External)
4. **Check for typos** in username/password
5. **Ensure database and web service** are in same region

Your school management system will be live once the database is connected! 🚀
