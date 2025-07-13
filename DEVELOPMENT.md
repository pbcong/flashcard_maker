# 🔧 Development Guide

This guide helps developers get started with the Flashcard Maker project after the cleanup and reorganization.

## 📋 Prerequisites Checklist

Before starting development, ensure you have:

- [ ] **Python 3.8+** installed
- [ ] **Node.js 16+** installed
- [ ] **OpenAI API Key** ([Get here](https://platform.openai.com/api-keys))
- [ ] **Supabase Account** ([Sign up here](https://supabase.com/))
- [ ] **Git** installed

## 🚀 First-Time Setup

### 1. Environment Setup

```bash
# Clone and enter the project
git clone <your-repo-url>
cd flashcard_maker

# Backend setup
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env  # Then edit .env with your keys

# Frontend setup
cd ../frontend
npm install

# Create frontend environment file
cp .env.example .env.local  # Then edit with your values
```

### 2. Environment Variables

**Backend `.env`:**
```env
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SECRET_KEY=your-jwt-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend `.env.local`:**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🏃‍♂️ Running the Application

### Option 1: Manual Start

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 2: Using Development Scripts

```bash
# Backend (from backend directory)
python dev_server.py

# Frontend (from frontend directory)
npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest -v                # Verbose output
pytest tests/test_main.py # Run specific test file
```

### Frontend Tests
```bash
cd frontend
npm test                  # Run tests
npm run test:coverage     # Run with coverage
```

## 📁 Project Organization

### Adding New Features

**Backend:**
1. Add models to `app/models.py`
2. Create business logic in `app/services.py`
3. Add routes in appropriate `app/routers/` file
4. Write tests in `tests/`

**Frontend:**
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update API calls in `src/api.js`
4. Add routing in `src/App.jsx`

### Code Style Guidelines

**Backend:**
- Use type hints for all functions
- Follow PEP 8 style guide
- Use docstrings for functions and classes
- Keep routes thin, business logic in services

**Frontend:**
- Use functional components with hooks
- Follow React naming conventions
- Use Tailwind CSS for styling
- Keep components focused and reusable

## 🛠️ Common Development Tasks

### Adding a New API Endpoint

1. **Define the model** in `app/models.py`:
```python
class NewFeatureRequest(BaseModel):
    name: str
    description: Optional[str] = None
```

2. **Add business logic** in `app/services.py`:
```python
async def process_new_feature(data: NewFeatureRequest) -> dict:
    # Your logic here
    return {"result": "success"}
```

3. **Create the route** in appropriate router:
```python
@router.post("/new-feature")
async def create_new_feature(
    data: NewFeatureRequest,
    current_user: User = Depends(get_current_user)
):
    result = await process_new_feature(data)
    return result
```

4. **Add tests** in `tests/`:
```python
def test_new_feature():
    # Your test here
    pass
```

### Adding a New React Component

1. **Create component** in `src/components/`:
```jsx
// NewComponent.jsx
import React from 'react';

const NewComponent = ({ prop1, prop2 }) => {
  return (
    <div className="p-4">
      {/* Component JSX */}
    </div>
  );
};

export default NewComponent;
```

2. **Add to main app** if needed:
```jsx
// App.jsx
import NewComponent from './components/NewComponent';
```

## 🐛 Debugging Tips

### Backend Issues

1. **Check logs**: Uvicorn shows detailed error messages
2. **Use debugger**: Add `import pdb; pdb.set_trace()` for breakpoints
3. **API docs**: Visit `/docs` for interactive API testing
4. **Environment**: Verify `.env` file has correct values

### Frontend Issues

1. **Browser console**: Check for JavaScript errors
2. **Network tab**: Verify API calls are being made correctly
3. **React DevTools**: Install browser extension for component debugging
4. **Hot reload**: Changes should reflect immediately

## 🔄 Database Operations

### Supabase Schema

Make sure your Supabase database has these tables:

```sql
-- Users table (handled by Supabase Auth)
-- Flashcard sets
CREATE TABLE flashcard_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Flashcards
CREATE TABLE flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    set_id UUID REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 Deployment

### Backend Deployment (Render)

1. Connect your GitHub repo to Render
2. Use the provided `render.yaml` configuration
3. Add environment variables in Render dashboard

### Frontend Deployment (Vercel)

1. Connect repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

## 🤝 Contributing Workflow

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Make changes**: Follow the code style guidelines
3. **Test your changes**: Run both backend and frontend tests
4. **Commit**: Use descriptive commit messages
5. **Push and PR**: Create a pull request with description

## 📝 Notes

- **Clean structure**: All duplicate files have been removed
- **Organized imports**: Dependencies are grouped logically
- **Documentation**: Each major component is documented
- **Testing**: Test structure is ready for expansion
- **Scalability**: Structure supports growing feature set

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Review the main README.md
3. Check existing GitHub issues
4. Create a new issue with detailed description

---

**Happy coding! 🚀**
