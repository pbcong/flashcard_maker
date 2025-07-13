import base64
import json
from typing import List

from openai import OpenAI

from ..core.config import settings
from ..models.models import Flashcard, FlashcardResponse
from .prompts import FLASHCARD_PROMPT, TRANSCRIPT_PROMPT

client = OpenAI(api_key=settings.openai_api_key)


def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


def create_transcript_messages(text_content: str, images: List[bytes]) -> List[dict]:
    messages = [{
        "role": "user",
        "content": [{
            "type": "text",
            "text": text_content
        }]
    }]
    
    for image in images:
        base64_image = image_to_base64(image)
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })
    
    return messages


def create_flashcard_message(content: str) -> dict:
    return {
        "role": "user",
        "content": [{
            "type": "text",
            "text": FLASHCARD_PROMPT.format(CONTENT=content),
        }],
    }


async def process_images_to_flashcards(images: List[bytes]) -> FlashcardResponse:
    transcript_prompt = create_transcript_messages(TRANSCRIPT_PROMPT, images)
    
    transcription = client.chat.completions.create(
        messages=transcript_prompt,
        model=settings.openai_model,
        max_tokens=1024
    )
    
    content = transcription.choices[0].message.content
    
    flashcard_prompt = create_flashcard_message(content)
    flashcards = client.chat.completions.create(
        model=settings.openai_model,
        messages=[flashcard_prompt],
        temperature=0.3,
        max_tokens=1024
    )
    
    flashcards_json = flashcards.choices[0].message.content
    if flashcards_json.startswith("```json"):
        flashcards_json = flashcards_json[7:-3]
    
    try:
        flashcards_data = json.loads(flashcards_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse flashcards data: {str(e)}")
    
    return FlashcardResponse(
        transcription=content,
        flashcards=[Flashcard(**card) for card in flashcards_data]
    )