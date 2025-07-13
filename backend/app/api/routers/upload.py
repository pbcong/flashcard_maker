from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ...models.models import FlashcardResponse, User
from ...services.services import process_images_to_flashcards
from .auth import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/", response_model=FlashcardResponse)
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files were uploaded")
    
    images = []
    for file in files:
        try:
            content_type = file.content_type
            if not content_type or not content_type.startswith("image/"):
                raise ValueError(f"File {file.filename} is not an image")
            
            content = await file.read()
            if len(content) == 0:
                raise ValueError(f"File {file.filename} is empty")
            
            images.append(content)
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Error processing file {file.filename}: {str(e)}"
            )
    
    try:
        return await process_images_to_flashcards(images)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
