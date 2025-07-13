from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, flashcards, upload

app = FastAPI(title="Flashcard Maker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(flashcards.router)


@app.get("/")
async def read_root():
    return {"message": "Flashcard Maker API is running"}
