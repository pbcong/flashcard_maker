"""Flashcard generation services using OpenRouter (google/gemini-3-flash-preview)."""

import base64
import json
from typing import List, Optional

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from ..core.config import settings
from ..models.models import Flashcard, FlashcardResponse, GenerationConfig
from .prompts import get_flashcard_prompt

# Initialize OpenRouter client (OpenAI-compatible API)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)


class FlashcardGenerationError(Exception):
    """Custom exception for flashcard generation errors."""
    pass


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def create_image_content(images: List[bytes]) -> List[dict]:
    """Create image content parts for the API request."""
    content = []
    for image in images:
        base64_image = image_to_base64(image)
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })
    return content


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=True
)
def call_openrouter_with_retry(
    messages: List[dict],
    config: Optional[GenerationConfig] = None
) -> str:
    """Call OpenRouter API with retry logic."""
    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=messages,
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    
    return response.choices[0].message.content


def parse_flashcards_response(response_text: str) -> List[Flashcard]:
    """Parse the JSON response into Flashcard objects."""
    text = response_text.strip()
    
    # Clean up response if wrapped in markdown
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        data = json.loads(text)
        
        # Handle both formats: {"flashcards": [...]} or just [...]
        if isinstance(data, dict) and "flashcards" in data:
            cards_data = data["flashcards"]
        elif isinstance(data, list):
            cards_data = data
        else:
            raise FlashcardGenerationError("Unexpected response format")
        
        return [Flashcard(front=card["front"], back=card["back"]) for card in cards_data]
    
    except json.JSONDecodeError as e:
        raise FlashcardGenerationError(f"Failed to parse flashcards JSON: {str(e)}")
    except KeyError as e:
        raise FlashcardGenerationError(f"Missing required field in flashcard: {str(e)}")


async def process_images_to_flashcards(
    images: List[bytes],
    config: Optional[GenerationConfig] = None
) -> FlashcardResponse:
    """Process images directly with VLM to generate flashcards."""
    gen_config = config or GenerationConfig()
    prompt = get_flashcard_prompt(gen_config.back_language)
    
    # Build content with images
    content = [{"type": "text", "text": prompt}]
    content.extend(create_image_content(images))
    
    messages = [{"role": "user", "content": content}]
    
    response_text = call_openrouter_with_retry(messages, config)
    flashcards = parse_flashcards_response(response_text)
    
    return FlashcardResponse(flashcards=flashcards)


async def process_text_to_flashcards(
    text_content: str,
    config: Optional[GenerationConfig] = None
) -> FlashcardResponse:
    """Process text content to generate flashcards."""
    gen_config = config or GenerationConfig()
    prompt = get_flashcard_prompt(gen_config.back_language)
    
    messages = [{
        "role": "user",
        "content": f"{prompt}\n\n{text_content}"
    }]
    
    response_text = call_openrouter_with_retry(messages, config)
    flashcards = parse_flashcards_response(response_text)
    
    return FlashcardResponse(flashcards=flashcards)