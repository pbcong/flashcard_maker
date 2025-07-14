import io
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pypdf import PdfReader

from ...models.models import FlashcardResponse, User
from ...services.services import (process_images_to_flashcards,
                                  process_text_to_flashcards)
from .auth import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/", response_model=FlashcardResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files were uploaded")
    
    images = []
    text_content = ""
    for file in files:
        try:
            content_type = file.content_type
            if content_type.startswith("image/"):
                content = await file.read()
                if len(content) == 0:
                    raise ValueError(f"File {file.filename} is empty")
                images.append(content)
            elif content_type == "application/pdf":
                content = await file.read()
                if len(content) == 0:
                    raise ValueError(f"File {file.filename} is empty")
                
                reader = PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    text_content += page.extract_text()
            elif content_type == "text/plain":
                content = await file.read()
                if len(content) == 0:
                    raise ValueError(f"File {file.filename} is empty")
                text_content += content.decode("utf-8")
            else:
                raise ValueError(f"Unsupported file type: {content_type}")
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Error processing file {file.filename}: {str(e)}"
            )
    
    try:
        if images:
            return await process_images_to_flashcards(images)
        elif text_content:
            return await process_text_to_flashcards(text_content)
        else:
            raise HTTPException(status_code=400, detail="No processable content found in files")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
