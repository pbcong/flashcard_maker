from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm

from ...db import database
from ...models.models import Message, Register, Token, User

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(authorization: str = Header(...)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication scheme"
        )
    
    token = authorization.split(" ")[1]
    try:
        res = database.supabase.auth.get_user(token)
        usr = res.user
        return User(id=usr.id, username=usr.user_metadata.get("username", ""))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        resp = database.supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        if hasattr(resp, "error") and resp.error:
            error_msg = getattr(resp.error, "message", "Invalid credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail=error_msg
            )
        
        session = resp.session
        if not session or not session.access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="No session returned"
            )
        
        return {"access_token": session.access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Login failed: {str(e)}"
        )


@router.post("/register", response_model=Message)
async def register_user(data: Register):
    try:
        resp = database.supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "username": data.username
                }
            }
        })
        
        if resp.user:
            return {"message": "User registered. Please check email to confirm."}
        else:
            err = getattr(resp, "error", None)
            detail = err.message if err else "Registration failed"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user