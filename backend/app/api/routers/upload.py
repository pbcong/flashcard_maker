import io
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pypdf import PdfReader

from ...models.models import FlashcardResponse, User, GenerationConfig
from ...services.services import (process_images_to_flashcards,
                                  process_text_to_flashcards,
                                  FlashcardGenerationError)
from .auth import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/", response_model=FlashcardResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    back_language: Optional[str] = Form("english"),
    current_user: User = Depends(get_current_user)
):
    """
    Upload files (images, PDFs, text) to generate flashcards.
    
    Args:
        files: List of files to process
        back_language: Language for the back of cards ("english" or "vietnamese")
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files were uploaded")
    
    # Validate back_language
    if back_language not in ("english", "vietnamese"):
        back_language = "english"
    
    config = GenerationConfig(back_language=back_language)
    
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
            return await process_images_to_flashcards(images, config)
        elif text_content:
            return await process_text_to_flashcards(text_content, config)
        else:
            raise HTTPException(status_code=400, detail="No processable content found in files")
    except FlashcardGenerationError as e:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from pydantic import BaseModel

class TextGenerateRequest(BaseModel):
    text: str
    back_language: str = "english"


@router.post("/generate-text", response_model=FlashcardResponse)
async def generate_from_text(
    request: TextGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate flashcards from pasted text content.
    
    Args:
        request: Text content and language preference
    """
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text content is required")
    
    # Validate back_language
    back_language = request.back_language
    if back_language not in ("english", "vietnamese"):
        back_language = "english"
    
    config = GenerationConfig(back_language=back_language)
    
    try:
        return await process_text_to_flashcards(request.text, config)
    except FlashcardGenerationError as e:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
