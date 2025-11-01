# روضة زينة الحياة - Zinat Al-Haya Kindergarten Management System

## 🌸 New Slogan
**English**: "Nurturing young minds, growing bright futures"  
**Arabic**: "نرعى العقول الصغيرة، ننمي المستقبل المشرق"

This inspiring slogan reflects the kindergarten's mission to nurture and develop young children's minds while building a foundation for their bright futures.

## 🎨 Updated Design
The system now features a beautiful teal/sage green color palette that perfectly matches the kindergarten's branding:
- **Primary Green**: #5D8A7A (main brand color)
- **Primary Dark**: #4A6B5D (contrast and hover states)
- **Primary Light**: #7BA394 (backgrounds and highlights)
- **Primary Pale**: #E8F2EF (subtle backgrounds)

## 📁 Project Structure

### Frontend (Vue.js 3)
```
school-management-unified/
├── src/
│   ├── components/          # Reusable Vue components
│   ├── views/              # Page components
│   ├── services/           # API service layer
│   ├── i18n/               # Internationalization
│   │   └── locales/
│   │       ├── ar.json     # Arabic translations (updated slogan)
│   │       └── en.json     # English translations (updated slogan)
│   ├── layouts/            # Layout components
│   ├── router/             # Vue Router configuration
│   └── assets/             # Static assets and styles
├── tailwind.config.js      # Updated with kindergarten colors
└── package.json
```

### Backend (NestJS)
```
school-management-backend/
├── src/
│   ├── entities/           # Database entities
│   ├── controllers/        # API controllers
│   ├── services/           # Business logic services
│   ├── auth/               # Authentication system
│   └── dto/                # Data transfer objects
├── package.json
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Frontend Setup
```bash
cd school-management-unified
npm install
npm run dev
```
The frontend will be available at `http://localhost:5174`

### Backend Setup
```bash
cd school-management-backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```
The backend API will be available at `http://localhost:3000`

## 🌟 Key Features

### ✅ Bilingual Interface
- Complete Arabic/English support with RTL layout
- Updated inspiring slogan in both languages
- Cultural adaptation for Arabic-speaking users

### ✅ Student Management
- Multi-step registration with photo upload
- Parent integration and search
- Group-based organization
- Progress tracking with horizontal milestone display

### ✅ Course Management
- Hierarchical course → phase → milestone structure
- Flexible configuration and objectives
- Bilingual content support

### ✅ Beautiful Design
- Kindergarten-appropriate teal/green color scheme
- Professional yet child-friendly interface
- Mobile-responsive design
- Calming, nature-inspired aesthetics

### ✅ Complete Backend
- NestJS framework with TypeScript
- PostgreSQL database with TypeORM
- JWT authentication and role-based access
- File upload support
- Comprehensive API endpoints

## 🎨 Color Palette
The new kindergarten color scheme includes:
- **Kindergarten Green**: Perfect for early childhood education
- **Teal Accents**: Complementary colors for highlights
- **Natural Tones**: Creating a calming, nurturing environment

## 📱 Mobile Ready
- Touch-friendly interface elements
- Responsive design for all screen sizes
- Capacitor integration ready for native apps

## 🔧 Technical Stack

### Frontend
- **Vue.js 3** with Composition API
- **Tailwind CSS** with custom kindergarten colors
- **Vue I18n** for internationalization
- **Vue Router** for navigation
- **Axios** for API communication

### Backend
- **NestJS** framework
- **TypeORM** with PostgreSQL
- **JWT** authentication
- **Passport** for security
- **Multer** for file uploads

## 📖 Documentation
- `SYSTEM_SUMMARY.md` - Complete technical overview
- `color-palette.md` - Detailed color specifications
- Inline code documentation throughout

## 🌱 Mission Statement
"نرعى العقول الصغيرة، ننمي المستقبل المشرق"
"Nurturing young minds, growing bright futures"

This system embodies the kindergarten's commitment to providing a nurturing environment where young children can grow, learn, and develop into bright, confident individuals ready for their educational journey.

## 📞 Support
The system is built with modern, maintainable technologies and follows best practices for scalability, security, and user experience.

---
**روضة زينة الحياة** - Where every child's potential blooms! 🌸

