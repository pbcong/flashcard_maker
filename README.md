# 🎓 Flashcard Maker

A modern web application that transforms images containing text into interactive flashcards using AI. Perfect for language learning, especially Chinese characters and text recognition.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0+-green.svg)
![React](https://img.shields.io/badge/react-18.3+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- 📸 **Image Upload**: Upload multiple images containing text
- 🤖 **AI-Powered Text Recognition**: Uses OpenAI GPT-4 Vision for accurate text transcription
- 🃏 **Smart Flashcard Generation**: Automatically creates learning flashcards from extracted text
- 👤 **User Authentication**: Secure registration and login with Supabase
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- 🔄 **Real-time Updates**: Live progress tracking and interactive study modes

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** for backend
- **Node.js 16+** for frontend
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Supabase Account** ([Sign up here](https://supabase.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd flashcard_maker
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables:**
   
   Create `.env` in the backend folder:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SECRET_KEY=your_secret_key_for_jwt
   ```

   Create `.env.local` in the frontend folder:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   Backend will be available at `http://localhost:8000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
flashcard_maker/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API routes
│   │   ├── main.py         # FastAPI app
│   │   ├── models.py       # Pydantic models
│   │   ├── services.py     # Business logic
│   │   └── ...
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   └── package.json
└── PROJECT_STRUCTURE.md    # Detailed structure guide
```

## 🔧 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /upload` - Upload images and generate flashcards
- `GET /flashcard-sets` - Get user's flashcard sets
- `POST /flashcard-sets` - Create a new flashcard set
- `GET /flashcard-sets/{id}` - Get specific flashcard set
- `PATCH /flashcard-sets/{id}` - Update flashcard set
- `DELETE /flashcard-sets/{id}` - Delete flashcard set

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend (Render.com)
The project includes a `render.yaml` configuration for easy deployment to Render.com.

### Frontend (Vercel/Netlify)
The frontend can be deployed to Vercel, Netlify, or any static hosting service.

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **OpenAI GPT-4 Vision** - AI-powered image text recognition
- **Supabase** - Database and authentication
- **Python 3.8+** - Programming language
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - User interface library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [Issues](issues) page
2. Search for existing solutions
3. Create a new issue if needed

## 🙏 Acknowledgments

- OpenAI for the powerful GPT-4 Vision API
- Supabase for the excellent database and auth services
- The React and FastAPI communities for amazing documentation and tools

---

**Happy Learning! 🎓✨**
