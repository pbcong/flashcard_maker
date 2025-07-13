from fastapi import APIRouter, Depends, HTTPException

from ...db import database
from ...models.models import CardReview, User
from .auth import get_current_user

router = APIRouter(prefix="/card-review", tags=["Card Reviews"])


@router.post("/", response_model=CardReview)
async def record_card_review(
    review: CardReview,
    current_user: User = Depends(get_current_user)
):
    try:
        # Set the user_id from the authenticated user
        review.user_id = current_user.id
        result = database.record_card_review(review)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
