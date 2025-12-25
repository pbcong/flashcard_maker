from typing import List, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from ...models.models import User
from ...services.pinyin_service import process_image_for_pinyin, check_tesseract_installation, process_text_for_pinyin
from .auth import get_current_user

router = APIRouter(prefix="/pinyin", tags=["Pinyin"])


class CharacterAnnotation(BaseModel):
    char: str
    pinyin: str
    index: int


class PinyinAnnotationResponse(BaseModel):
    text: str
    annotations: List[CharacterAnnotation]
    words: List[Dict[str, str]]  # For multi-character words


class SystemStatusResponse(BaseModel):
    tesseract_available: bool
    tesseract_status: str
    system_ready: bool
    message: str

class PinyinRequest(BaseModel):
    text: str

@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status():
    """
    Check if the system is ready for pinyin annotation (Tesseract installed, etc.)
    """
    tesseract_available, tesseract_status = check_tesseract_installation()
    
    return SystemStatusResponse(
        tesseract_available=tesseract_available,
        tesseract_status=tesseract_status,
        system_ready=tesseract_available,
        message="System ready for pinyin annotation" if tesseract_available else 
                "Tesseract OCR needs to be installed. See TESSERACT_INSTALLATION_GUIDE.md"
    )


@router.post("/annotate", response_model=PinyinAnnotationResponse)
async def annotate_image_with_pinyin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Process an uploaded image to extract Chinese text and generate pinyin annotations.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    content = await file.read()
    
    # Validate file size (10MB limit)
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    
    try:
        # Process the image
        result = await process_image_for_pinyin(content)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.post("/annotate-text", response_model=PinyinAnnotationResponse)
async def annotate_text_with_pinyin(
    request: PinyinRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Process a string of text to generate pinyin annotations.
    """
    try:
        result = process_text_for_pinyin(request.text)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")