# 🏫 Zinat Al-Haya Kindergarten Management System

A comprehensive school management system built with **NestJS** (backend) and **Vue.js** (frontend) for kindergarten administration.

## 🎯 **System Status: FULLY OPERATIONAL** ✅

### 🔐 **Admin Access Ready**
- **Email**: `Zahra@gmail.com`
- **Password**: `ZahraAdmin123`
- **Role**: Administrator (Full Access)

---

## 🚀 **Quick Start**

### **Option 1: Use Quick Start Script**
```bash
./quick-start.sh
```

### **Option 2: Manual Start**

#### **1. Start Backend**
```bash
cd school-management-backend
npm install
npm run start:dev
```
Backend will run on: `http://localhost:3002`

#### **2. Start Frontend** (Requires Node.js 20+)
```bash
cd school-management-unified
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

---

## 🧪 **Testing & Verification**

### **Test Authentication System**
```bash
node test-authentication.js
```

### **Test Complete System**
```bash
node test-complete-system.js
```

### **Generate System Report**
```bash
node system-status-report.js
```

### **Test Course Management**
```bash
node test-course-management.js
```

---

## 📊 **System Overview**

### **✅ Working Features**
- 🔐 **Authentication & Authorization** (JWT-based)
- 👥 **User Management** (Admin, Teachers, Parents)
- 👶 **Student Management**
- 👨‍👩‍👧‍👦 **Parent Management**
- 📚 **Course Management** (with Phases & Milestones)
- 👥 **Group Management**
- 📅 **Academic Year Management**
- 📊 **Statistics & Reports**
- ⚙️ **Settings Management**
- 🔒 **Role-based Access Control**

### **📈 Current Data**
- **Users**: 256 (2 Admins, 7 Teachers, 247 Parents)
- **Students**: 139
- **Courses**: 2 (including Arabic Language Development)
- **Groups**: 7
- **Academic Years**: 2

---

## 🏗️ **Architecture**

### **Backend** (`school-management-backend/`)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens
- **API**: RESTful endpoints at `/api/*`
- **Port**: 3002

### **Frontend** (`school-management-unified/`)
- **Framework**: Vue.js 3 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Port**: 5173 (development)

---

## 🔗 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh token

### **Management**
- `GET /api/users` - List users (Admin only)
- `GET /api/students` - List students
- `GET /api/courses` - List courses
- `GET /api/groups` - List groups
- `GET /api/academic-years` - List academic years

### **System**
- `GET /api/health` - Health check
- `GET /api/debug` - Debug information

---

## 🌐 **Internationalization**

The system supports both **Arabic** and **English**:
- Default language: Arabic (RTL)
- All UI elements translated
- Database supports Arabic content
- Admin interface in both languages

---

## 🔧 **Configuration**

### **Environment Variables**
- **Backend**: See `school-management-backend/.env`
- **Frontend**: See `school-management-unified/.env.local`

### **Database**
- **Type**: PostgreSQL
- **Connection**: Configured in backend environment
- **Migrations**: Auto-run on startup

---

## 📱 **Usage**

### **Admin Dashboard**
1. Login with admin credentials
2. Access all management features:
   - Student enrollment
   - Course creation
   - Teacher management
   - Parent communication
   - Progress tracking
   - System settings

### **Course Management**
- Create courses with phases and milestones
- Track student progress
- Generate reports
- Manage curriculum

---

## 🚀 **Deployment**

### **Development**
- Backend: `npm run start:dev`
- Frontend: `npm run dev`

### **Production**
- Backend: `npm run build && npm run start:prod`
- Frontend: `npm run build`

---

## 📞 **Support**

For technical support or questions:
1. Check the test scripts for system verification
2. Review the API documentation
3. Check system logs for errors

---

## 🎉 **Ready for Production!**

The system is fully functional and ready for:
- ✅ User management
- ✅ Student enrollment
- ✅ Course administration
- ✅ Progress tracking
- ✅ Reporting and analytics

**Happy teaching and learning!** 🎓
