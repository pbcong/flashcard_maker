from typing import List

from fastapi import APIRouter, Depends, HTTPException

from ...db import database
from ...models.models import FlashcardSet, User
from .auth import get_current_user

router = APIRouter(prefix="/flashcard-sets", tags=["Flashcard Sets"])


@router.get("/", response_model=List[FlashcardSet])
async def get_flashcard_sets(current_user: User = Depends(get_current_user)):
    try:
        result = database.get_flashcard_sets(current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{set_id}", response_model=FlashcardSet)
async def get_flashcard_set(
    set_id: int,
    current_user: User = Depends(get_current_user)
):
    try:
        result = database.get_flashcard_set(set_id, current_user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{set_id}")
async def delete_flashcard_set(
    set_id: int,
    current_user: User = Depends(get_current_user)
):
    try:
        success = database.delete_flashcard_set(set_id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        return {"message": "Flashcard set deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{set_id}", response_model=FlashcardSet)
async def update_flashcard_set(
    set_id: int,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        result = database.update_flashcard_set(set_id, data, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=FlashcardSet)
async def create_flashcard_set(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        result = database.create_flashcard_set(data, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))