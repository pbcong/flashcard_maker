from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
import datetime

from app.db.database import supabase
from app.models.models import User
from app.api.routers.auth import get_current_user

router = APIRouter()

class ReviewResponse(BaseModel):
    flashcard_id: int
    response_quality: str # "Again", "Hard", "Good", "Easy"

class FlashcardForReview(BaseModel):
    id: int
    front: str
    back: str
    set_id: int

@router.get("/reviews/due/{set_id}", response_model=List[FlashcardForReview])
async def get_due_review_cards(set_id: int, user: User = Depends(get_current_user)):
    """
    Fetches flashcards that are due for review for a specific set.
    It also includes cards that have never been reviewed.
    """
    today = datetime.date.today().isoformat()
    
    # First, get all flashcard IDs for the given set
    cards_in_set_result = supabase.table("flashcards").select("id").eq("set_id", set_id).execute()
    if not cards_in_set_result.data:
        return []
    card_ids = [card['id'] for card in cards_in_set_result.data]

    # Then, get the progress for those cards for the current user
    progress_result = supabase.table("user_flashcard_progress").select("flashcard_id, next_review_date").in_("flashcard_id", card_ids).eq("user_id", user.id).execute()
    
    progress_map = {item['flashcard_id']: item['next_review_date'] for item in progress_result.data}
    
    due_card_ids = []
    for card_id in card_ids:
        if card_id not in progress_map or progress_map[card_id] <= today:
            due_card_ids.append(card_id)

    if not due_card_ids:
        return []

    # Finally, fetch the full flashcard data for the due cards
    result = supabase.table("flashcards").select("id, front, back, set_id").in_("id", due_card_ids).execute()
    
    return result.data

@router.post("/reviews")
async def submit_review(review: ReviewResponse, user: User = Depends(get_current_user)):
    """
    Submits a review for a flashcard and updates its SRS progress.
    """
    # Map descriptive response to quality score (0-5 for SM-2)
    quality_map = {
        "Again": 1, # Quality < 3 resets progress
        "Hard": 3,
        "Good": 4,
        "Easy": 5
    }
    quality = quality_map.get(review.response_quality)

    if quality is None:
        raise HTTPException(status_code=400, detail="Invalid response quality.")

    # Get current progress for the card
    progress_result = supabase.table("user_flashcard_progress").select("id, easiness_factor, repetitions, interval").eq("user_id", user.id).eq("flashcard_id", review.flashcard_id).execute()
    
    progress = progress_result.data[0] if progress_result.data else None

    if progress is None:
        # First review for this card
        easiness_factor = 2.5
        repetitions = 0
        interval = 0
    else:
        easiness_factor = progress['easiness_factor']
        repetitions = progress['repetitions']
        interval = progress['interval']

    # SM-2 Algorithm Logic
    if quality < 3:
        repetitions = 0
        interval = 1
    else:
        repetitions += 1
        if repetitions == 1:
            interval = 1
        elif repetitions == 2:
            interval = 6
        else:
            interval = round(interval * easiness_factor)
        
        # Update easiness factor
        easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if easiness_factor < 1.3:
            easiness_factor = 1.3

    next_review_date = datetime.date.today() + datetime.timedelta(days=interval)

    # Update or Insert progress in DB
    if progress is None:
        supabase.table("user_flashcard_progress").insert({
            "user_id": user.id,
            "flashcard_id": review.flashcard_id,
            "easiness_factor": easiness_factor,
            "repetitions": repetitions,
            "interval": interval,
            "next_review_date": next_review_date.isoformat(),
        }).execute()
    else:
        supabase.table("user_flashcard_progress").update({
            "easiness_factor": easiness_factor,
            "repetitions": repetitions,
            "interval": interval,
            "next_review_date": next_review_date.isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }).eq("id", progress['id']).execute()

    return {"message": "Review submitted successfully."}
