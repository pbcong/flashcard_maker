# Flashcard Maker Backend

A modern FastAPI backend for the Flashcard Maker application that processes images, transcribes text using OpenAI's GPT-4 Vision, and generates Chinese language learning flashcards.

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app with route includes
│   ├── config.py            # Application configuration
│   ├── models.py            # Pydantic models
│   ├── auth.py              # Authentication utilities
│   ├── database.py          # Database service layer
│   ├── services.py          # Business logic services
│   ├── prompts.py           # AI prompts for OpenAI
│   └── routers/             # Route modules
│       ├── __init__.py
│       ├── auth.py          # Authentication routes
│       ├── upload.py        # Image upload routes
│       └── flashcards.py    # Flashcard CRUD routes
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (create this)
├── README.md               # This file
└── render.yaml             # Deployment configuration
```

## 🚀 Features

- **Image Processing**: Upload and process images containing Chinese text
- **AI-Powered Transcription**: Uses OpenAI GPT-4 Vision for text recognition
- **Flashcard Generation**: Automatically creates Chinese learning flashcards
- **User Authentication**: Secure user registration and login with Supabase
- **CRUD Operations**: Full flashcard set management
- **Modern Architecture**: Clean separation of concerns with routers and services

## 🛠️ Setup

### Prerequisites

- Python 3.8+
- OpenAI API key
- Supabase account and project

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file:**
   Create a `.env` file in the backend root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
   ```

## 🏃‍♂️ Running the Application

### Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📊 API Endpoints

### Authentication
- `POST /auth/token` - Login and get access token
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user info

### Upload & Processing
- `POST /upload/` - Upload images and generate flashcards

### Flashcard Management
- `GET /flashcard-sets/` - Get all user's flashcard sets
- `POST /flashcard-sets/` - Create new flashcard set
- `GET /flashcard-sets/{id}` - Get specific flashcard set
- `PATCH /flashcard-sets/{id}` - Update flashcard set
- `DELETE /flashcard-sets/{id}` - Delete flashcard set

## 🧪 Testing

Run tests with pytest:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## 🏗️ Architecture Principles

The backend follows clean architecture principles:

1. **Separation of Concerns**: Each module has a single responsibility
2. **Dependency Injection**: FastAPI's dependency system for loose coupling
3. **Service Layer**: Business logic separated from API routes
4. **Configuration Management**: Centralized configuration with Pydantic settings
5. **Type Safety**: Full type hints throughout the codebase
6. **Error Handling**: Consistent error responses and logging

## 📁 Module Responsibilities

- **`main.py`**: FastAPI app setup and route registration
- **`config.py`**: Application configuration and environment variables
- **`models.py`**: Pydantic models for request/response validation
- **`auth.py`**: Authentication middleware and utilities
- **`database.py`**: Database operations and Supabase client
- **`services.py`**: Business logic for image processing and AI integration
- **`routers/`**: Route handlers organized by feature
- **`prompts.py`**: AI prompts for OpenAI models

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 Vision | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No |

## 🚀 Deployment

The application includes a `render.yaml` file for easy deployment to Render.com. You can also deploy to:

- **Heroku**: Add a `Procfile` with `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Railway**: Direct deployment with automatic detection
- **AWS/GCP/Azure**: Using container deployment

## 🔍 Monitoring & Logging

The application includes:
- Console logging for development
- Error tracking and debugging information
- FastAPI automatic API documentation
- Health check endpoint at `/`

## 🤝 Contributing

1. Follow the existing code structure
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation as needed
5. Use consistent naming conventions
