# 🌸 Zinat Al-Haya Development Guide

## 🚀 Quick Start

### Prerequisites
- ✅ Docker Desktop installed and running
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager

### 🎯 One-Command Setup
```bash
# Make scripts executable
chmod +x start-dev.sh stop-dev.sh

# Start everything
./start-dev.sh
```

## 📋 What Gets Started

### 🐘 PostgreSQL Database
- **Container**: `zinat_postgres`
- **Port**: `5432`
- **Database**: `school_management`
- **User**: `school_admin`
- **Password**: `school_password_2024`

### 🔧 pgAdmin (Database Management)
- **URL**: http://localhost:8080
- **Email**: admin@zinat.local
- **Password**: admin123

### 🚀 Backend API (NestJS)
- **URL**: http://localhost:3000/api
- **Hot Reload**: ✅ Enabled
- **Environment**: Development

### 🎨 Frontend App (Vue.js)
- **URL**: http://localhost:5173
- **Hot Reload**: ✅ Enabled
- **Languages**: Arabic/English

## 👥 Default Users

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| 👨‍💼 Admin | `admin` | `admin123` | System administrator |
| 👩‍🏫 Teacher | `teacher1` | `teacher123` | Kindergarten teacher |
| 👨‍👩‍👧‍👦 Parent | `parent1` | `parent123` | Student parent |

## 🛠️ Manual Commands

### Database Operations
```bash
cd school-management-backend

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate

# Seed database
npm run db:seed

# Drop all tables
npm run schema:drop
```

### Development Commands
```bash
# Backend only
cd school-management-backend
npm run start:dev

# Frontend only
cd school-management-unified
npm run dev

# Database only
docker-compose up postgres
```

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port Conflicts
- **Frontend (5173)**: Change in `vite.config.ts`
- **Backend (3000)**: Change in `.env` file
- **PostgreSQL (5432)**: Change in `docker-compose.yml`
- **pgAdmin (8080)**: Change in `docker-compose.yml`

### Reset Everything
```bash
# Stop all services
./stop-dev.sh

# Remove all Docker data
docker-compose down -v

# Start fresh
./start-dev.sh
```

## 📁 Project Structure

```
zinat-al-haya-kindergarten/
├── docker-compose.yml          # Docker services
├── start-dev.sh               # Start script
├── stop-dev.sh                # Stop script
├── database/
│   └── init/                  # Database initialization
├── school-management-backend/  # NestJS API
│   ├── src/
│   │   ├── entities/          # Database entities
│   │   ├── controllers/       # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── migrations/        # Database migrations
│   │   └── database/seeds/    # Initial data
│   └── .env                   # Environment variables
└── school-management-unified/  # Vue.js frontend
    ├── src/
    │   ├── views/             # Page components
    │   ├── components/        # Reusable components
    │   ├── services/          # API integration
    │   └── i18n/locales/      # Translations
    └── package.json
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=school_admin
DATABASE_PASSWORD=school_password_2024
DATABASE_NAME=school_management
JWT_SECRET=your_jwt_secret_here
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎨 Development Features

### ✅ Hot Reload
- Backend: Automatic restart on file changes
- Frontend: Instant browser updates
- Database: Persistent data across restarts

### ✅ Bilingual Support
- Arabic (RTL) and English (LTR)
- Dynamic language switching
- Culturally adapted interface

### ✅ Authentication
- JWT-based security
- Role-based access control
- Session management

### ✅ Database Management
- TypeORM migrations
- Automatic schema updates
- Data seeding scripts

## 📞 Support

If you encounter any issues:

1. **Check Docker**: Ensure Docker Desktop is running
2. **Check Ports**: Make sure ports 3000, 5173, 5432, 8080 are available
3. **Check Logs**: Use `docker-compose logs` to view error messages
4. **Reset Environment**: Use the reset commands above

---

**Happy Coding! 🌸 نرعى العقول الصغيرة، ننمي المستقبل المشرق**
