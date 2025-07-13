from fastapi import HTTPException, Header, status

from .database import supabase
from .models import User


async def get_current_user(authorization: str = Header(...)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication scheme"
        )
    
    token = authorization.split(" ")[1]
    try:
        res = supabase.auth.get_user(token)
        usr = res.user
        return User(id=usr.id, username=usr.user_metadata.get("username", ""))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )
