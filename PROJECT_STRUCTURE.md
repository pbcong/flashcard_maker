# 📁 Project Structure

This document outlines the clean, organized structure of the Flashcard Maker application.

## 🏗️ Root Structure
```
flashcard_maker/
├── backend/                 # FastAPI backend application
├── frontend/               # React frontend application  
├── .env                    # Environment variables (not in git)
├── .gitignore             # Git ignore rules
├── PROJECT_STRUCTURE.md   # This file
└── README.md              # Main project documentation
```

## 🔧 Backend Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app entry point
│   ├── config.py           # Application configuration
│   ├── models.py           # Pydantic models
│   ├── auth.py             # Authentication utilities
│   ├── database.py         # Database service layer
│   ├── services.py         # Business logic services
│   ├── prompts.py          # AI prompts for OpenAI
│   └── routers/            # API route modules
│       ├── __init__.py
│       ├── auth.py         # Authentication routes
│       ├── upload.py       # Image upload routes
│       └── flashcards.py   # Flashcard CRUD routes
├── tests/                  # Test files
│   ├── conftest.py         # Pytest configuration
│   └── test_main.py        # Main test file
├── requirements.txt        # Python dependencies
├── requirements-dev.txt    # Development dependencies
├── render.yaml            # Deployment configuration
└── README.md              # Backend documentation
```

## ⚛️ Frontend Structure
```
frontend/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable React components
│   │   ├── CreateFlashcardSet.jsx
│   │   ├── EditFlashcardSet.jsx
│   │   ├── FlashcardSets.jsx
│   │   ├── FlashcardSetView.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   └── Register.jsx
│   ├── contexts/          # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/             # Top-level page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── ViewSet.jsx
│   ├── api.js             # API service functions
│   ├── supabaseClient.js  # Supabase configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Frontend documentation
```

## 📝 File Organization Principles

### Backend
- **`app/main.py`**: FastAPI application setup and middleware
- **`app/routers/`**: Separate route files by functionality (auth, upload, flashcards)
- **`app/services.py`**: Business logic separated from route handlers
- **`app/models.py`**: Pydantic models for request/response validation
- **`app/database.py`**: Database connection and service layer
- **`app/auth.py`**: Authentication and authorization utilities
- **`app/config.py`**: Environment variables and configuration management

### Frontend
- **`components/`**: Reusable UI components that can be used across pages
- **`pages/`**: Top-level route components that compose other components
- **`contexts/`**: React context providers for global state management
- **`api.js`**: Centralized API calls to backend
- **Single responsibility**: Each component has a clear, focused purpose

## 🧹 Cleanup Actions Performed

### Removed Files:
- ❌ `backend/README_OLD.md` - Duplicate documentation
- ❌ `backend/README_NEW.md` - Duplicate documentation  
- ❌ `backend/app/main_old.py` - Old version of main file
- ❌ `backend/images/` - Unnecessary image folder in backend
- ❌ `backend/run_dev.bat` - Old batch script
- ❌ `backend/run_dev.py` - Old Python script
- ❌ `backend/__init__.py` - Unnecessary in root
- ❌ `frontend/src/services/` - Duplicate API service folder
- ❌ `frontend/src/pages/CreateSet.jsx` - Duplicate component
- ❌ All `__pycache__/` folders - Python cache files
- ❌ All `.pytest_cache/` folders - Pytest cache files

### Improvements Made:
- ✅ Updated `.gitignore` with comprehensive rules
- ✅ Consolidated duplicate API services
- ✅ Fixed import paths after removing duplicates
- ✅ Removed cache and temporary files
- ✅ Streamlined project structure

## 🎯 Benefits of This Structure

1. **Clear Separation of Concerns**: Backend and frontend are clearly separated
2. **Modular Architecture**: Components and services are well-organized
3. **Easy Navigation**: Developers can quickly find relevant files
4. **Scalable**: Structure supports adding new features without confusion
5. **Maintainable**: Clean structure makes debugging and updates easier
6. **Standard Conventions**: Follows React and FastAPI best practices

## 🚀 Getting Started

After this cleanup, developers can:

1. **Backend**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Tests**: `cd backend && pytest`

The project is now organized for efficient development and easy maintenance!
