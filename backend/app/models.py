from pydantic import BaseModel
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    username: str # Assuming username comes from user_metadata

class Flashcard(BaseModel):
    id: Optional[int] = None
    front: str
    back: str
    set_id: Optional[int] = None # Keep this if needed for individual card operations

class FlashcardSet(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    owner_id: str # Keep owner_id if needed on the model
    flashcards: Optional[List[Flashcard]] = None # Include flashcards for response

class FlashcardResponse(BaseModel):
    transcription: str
    flashcards: List[Flashcard] # Use the Flashcard model defined above

class Register(BaseModel):
    email: str
    password: str
    username: str