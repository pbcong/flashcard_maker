from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class User(BaseModel):
    id: str
    username: str


class Flashcard(BaseModel):
    id: Optional[int] = None
    front: str
    back: str
    set_id: Optional[int] = None


class FlashcardSet(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    owner_id: str
    flashcards: Optional[List[Flashcard]] = None


class FlashcardResponse(BaseModel):
    transcription: str
    flashcards: List[Flashcard]


class Register(BaseModel):
    email: str
    password: str
    username: str


class Message(BaseModel):
    message: str


# Progress tracking models
class StudySession(BaseModel):
    id: Optional[int] = None
    user_id: str
    set_id: int
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    cards_studied: int = 0
    correct_answers: int = 0
    total_time_seconds: int = 0


class CardReview(BaseModel):
    id: Optional[int] = None
    user_id: str
    card_id: int
    session_id: int
    was_correct: bool
    response_time_ms: int
    reviewed_at: Optional[datetime] = None


class StudyProgress(BaseModel):
    set_id: int
    total_cards: int
    cards_studied: int
    cards_known: int
    know_rate: float
    total_reviews: int
    last_studied_at: Optional[datetime] = None
    study_streak: int = 0
