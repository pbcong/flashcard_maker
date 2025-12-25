import os
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routers import auth, flashcards, upload, reviews

app = FastAPI(title="Flashcard Maker API", version="1.0.0")

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://flashcard-maker-lyart.vercel.app,http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth.router)
api_router.include_router(upload.router)
api_router.include_router(flashcards.router)
api_router.include_router(reviews.router)



app.include_router(api_router)


@app.get("/")
async def read_root():
    return {"message": "Flashcard Maker API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}