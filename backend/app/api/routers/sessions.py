from fastapi import APIRouter, Depends, HTTPException

from ...db import database
from ...models.models import User
from .auth import get_current_user

router = APIRouter(prefix="/study-session", tags=["Study Sessions"])


@router.patch("/{session_id}")
async def end_study_session(
    session_id: int,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        result = database.end_study_session(session_id, data, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
