from typing import List, Optional

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
