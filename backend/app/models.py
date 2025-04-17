from pydantic import BaseModel
from typing import List

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardResponse(BaseModel):
    transcription: str
    flashcards: List[Flashcard] 