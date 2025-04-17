# Flashcard Maker Backend

This is the backend service for the Flashcard Maker application. It handles image uploads, text transcription, and flashcard generation using OpenAI's GPT-4 Vision and GPT-4 models.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Running the Server

To run the development server:

```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

- `GET /`: Health check endpoint
- `POST /upload`: Upload images for processing
  - Accepts multiple image files
  - Returns transcription and generated flashcards

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 